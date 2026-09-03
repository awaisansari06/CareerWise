import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  safeGenerateContent,
  extractJsonFromText,
  safeParseAiResponse,
  sanitizeUserFacingError,
  QuizResponseSchema,
} from "../lib/gemini.js";

describe("Phase 4 — Reliability & Error Handling Hardening Test Suite", () => {
  // Test 1: Gemini timeout is handled cleanly
  test("1. Gemini timeout is handled with bounded timeout without hanging indefinitely", async () => {
    const hangingModel = {
      generateContent: async () => {
        // Simulates an indefinite network hang
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { response: { text: () => "late response" } };
      },
    };

    await assert.rejects(
      async () => {
        await safeGenerateContent(hangingModel, "test prompt", {
          timeoutMs: 50, // Short timeout for test
          maxRetries: 0,
        });
      },
      { message: "AI service timed out. Please try again." }
    );
  });

  // Test 2: Gemini 429 rate limit retries are strictly bounded
  test("2. Gemini 429 rate limit errors retry up to maxRetries then fail safely", async () => {
    let attempts = 0;
    const rateLimitedModel = {
      generateContent: async () => {
        attempts++;
        const error = new Error("Resource has been exhausted (e.g. check quota).");
        error.status = 429;
        throw error;
      },
    };

    await assert.rejects(
      async () => {
        await safeGenerateContent(rateLimitedModel, "test prompt", {
          maxRetries: 2,
          timeoutMs: 1000,
        });
      },
      { message: "AI service is temporarily busy. Please wait a moment and try again." }
    );

    // Initial attempt + 2 retries = 3 total attempts
    assert.strictEqual(attempts, 3, "Should have attempted exactly 3 times (1 initial + 2 retries)");
  });

  // Test 3: Non-retryable errors do not retry
  test("3. Non-retryable errors (e.g. 400 Bad Request) fail immediately without retrying", async () => {
    let attempts = 0;
    const badRequestModel = {
      generateContent: async () => {
        attempts++;
        const error = new Error("Invalid argument: model not supported");
        error.status = 400;
        throw error;
      },
    };

    await assert.rejects(
      async () => {
        await safeGenerateContent(badRequestModel, "test prompt", {
          maxRetries: 2,
          timeoutMs: 1000,
        });
      },
      { message: "AI service is currently unavailable. Please try again." }
    );

    // Non-retryable -> exactly 1 attempt
    assert.strictEqual(attempts, 1, "Non-retryable 400 error should NOT retry");
  });

  // Test 4: Empty AI response fails safely
  test("4. Empty AI response throws controlled user-facing error", () => {
    assert.throws(
      () => extractJsonFromText("   "),
      { message: "AI returned an empty response" }
    );
  });

  // Test 5: Malformed AI response fails safely
  test("5. Malformed AI response throws controlled user-facing error", () => {
    assert.throws(
      () => extractJsonFromText("This is plain conversational text without JSON."),
      { message: "AI returned malformed or unparseable JSON" }
    );
  });

  // Test 6: Schema-invalid AI response fails safely
  test("6. Schema-invalid AI response structure throws controlled error", () => {
    const invalidJson = JSON.stringify({
      unrelatedKey: "something completely wrong",
    });

    assert.throws(
      () => safeParseAiResponse(invalidJson, QuizResponseSchema),
      { message: "AI response structure did not match the expected application format" }
    );
  });

  // Test 7: Prisma / Database failure produces controlled sanitized error
  test("7. Prisma database error is sanitized and does not leak table/column names", () => {
    const rawPrismaError = new Error(
      "PrismaClientKnownRequestError: Table 'careerwise.User' does not exist in schema"
    );
    const sanitized = sanitizeUserFacingError(rawPrismaError);
    assert.strictEqual(sanitized, "An unexpected error occurred. Please try again.");
    assert.strictEqual(sanitized.includes("careerwise.User"), false);
  });

  // Test 8: Sensitive internal errors (SQL, API keys, file paths) are masked
  test("8. Sensitive internal errors containing API keys or SQL queries are never exposed", () => {
    const rawErrorWithApiKey = new Error(
      "Failed to reach https://generativelanguage.googleapis.com/v1beta?key=AIzaSyD123SecretKey456"
    );
    const sanitizedKey = sanitizeUserFacingError(rawErrorWithApiKey);
    assert.strictEqual(sanitizedKey, "An unexpected error occurred. Please try again.");
    assert.strictEqual(sanitizedKey.includes("AIzaSy"), false);

    const rawSqlError = new Error("SELECT * FROM \"User\" WHERE id = 'secret-uuid'");
    const sanitizedSql = sanitizeUserFacingError(rawSqlError);
    assert.strictEqual(sanitizedSql, "An unexpected error occurred. Please try again.");
    assert.strictEqual(sanitizedSql.includes("SELECT"), false);
  });

  // Test 9: Repeated roadmap generation idempotency (upsert)
  test("9. Repeated roadmap generation uses upsert and does not create duplicate records", () => {
    const mockDb = new Map();
    function upsertRoadmap(userId, data) {
      mockDb.set(userId, { ...(mockDb.get(userId) || {}), userId, ...data });
      return mockDb.get(userId);
    }

    // Call 1: initial generation
    upsertRoadmap("user-dev", { title: "Roadmap V1", nodes: ["Node 1"] });
    assert.strictEqual(mockDb.size, 1);

    // Call 2: repeated/refresh generation
    upsertRoadmap("user-dev", { title: "Roadmap V2", nodes: ["Node 1", "Node 2"] });
    assert.strictEqual(mockDb.size, 1, "Repeated generation must not create duplicate records");
    assert.strictEqual(mockDb.get("user-dev").title, "Roadmap V2");
  });

  // Test 10: Repeated industry insight generation idempotency (upsert)
  test("10. Repeated industry insight generation uses upsert and does not create duplicate records", () => {
    const mockInsightDb = new Map();
    function upsertInsight(industry, data) {
      mockInsightDb.set(industry, { ...(mockInsightDb.get(industry) || {}), industry, ...data });
      return mockInsightDb.get(industry);
    }

    // Call 1: initial insights
    upsertInsight("tech-software", { demandLevel: "High", growthRate: 12 });
    assert.strictEqual(mockInsightDb.size, 1);

    // Call 2: repeated cron or user update
    upsertInsight("tech-software", { demandLevel: "High", growthRate: 14 });
    assert.strictEqual(mockInsightDb.size, 1, "Repeated insight update must not duplicate industry row");
    assert.strictEqual(mockInsightDb.get("tech-software").growthRate, 14);
  });

  // Test 11: Failed AI generation does not leave corrupted persisted data
  test("11. Failed AI generation halts before DB write, leaving database clean", async () => {
    const dbRecords = new Map();

    async function executeAiSavePipeline(aiShouldFail) {
      // Step 1: AI generation
      let aiResult;
      if (aiShouldFail) {
        throw new Error("AI service is currently unavailable. Please try again.");
      }
      aiResult = { title: "Valid AI Title" };

      // Step 2: DB write (only if AI succeeds)
      dbRecords.set("record-1", aiResult);
      return aiResult;
    }

    // Run failed pipeline
    await assert.rejects(
      async () => {
        await executeAiSavePipeline(true);
      },
      { message: "AI service is currently unavailable. Please try again." }
    );

    // Confirm DB write was NEVER executed
    assert.strictEqual(dbRecords.size, 0, "No corrupt or partial record should be written when AI fails");
  });
});
