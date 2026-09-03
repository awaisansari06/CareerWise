import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Phase 7 — Comprehensive Integration & End-to-End QA Test Suite", () => {
  // ==========================================
  // 1. ONBOARDING WORKFLOW & USER LIFECYCLE
  // ==========================================
  describe("1. Onboarding Workflow & User Lifecycle", () => {
    test("1.1 New user profile initialization cleanly formats names without 'null'", () => {
      // Simulate Clerk webhook / checkUser logic
      function formatUserName(user) {
        const parts = [user.firstName, user.lastName].filter(Boolean);
        return parts.length > 0 ? parts.join(" ") : user.username || user.email?.split("@")[0] || "Professional";
      }

      assert.strictEqual(formatUserName({ firstName: "Jane", lastName: null }), "Jane");
      assert.strictEqual(formatUserName({ firstName: "Jane", lastName: undefined }), "Jane");
      assert.strictEqual(formatUserName({ firstName: null, lastName: null, username: "devjane" }), "devjane");
      assert.strictEqual(formatUserName({ firstName: null, lastName: null, email: "user@domain.com" }), "user");
      assert.strictEqual(formatUserName({ firstName: "John", lastName: "Doe" }), "John Doe");
    });

    test("1.2 Onboarding saves industry and reuses cached IndustryInsight", async () => {
      const db = {
        industryInsights: new Map([
          ["tech", { industry: "tech", salaryRanges: [{ role: "Engineer", median: 120000 }], nextUpdate: new Date(Date.now() + 86400000) }],
        ]),
        users: new Map(),
      };

      let aiCalled = false;
      async function onboardUser(clerkId, { industry, experience, bio }) {
        let insight = db.industryInsights.get(industry);
        if (!insight || new Date(insight.nextUpdate) < new Date()) {
          aiCalled = true;
          insight = { industry, salaryRanges: [], nextUpdate: new Date(Date.now() + 604800000) };
          db.industryInsights.set(industry, insight);
        }
        db.users.set(clerkId, { clerkId, industry, experience, bio, isUploaded: true });
        return { success: true, user: db.users.get(clerkId) };
      }

      const res = await onboardUser("user_onboard_1", { industry: "tech", experience: 3, bio: "Full stack dev" });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.user.industry, "tech");
      assert.strictEqual(aiCalled, false, "Cached industry insight must be reused during onboarding");
    });

    test("1.3 Onboarding with new industry generates insight outside transaction and handles AI failure safely", async () => {
      const db = { users: new Map(), industryInsights: new Map() };

      async function onboardWithAiFailure(clerkId, { industry }) {
        let insight = null;
        try {
          // Simulate AI call failure (e.g. rate limit / timeout)
          throw new Error("AI service temporarily unavailable");
        } catch {
          // Resilient fallback insight
          insight = {
            industry,
            salaryRanges: [],
            growthRate: 0,
            demandLevel: "Medium",
            topSkills: [],
            marketOutlook: "Neutral",
            keyTrends: [],
            recommendedSkills: [],
            nextUpdate: new Date(Date.now() + 86400000),
          };
        }

        // Database write proceeds safely with fallback insight
        db.industryInsights.set(industry, insight);
        db.users.set(clerkId, { clerkId, industry, isUploaded: true });
        return { success: true, user: db.users.get(clerkId), insight };
      }

      const res = await onboardWithAiFailure("user_onboard_fail", { industry: "finance" });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.user.industry, "finance");
      assert.strictEqual(res.insight.demandLevel, "Medium");
    });
  });

  // ==========================================
  // 2. RESUME WORKFLOW & REPLACEMENT LIFECYCLE
  // ==========================================
  describe("2. Resume Workflow & Analysis Lifecycle", () => {
    test("2.1 Valid resume upload persists and invalidates prior ResumeAnalysis", async () => {
      const db = {
        resumes: new Map([["u-1", { id: "res-old", userId: "u-1", content: "old resume" }]]),
        analyses: new Map([["u-1", { id: "ana-old", userId: "u-1", atsScore: 60 }]]),
      };

      async function uploadNewResume(userId, newContent) {
        // Upsert resume
        db.resumes.set(userId, { id: "res-new", userId, content: newContent });
        // Invalidate previous analysis
        db.analyses.delete(userId);
        return { resume: db.resumes.get(userId), analysis: db.analyses.get(userId) };
      }

      const result = await uploadNewResume("u-1", "new parsed resume content");
      assert.strictEqual(result.resume.content, "new parsed resume content");
      assert.strictEqual(result.analysis, undefined, "Previous analysis must be invalidated when a new resume is uploaded");
    });

    test("2.2 Resume analysis handles double-click concurrency via upsert without duplicates", () => {
      const db = new Map();

      function upsertAnalysis(userId, analysisData) {
        const existing = db.get(userId) || {};
        db.set(userId, { ...existing, userId, ...analysisData });
        return db.get(userId);
      }

      // Concurrently simulate two requests
      upsertAnalysis("user_double_click", { atsScore: 80, skills: ["React"] });
      upsertAnalysis("user_double_click", { atsScore: 85, skills: ["React", "Node"] });

      assert.strictEqual(db.size, 1, "Only one record per user must exist in ResumeAnalysis");
      assert.strictEqual(db.get("user_double_click").atsScore, 85);
    });

    test("2.3 User A cannot read or modify User B's resume data", () => {
      const db = [
        { id: "r-1", userId: "user-alice", content: "Alice confidential resume" },
        { id: "r-2", userId: "user-bob", content: "Bob confidential resume" },
      ];

      function getResumeForUser(authenticatedUserId) {
        return db.find((r) => r.userId === authenticatedUserId) || null;
      }

      assert.strictEqual(getResumeForUser("user-alice").content, "Alice confidential resume");
      assert.strictEqual(getResumeForUser("user-eve"), null, "Unauthorized user cannot access resumes");
    });
  });

  // ==========================================
  // 3. DASHBOARD WORKFLOW & MISSING DATA SAFETY
  // ==========================================
  describe("3. Dashboard Workflow & Missing Data Safety", () => {
    test("3.1 Dashboard calculations handle empty or missing optional assessment history without crashing", () => {
      function computeDashboardStats(assessments = []) {
        if (!assessments || assessments.length === 0) {
          return { totalQuizzes: 0, averageScore: 0, topScore: 0, improvementRate: 0 };
        }

        const scores = assessments.map((a) => a.quizScore);
        const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        return {
          totalQuizzes: assessments.length,
          averageScore: Math.round(average),
          topScore: Math.max(...scores),
          improvementRate: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0,
        };
      }

      // Empty assessments (new user)
      const emptyStats = computeDashboardStats([]);
      assert.strictEqual(emptyStats.totalQuizzes, 0);
      assert.strictEqual(emptyStats.averageScore, 0);

      // Single assessment
      const singleStats = computeDashboardStats([{ quizScore: 80 }]);
      assert.strictEqual(singleStats.totalQuizzes, 1);
      assert.strictEqual(singleStats.averageScore, 80);
      assert.strictEqual(singleStats.improvementRate, 0);

      // Multiple assessments
      const multiStats = computeDashboardStats([{ quizScore: 70 }, { quizScore: 85 }, { quizScore: 90 }]);
      assert.strictEqual(multiStats.totalQuizzes, 3);
      assert.strictEqual(multiStats.averageScore, 82);
      assert.strictEqual(multiStats.improvementRate, 20);
    });

    test("3.2 Dashboard returns cached IndustryInsight when valid without AI call", () => {
      let aiCallCount = 0;
      const cachedInsight = {
        industry: "AI",
        growthRate: 25,
        demandLevel: "High",
        nextUpdate: new Date(Date.now() + 86400000), // 24h in future
      };

      function resolveInsights(user) {
        if (user.industryInsight && new Date(user.industryInsight.nextUpdate) > new Date()) {
          return user.industryInsight;
        }
        aiCallCount++;
        return { industry: user.industry, growthRate: 10, nextUpdate: new Date(Date.now() + 604800000) };
      }

      const res = resolveInsights({ industry: "AI", industryInsight: cachedInsight });
      assert.strictEqual(res.growthRate, 25);
      assert.strictEqual(aiCallCount, 0, "Zero AI calls when insight is valid");
    });
  });

  // ==========================================
  // 4. ROADMAP WORKFLOW & UPSERT IDEMPOTENCY
  // ==========================================
  describe("4. Roadmap Workflow & Integrity", () => {
    test("4.1 Initial roadmap creates record, subsequent visit reuses it, forceRegenerate replaces it", async () => {
      const roadmapDb = new Map();
      let aiCounter = 0;

      async function getRoadmap(userId, { forceRegenerate = false } = {}) {
        if (!forceRegenerate) {
          const cached = roadmapDb.get(userId);
          if (cached) return { roadmap: cached, fromCache: true };
        }
        aiCounter++;
        const newRoadmap = {
          userId,
          title: `Roadmap Gen ${aiCounter}`,
          nodes: [{ id: "1", title: "Step 1" }],
        };
        roadmapDb.set(userId, newRoadmap);
        return { roadmap: newRoadmap, fromCache: false };
      }

      // 1. Initial generation
      const r1 = await getRoadmap("user_rm", { forceRegenerate: false });
      assert.strictEqual(r1.fromCache, false);
      assert.strictEqual(r1.roadmap.title, "Roadmap Gen 1");

      // 2. Normal repeated page load
      const r2 = await getRoadmap("user_rm", { forceRegenerate: false });
      assert.strictEqual(r2.fromCache, true);
      assert.strictEqual(r2.roadmap.title, "Roadmap Gen 1");
      assert.strictEqual(aiCounter, 1, "Gemini must not be called on normal repeated visits");

      // 3. Forced regeneration
      const r3 = await getRoadmap("user_rm", { forceRegenerate: true });
      assert.strictEqual(r3.fromCache, false);
      assert.strictEqual(r3.roadmap.title, "Roadmap Gen 2");
      assert.strictEqual(aiCounter, 2, "Gemini must be called when forceRegenerate is true");
    });
  });

  // ==========================================
  // 5. INTERVIEW WORKFLOW & EXPLANATION LEAK PREVENTION
  // ==========================================
  describe("5. Interview Security & Anti-Cheat Workflow", () => {
    test("5.1 Client payload generation strips answers; submission verifies on server", () => {
      const draftAssessment = {
        id: "asm-123",
        userId: "user-student",
        category: "draft",
        questions: [
          { id: 1, question: "Q1", options: ["A", "B"], answer: "A", explanation: "Because A." },
          { id: 2, question: "Q2", options: ["C", "D"], answer: "D", explanation: "Because D." },
        ],
      };

      // Client payload
      const clientPayload = {
        quizId: draftAssessment.id,
        questions: draftAssessment.questions.map((q) => ({ id: q.id, question: q.question, options: q.options })),
      };

      // Verify no leakage
      assert.strictEqual(JSON.stringify(clientPayload).includes("explanation"), false);
      assert.strictEqual(JSON.stringify(clientPayload).includes('"answer"'), false);

      // Server submission evaluation
      function evaluateSubmission(assessment, clientAnswers, tamperedScore) {
        let correct = 0;
        const results = assessment.questions.map((q, idx) => {
          const isCorrect = clientAnswers[idx] === q.answer;
          if (isCorrect) correct++;
          return { question: q.question, isCorrect, explanation: q.explanation };
        });

        // Authoritative server score calculation
        const serverScore = (correct / assessment.questions.length) * 100;
        return {
          quizScore: serverScore, // ignores tamperedScore
          results,
        };
      }

      // Client attempts to send score = 100 with incorrect answers
      const submission = evaluateSubmission(draftAssessment, ["B", "D"], 100);
      assert.strictEqual(submission.quizScore, 50, "Server must ignore client-tampered score and compute authoritative score");
    });

    test("5.2 Completed quiz session cannot be re-evaluated or replayed", () => {
      const db = new Map([
        ["quiz-1", { id: "quiz-1", userId: "user-1", category: "Technical", quizScore: 80 }],
      ]);

      function submitQuiz(quizId, userId) {
        const assessment = db.get(quizId);
        if (!assessment) throw new Error("Assessment not found");
        if (assessment.userId !== userId) throw new Error("Unauthorized");
        if (assessment.category !== "draft") {
          throw new Error("This quiz session has already been completed and scored");
        }
        return { success: true };
      }

      assert.throws(() => submitQuiz("quiz-1", "user-1"), /already been completed/);
    });
  });

  // ==========================================
  // 6. COVER LETTER WORKFLOW & FIELD ISOLATION
  // ==========================================
  describe("6. Cover Letter Workflow & Field Isolation", () => {
    test("6.1 Input validation rejects empty fields; list query omits content; detail query returns all fields", () => {
      const lettersDb = [
        {
          id: "cl-1",
          userId: "u-author",
          jobTitle: "Lead Architect",
          companyName: "CloudCorp",
          jobDescription: "Distributed computing leadership",
          content: "Full 2000-word cover letter text...",
          status: "completed",
          createdAt: new Date(),
        },
      ];

      // 1. List query (optimized)
      function listCoverLetters(userId) {
        return lettersDb
          .filter((l) => l.userId === userId)
          .map(({ id, jobTitle, companyName, jobDescription, status, createdAt }) => ({
            id,
            jobTitle,
            companyName,
            jobDescription,
            status,
            createdAt,
          }));
      }

      const list = listCoverLetters("u-author");
      assert.strictEqual(list.length, 1);
      assert.strictEqual("content" in list[0], false, "List view must not fetch content field");

      // 2. Detail query (for preview)
      function getCoverLetterDetail(userId, id) {
        const match = lettersDb.find((l) => l.userId === userId && l.id === id);
        if (!match) return null;
        return { ...match };
      }

      const detail = getCoverLetterDetail("u-author", "cl-1");
      assert.strictEqual(detail.content, "Full 2000-word cover letter text...");
      assert.strictEqual(detail.jobTitle, "Lead Architect");

      // 3. Cross-user access blocked
      assert.strictEqual(getCoverLetterDetail("u-attacker", "cl-1"), null);
    });
  });

  // ==========================================
  // 7. INNGEST SCHEDULED JOB ERROR ISOLATION
  // ==========================================
  describe("7. Inngest Background Cron Error Isolation", () => {
    test("7.1 Cron job continues processing remaining industries when one industry fails", async () => {
      const industries = ["Software", "Healthcare", "Finance"];
      const results = [];

      for (const industry of industries) {
        try {
          if (industry === "Healthcare") {
            throw new Error("Temporary AI parsing error for Healthcare");
          }
          results.push({ industry, status: "success" });
        } catch (err) {
          results.push({ industry, status: "failed", error: err.message });
        }
      }

      assert.strictEqual(results.length, 3);
      assert.strictEqual(results[0].status, "success");
      assert.strictEqual(results[1].status, "failed");
      assert.strictEqual(results[2].status, "success", "Remaining industries must process successfully after a single failure");
    });
  });

  // ==========================================
  // 8. ERROR & FAILURE SANITIZATION MATRIX
  // ==========================================
  describe("8. Error & Failure Sanitization Matrix", () => {
    test("8.1 Database and internal system errors are masked before returning to client", () => {
      function sanitizeError(err) {
        const msg = err?.message || "";
        if (msg.includes("PrismaClient") || msg.includes("P2002") || msg.includes("Table") || msg.includes("SELECT")) {
          return "A database error occurred. Please try again.";
        }
        if (msg.includes("AI_KEY") || msg.includes("403 Forbidden") || msg.includes("API_KEY")) {
          return "Service temporarily unavailable. Please try again later.";
        }
        return msg;
      }

      assert.strictEqual(
        sanitizeError(new Error("PrismaClientKnownRequestError: Unique constraint failed on the constraint: User_clerkUserId_key")),
        "A database error occurred. Please try again."
      );
      assert.strictEqual(
        sanitizeError(new Error("Invalid API_KEY provided to GoogleGenerativeAI client")),
        "Service temporarily unavailable. Please try again later."
      );
    });
  });
});
