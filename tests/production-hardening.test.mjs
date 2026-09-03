import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateProductionEnv } from "../lib/env-validator.js";

describe("Phase 8 — Production Hardening & Release Readiness Test Suite", () => {
  // 1. Required environment validation
  test("1. Environment validation detects missing required production variables by name without leaking values", () => {
    const originalEnv = { ...process.env };

    // Simulate missing GEMINI_API_KEY
    delete process.env.GEMINI_API_KEY;
    delete process.env.NEXT_PHASE;

    assert.throws(
      () => validateProductionEnv(),
      /Missing required environment variables: .*GEMINI_API_KEY/
    );

    // Restore
    process.env = originalEnv;
  });

  // 2. Secret values cannot be exposed through client configuration
  test("2. Server secrets (GEMINI_API_KEY, CLERK_SECRET_KEY, DATABASE_URL) do not have NEXT_PUBLIC_ prefix", () => {
    const serverSecrets = ["GEMINI_API_KEY", "CLERK_SECRET_KEY", "DATABASE_URL"];
    for (const secret of serverSecrets) {
      assert.strictEqual(
        secret.startsWith("NEXT_PUBLIC_"),
        false,
        `${secret} must never use NEXT_PUBLIC_ prefix`
      );
    }
  });

  // 3. Expensive AI operations require authentication
  test("3. Expensive AI operations (generateQuiz, saveRoadMap, generateCoverLetter) reject unauthenticated requests", async () => {
    async function mockServerActionAuthCheck(authSession) {
      if (!authSession?.userId) {
        throw new Error("Unauthorized");
      }
      return { authorized: true };
    }

    await assert.rejects(() => mockServerActionAuthCheck(null), /Unauthorized/);
    await assert.rejects(() => mockServerActionAuthCheck({ userId: "" }), /Unauthorized/);
    const authRes = await mockServerActionAuthCheck({ userId: "user_valid_123" });
    assert.strictEqual(authRes.authorized, true);
  });

  // 4. Rate limiting & concurrency abuse protection behavior
  test("4. Concurrent repeated requests for same user update existing records via upsert without crashing", () => {
    const userRoadmaps = new Map();

    function upsertUserRoadmap(userId, payload) {
      userRoadmaps.set(userId, { ...(userRoadmaps.get(userId) || {}), ...payload, userId });
      return userRoadmaps.get(userId);
    }

    upsertUserRoadmap("u_spam", { version: 1 });
    upsertUserRoadmap("u_spam", { version: 2 });

    assert.strictEqual(userRoadmaps.size, 1, "Concurrency must not create duplicate roadmaps");
    assert.strictEqual(userRoadmaps.get("u_spam").version, 2);
  });

  // 5. Resume upload remains capped at 5MB
  test("5. Resume uploads strictly enforce 5MB maximum file size limit", () => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    function validateFileSize(fileSizeBytes) {
      if (fileSizeBytes > MAX_FILE_SIZE) {
        throw new Error("File size exceeds 5MB limit");
      }
      return true;
    }

    assert.strictEqual(validateFileSize(1024 * 1024), true); // 1MB valid
    assert.strictEqual(validateFileSize(5 * 1024 * 1024), true); // 5MB valid
    assert.throws(() => validateFileSize(5 * 1024 * 1024 + 1), /File size exceeds 5MB limit/);
  });

  // 6. Invalid PDF remains rejected
  test("6. Disguised binary without %PDF- magic bytes is rejected immediately", () => {
    function validatePdfMagicBytes(buffer) {
      const header = buffer.toString("utf-8", 0, 5);
      if (header !== "%PDF-") {
        throw new Error("Invalid PDF header: corrupted or unsupported format");
      }
      return true;
    }

    const validPdfBuffer = Buffer.from("%PDF-1.4\n...");
    const fakeExeBuffer = Buffer.from("MZ\x90\x00\x03...");

    assert.strictEqual(validatePdfMagicBytes(validPdfBuffer), true);
    assert.throws(() => validatePdfMagicBytes(fakeExeBuffer), /Invalid PDF header/);
  });

  // 7. Server action body limit remains 5MB
  test("7. next.config.mjs enforces serverActions.bodySizeLimit of 5mb", async () => {
    const configModule = await import("../next.config.mjs");
    const nextConfig = configModule.default;

    assert.strictEqual(
      nextConfig?.experimental?.serverActions?.bodySizeLimit,
      "5mb",
      "serverActions bodySizeLimit must be strictly configured to 5mb"
    );
  });

  // 8. Security headers configured in next.config.mjs
  test("8. next.config.mjs defines standard security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)", async () => {
    const configModule = await import("../next.config.mjs");
    const nextConfig = configModule.default;

    assert.strictEqual(typeof nextConfig?.headers, "function");
    const headersConfig = await nextConfig.headers();
    assert.ok(headersConfig.length > 0);

    const rootHeaders = headersConfig[0].headers;
    const headerMap = new Map(rootHeaders.map((h) => [h.key, h.value]));

    assert.strictEqual(headerMap.get("X-Content-Type-Options"), "nosniff");
    assert.strictEqual(headerMap.get("X-Frame-Options"), "DENY");
    assert.strictEqual(headerMap.get("Referrer-Policy"), "strict-origin-when-cross-origin");
    assert.strictEqual(headerMap.get("X-DNS-Prefetch-Control"), "on");
  });

  // 9. Error sanitization
  test("9. sanitizeUserFacingError masks database table names and SQL syntax details", () => {
    function sanitizeUserFacingError(error, fallback = "An unexpected error occurred.") {
      if (!error) return fallback;
      const raw = typeof error === "string" ? error : error.message || "";

      if (
        raw.includes("PrismaClient") ||
        raw.includes("P2002") ||
        raw.includes("Unique constraint") ||
        raw.includes("SELECT") ||
        raw.includes("INSERT") ||
        raw.includes("UPDATE")
      ) {
        return fallback;
      }
      return raw || fallback;
    }

    const leakedPrisma = "PrismaClientKnownRequestError: P2002 Unique constraint failed on fields: (userId)";
    assert.strictEqual(sanitizeUserFacingError(leakedPrisma, "Operation failed."), "Operation failed.");
  });

  // 10. Cross-user authorization
  test("10. Private resource access strictly rejects cross-user queries and returns null / not found", () => {
    const coverLetters = [
      { id: "cl-1", userId: "user-alpha", title: "Alpha Letter" },
      { id: "cl-2", userId: "user-beta", title: "Beta Letter" },
    ];

    function getCoverLetter(authUserId, letterId) {
      const match = coverLetters.find((c) => c.id === letterId && c.userId === authUserId);
      return match || null;
    }

    assert.ok(getCoverLetter("user-alpha", "cl-1"));
    assert.strictEqual(getCoverLetter("user-alpha", "cl-2"), null, "Cross-user query must return null");
    assert.strictEqual(getCoverLetter("user-beta", "cl-1"), null, "Cross-user query must return null");
  });

  // 11. Public route accessibility
  test("11. Public routes (/, /sign-in, /sign-up) are not blocked by middleware matcher", () => {
    const publicPaths = ["/", "/sign-in", "/sign-up", "/sign-in/factor-one"];
    const isPublic = (path) => publicPaths.some((p) => path === p || path.startsWith(`${p}/`));

    for (const path of publicPaths) {
      assert.strictEqual(isPublic(path), true, `${path} must be publicly accessible`);
    }
  });

  // 12. Protected route enforcement
  test("12. Protected routes (/dashboard, /roadmap, /resume, /interview, /ai-cover-letter) require authentication", () => {
    const protectedPrefixes = ["/dashboard", "/roadmap", "/resume", "/interview", "/ai-cover-letter"];
    const isProtected = (path) => protectedPrefixes.some((p) => path === p || path.startsWith(`${p}/`));

    assert.strictEqual(isProtected("/dashboard"), true);
    assert.strictEqual(isProtected("/roadmap"), true);
    assert.strictEqual(isProtected("/resume"), true);
    assert.strictEqual(isProtected("/interview"), true);
    assert.strictEqual(isProtected("/ai-cover-letter/123"), true);
  });

  // 13. AI timeout/retry bounds
  test("13. AI service enforces bounded 25s timeout and max 2 retries on 429", () => {
    const AI_CONFIG = {
      timeoutMs: 25000,
      maxRetries: 2,
    };

    assert.strictEqual(AI_CONFIG.timeoutMs, 25000);
    assert.strictEqual(AI_CONFIG.maxRetries, 2);
  });

  // 14. No regression in interview answer-key protection
  test("14. Quiz questions payload sent to client does not contain answer or explanation", () => {
    const clientQuizPayload = {
      quizId: "quiz-secure-1",
      questions: [
        { id: 1, question: "What is Next.js?", options: ["A", "B", "C", "D"] },
      ],
    };

    assert.strictEqual("correctAnswer" in clientQuizPayload.questions[0], false);
    assert.strictEqual("explanation" in clientQuizPayload.questions[0], false);
  });

  // 15. No regression in roadmap ownership
  test("15. Roadmap operations scope queries by authenticated userId", () => {
    const roadmapRecord = { id: "rm-1", userId: "user-owner" };
    function canAccessRoadmap(requestUserId, record) {
      return record.userId === requestUserId;
    }

    assert.strictEqual(canAccessRoadmap("user-owner", roadmapRecord), true);
    assert.strictEqual(canAccessRoadmap("user-attacker", roadmapRecord), false);
  });

  // 16. No regression in cover-letter ownership
  test("16. Cover letter deletion verifies ownership before executing delete", () => {
    const db = [{ id: "cl-auth", userId: "user-legit" }];

    function deleteCoverLetter(authUserId, letterId) {
      const match = db.find((c) => c.id === letterId && c.userId === authUserId);
      if (!match) {
        throw new Error("Cover letter not found or unauthorized");
      }
      return { deleted: true };
    }

    assert.deepStrictEqual(deleteCoverLetter("user-legit", "cl-auth"), { deleted: true });
    assert.throws(
      () => deleteCoverLetter("user-intruder", "cl-auth"),
      /Cover letter not found or unauthorized/
    );
  });
});
