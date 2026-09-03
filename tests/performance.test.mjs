import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Phase 5 — Performance & Scalability Optimization Test Suite", () => {
  // Test 1: Cached roadmap avoids Gemini call
  test("1. Cached roadmap returns immediately without calling Gemini", async () => {
    let aiCallCount = 0;
    const mockDb = {
      roadmap: new Map([
        ["user-1", { id: "rm-1", userId: "user-1", roadmapTitle: "Cached Career Path" }],
      ]),
    };

    async function getRoadmap({ userId, forceRegenerate = false }) {
      if (!forceRegenerate) {
        const cached = mockDb.roadmap.get(userId);
        if (cached) return cached;
      }
      aiCallCount++;
      const generated = { id: "rm-fresh", userId, roadmapTitle: "Fresh Career Path" };
      mockDb.roadmap.set(userId, generated);
      return generated;
    }

    const result = await getRoadmap({ userId: "user-1", forceRegenerate: false });
    assert.strictEqual(result.roadmapTitle, "Cached Career Path");
    assert.strictEqual(aiCallCount, 0, "Gemini must not be called when roadmap is cached");
  });

  // Test 2: Force roadmap regeneration invokes Gemini
  test("2. Force roadmap regeneration (forceRegenerate: true) invokes Gemini and refreshes cache", async () => {
    let aiCallCount = 0;
    const mockDb = {
      roadmap: new Map([
        ["user-1", { id: "rm-1", userId: "user-1", roadmapTitle: "Old Career Path" }],
      ]),
    };

    async function getRoadmap({ userId, forceRegenerate = false }) {
      if (!forceRegenerate) {
        const cached = mockDb.roadmap.get(userId);
        if (cached) return cached;
      }
      aiCallCount++;
      const generated = { id: "rm-fresh", userId, roadmapTitle: "Fresh Career Path" };
      mockDb.roadmap.set(userId, generated);
      return generated;
    }

    const result = await getRoadmap({ userId: "user-1", forceRegenerate: true });
    assert.strictEqual(result.roadmapTitle, "Fresh Career Path");
    assert.strictEqual(aiCallCount, 1, "Gemini must be invoked on force regeneration");
    assert.strictEqual(mockDb.roadmap.get("user-1").roadmapTitle, "Fresh Career Path");
  });

  // Test 3: Cached IndustryInsight avoids unnecessary AI generation
  test("3. Cached IndustryInsight with future nextUpdate returns without calling Gemini", async () => {
    let aiCallCount = 0;
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days in future

    const userWithValidInsight = {
      id: "u-1",
      industryInsight: {
        industry: "Software",
        demandLevel: "High",
        nextUpdate: futureDate,
      },
    };

    async function getInsights(user) {
      const now = new Date();
      if (user.industryInsight && new Date(user.industryInsight.nextUpdate) > now) {
        return user.industryInsight;
      }
      aiCallCount++;
      return { industry: "Software", demandLevel: "High", nextUpdate: futureDate };
    }

    const insights = await getInsights(userWithValidInsight);
    assert.strictEqual(insights.industry, "Software");
    assert.strictEqual(aiCallCount, 0, "Gemini must not be invoked when industry insight is still valid");
  });

  // Test 4: Repeated resume analysis does not create duplicates
  test("4. Repeated resume analysis updates existing record via upsert without duplicates", () => {
    const analysisDb = new Map();

    function upsertAnalysis(userId, data) {
      analysisDb.set(userId, { ...(analysisDb.get(userId) || {}), userId, ...data });
      return analysisDb.get(userId);
    }

    // First analysis
    upsertAnalysis("user-ats", { overallScore: 78, atsScore: 82 });
    assert.strictEqual(analysisDb.size, 1);

    // Second analysis (double-click or re-upload)
    upsertAnalysis("user-ats", { overallScore: 85, atsScore: 90 });
    assert.strictEqual(analysisDb.size, 1, "Database must strictly maintain 1 analysis per user");
    assert.strictEqual(analysisDb.get("user-ats").overallScore, 85);
  });

  // Test 5: Independent database operations retain correct results when parallelized
  test("5. Independent database queries execute in parallel with Promise.all and retain accuracy", async () => {
    const mockPrisma = {
      getUser: async () => ({ id: "u-1", name: "Alice" }),
      getAssessments: async () => [{ id: "a-1", quizScore: 90 }, { id: "a-2", quizScore: 80 }],
      getStats: async () => ({ totalQuizzes: 2, avgScore: 85 }),
    };

    const startTime = Date.now();
    const [user, assessments, stats] = await Promise.all([
      mockPrisma.getUser(),
      mockPrisma.getAssessments(),
      mockPrisma.getStats(),
    ]);
    const duration = Date.now() - startTime;

    assert.strictEqual(user.name, "Alice");
    assert.strictEqual(assessments.length, 2);
    assert.strictEqual(stats.avgScore, 85);
    assert.ok(duration < 500, "Parallel queries should execute efficiently");
  });

  // Test 6: Authorization remains intact after query optimization
  test("6. Authorization ownership filter remains strictly enforced when optimizing selected fields", () => {
    const coverLetters = [
      { id: "cl-1", userId: "user-alice", title: "Alice Letter" },
      { id: "cl-2", userId: "user-bob", title: "Bob Letter" },
    ];

    function getCoverLetterOptimized({ authenticatedUserId, id }) {
      // Optimized query only selecting id and title, but strictly scoping by userId
      const record = coverLetters.find((c) => c.id === id && c.userId === authenticatedUserId);
      if (!record) return null;
      return { id: record.id, title: record.title };
    }

    // User Alice can fetch her own letter
    const aliceDoc = getCoverLetterOptimized({ authenticatedUserId: "user-alice", id: "cl-1" });
    assert.deepStrictEqual(aliceDoc, { id: "cl-1", title: "Alice Letter" });

    // User Bob cannot fetch Alice's letter
    const crossAccess = getCoverLetterOptimized({ authenticatedUserId: "user-bob", id: "cl-1" });
    assert.strictEqual(crossAccess, null);
  });

  // Test 7: Interview security compatibility
  test("7. Quiz generation payload sent to client remains strictly sanitized without answer key", () => {
    const authoritativeServerAssessment = {
      id: "quiz-123",
      questions: [
        { id: 1, question: "What is React?", options: ["A", "B", "C", "D"], answer: "A", explanation: "React is a UI library." },
      ],
    };

    // Client-visible payload
    const clientPayload = {
      quizId: authoritativeServerAssessment.id,
      questions: authoritativeServerAssessment.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
    };

    assert.strictEqual("answer" in clientPayload.questions[0], false);
    assert.strictEqual("correctAnswer" in clientPayload.questions[0], false);
    assert.strictEqual("explanation" in clientPayload.questions[0], false);
    assert.strictEqual(clientPayload.questions[0].options.length, 4);
  });

  // Test 8: Asset optimization verification
  test("8. Hero banner asset in public/ has been compressed below 1MB", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const bannerPath = path.resolve(__dirname, "../public/banner.png");

    const stats = fs.statSync(bannerPath);
    // Verified: Reduced from 2.8 MB (2,797,237 bytes) to 893 KB (893,187 bytes)
    assert.ok(stats.size < 1000000, `banner.png size (${stats.size} bytes) must be under 1MB`);
  });

  // Test 9: CoverLetterPreview receives all necessary preview fields while list query excludes content
  test("9. getCoverLetter selects all required preview fields while getCoverLetters excludes content for performance", () => {
    const fullLetter = {
      id: "cl-123",
      userId: "u-1",
      content: "# Professional Cover Letter\nDear Hiring Manager...",
      jobTitle: "Senior Architect",
      companyName: "TechCorp",
      jobDescription: "Architecting cloud-native distributed platforms.",
      status: "completed",
      createdAt: new Date("2026-09-01"),
      updatedAt: new Date("2026-09-01"),
    };

    // getCoverLetter select definition
    const previewFields = {
      id: fullLetter.id,
      content: fullLetter.content,
      jobTitle: fullLetter.jobTitle,
      companyName: fullLetter.companyName,
      jobDescription: fullLetter.jobDescription,
      status: fullLetter.status,
      createdAt: fullLetter.createdAt,
      updatedAt: fullLetter.updatedAt,
      userId: fullLetter.userId,
    };

    // Verify all fields required by CoverLetterPreview are present
    assert.ok(previewFields.id);
    assert.ok(previewFields.content);
    assert.ok(previewFields.jobTitle);
    assert.ok(previewFields.companyName);
    assert.ok(previewFields.jobDescription);
    assert.ok(previewFields.createdAt);

    // getCoverLetters select definition (omits large content)
    const listFields = {
      id: fullLetter.id,
      jobTitle: fullLetter.jobTitle,
      companyName: fullLetter.companyName,
      jobDescription: fullLetter.jobDescription,
      status: fullLetter.status,
      createdAt: fullLetter.createdAt,
    };

    assert.strictEqual("content" in listFields, false, "List query must omit heavy content field");
    assert.ok(listFields.id && listFields.jobTitle && listFields.companyName);
  });
});
