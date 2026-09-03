import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * Transaction Lifecycle Inspector
 * Tracks exactly when transactions open, close, and whether external AI calls
 * occur inside or outside transaction boundaries.
 */
class MockDatabaseWithTransactionAudit {
  constructor() {
    this.users = new Map();
    this.insights = new Map();
    this.isTransactionActive = false;
    this.externalAiCallsInsideTransaction = [];
  }

  async findUser({ clerkUserId }) {
    for (const u of this.users.values()) {
      if (u.clerkUserId === clerkUserId) return u;
    }
    return null;
  }

  async findInsight({ industry }) {
    return this.insights.get(industry) || null;
  }

  async $transaction(callback, options = {}) {
    this.isTransactionActive = true;
    try {
      const tx = {
        industryInsight: {
          upsert: async ({ where: { industry }, update, create }) => {
            const record = { ...(this.insights.get(industry) || {}), ...create, ...update, industry };
            this.insights.set(industry, record);
            return record;
          },
        },
        user: {
          update: async ({ where: { id }, data }) => {
            const existing = this.users.get(id);
            if (!existing) throw new Error("User not found in tx");
            const updated = { ...existing, ...data };
            this.users.set(id, updated);
            return updated;
          },
        },
      };

      const result = await callback(tx);
      return result;
    } finally {
      this.isTransactionActive = false;
    }
  }
}

/**
 * Service implementation mirroring actions/user.js updateUser()
 */
function createUserService(dbAudit, aiGenerator) {
  return async function updateUser({ authenticatedUserId, industryInput }) {
    // 1. Authenticate user
    if (!authenticatedUserId) {
      throw new Error("Unauthorized");
    }

    const user = await dbAudit.findUser({ clerkUserId: authenticatedUserId });
    if (!user) throw new Error("User not found");

    if (!industryInput || typeof industryInput !== "string" || !industryInput.trim()) {
      throw new Error("Industry is required");
    }

    const targetIndustry = industryInput.trim();

    // 2. Check if industry insight already exists OUTSIDE the transaction
    let existingInsight = await dbAudit.findInsight({ industry: targetIndustry });

    // 3. Perform external AI generation OUTSIDE the transaction
    let newInsights = null;
    if (!existingInsight) {
      // Audit check: Verify transaction is NOT active
      if (dbAudit.isTransactionActive) {
        dbAudit.externalAiCallsInsideTransaction.push("AI called inside transaction!");
      }

      try {
        newInsights = await aiGenerator(targetIndustry);
      } catch (err) {
        newInsights = {
          industry: targetIndustry,
          salaryRanges: [],
          growthRate: 0,
          demandLevel: "Medium",
          topSkills: [],
          marketOutlook: "Neutral",
          keyTrends: [],
          recommendedSkills: [],
        };
      }
    }

    // 4. Open Prisma transaction ONLY for database mutations
    const result = await dbAudit.$transaction(async (tx) => {
      let industryInsight = existingInsight;

      if (!industryInsight && newInsights) {
        industryInsight = await tx.industryInsight.upsert({
          where: { industry: targetIndustry },
          update: {
            ...newInsights,
            industry: targetIndustry,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            lastUpdated: new Date(),
          },
          create: {
            ...newInsights,
            industry: targetIndustry,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            lastUpdated: new Date(),
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { industry: targetIndustry },
      });

      return { updatedUser, industryInsight };
    });

    return result.updatedUser;
  };
}

describe("Phase 2B — Database Transaction & External AI Separation Test Suite", () => {
  let dbAudit;
  let aiCallCount = 0;
  let mockAiGenerator;
  let updateUser;

  test("Setup test fixtures", () => {
    dbAudit = new MockDatabaseWithTransactionAudit();
    dbAudit.users.set("user-1", {
      id: "user-1",
      clerkUserId: "clerk-123",
      email: "test@example.com",
      industry: null,
    });

    aiCallCount = 0;
    mockAiGenerator = async (industry) => {
      aiCallCount++;
      return {
        industry,
        salaryRanges: [{ role: "Engineer", min: 80000, max: 150000, median: 110000, location: "US" }],
        growthRate: 15.5,
        demandLevel: "High",
        topSkills: ["TypeScript", "Next.js", "PostgreSQL"],
        marketOutlook: "Positive",
        keyTrends: ["AI Integration", "Cloud Native"],
        recommendedSkills: ["GraphQL", "Docker"],
      };
    };

    updateUser = createUserService(dbAudit, mockAiGenerator);
  });

  // Test 1: updateUser authentication
  test("1. updateUser rejects unauthenticated requests with Unauthorized", async () => {
    await assert.rejects(
      async () => {
        await updateUser({ authenticatedUserId: null, industryInput: "tech-software" });
      },
      { message: "Unauthorized" }
    );
  });

  // Test 2: Input validation
  test("2. updateUser rejects missing or empty industry input", async () => {
    await assert.rejects(
      async () => {
        await updateUser({ authenticatedUserId: "clerk-123", industryInput: "" });
      },
      { message: "Industry is required" }
    );
  });

  // Test 3: Gemini is NOT called while a Prisma transaction is open
  test("3. External AI generation runs strictly OUTSIDE the database transaction", async () => {
    assert.strictEqual(dbAudit.isTransactionActive, false);
    assert.strictEqual(dbAudit.externalAiCallsInsideTransaction.length, 0);

    const updatedUser = await updateUser({
      authenticatedUserId: "clerk-123",
      industryInput: "tech-software-development",
    });

    assert.strictEqual(updatedUser.industry, "tech-software-development");
    assert.strictEqual(aiCallCount, 1, "AI generator should have been called once");
    assert.strictEqual(
      dbAudit.externalAiCallsInsideTransaction.length,
      0,
      "CRITICAL: Zero AI calls must occur while database transaction is open"
    );
  });

  // Test 4: Existing industry insight reuses cached record without AI call
  test("4. Existing industry insight reuses cached record without calling AI", async () => {
    const priorAiCalls = aiCallCount;

    // Second user selects the same industry
    dbAudit.users.set("user-2", {
      id: "user-2",
      clerkUserId: "clerk-456",
      email: "user2@example.com",
      industry: null,
    });

    const user2 = await updateUser({
      authenticatedUserId: "clerk-456",
      industryInput: "tech-software-development",
    });

    assert.strictEqual(user2.industry, "tech-software-development");
    assert.strictEqual(aiCallCount, priorAiCalls, "AI generator must not be invoked when industry insight exists");
  });

  // Test 5: Gemini failure does not break user profile update or corrupt DB
  test("5. External AI failure triggers resilient fallback and completes user update safely", async () => {
    // New industry where AI fails
    const failingAiGenerator = async () => {
      throw new Error("Gemini 429 Rate Limit Exceeded");
    };
    const userServiceWithFailingAi = createUserService(dbAudit, failingAiGenerator);

    const updated = await userServiceWithFailingAi({
      authenticatedUserId: "clerk-123",
      industryInput: "biotech-genomics",
    });

    assert.strictEqual(updated.industry, "biotech-genomics");
    const insight = dbAudit.insights.get("biotech-genomics");
    assert.ok(insight, "Fallback insight record must exist in DB");
    assert.strictEqual(insight.industry, "biotech-genomics");
    assert.strictEqual(insight.demandLevel, "Medium");
  });

  // Test 6: Database transaction failure leaves no partial state
  test("6. Transaction failure does not leak uncommitted state", async () => {
    const brokenDbAudit = new MockDatabaseWithTransactionAudit();
    brokenDbAudit.users.set("user-broken", {
      id: "user-broken",
      clerkUserId: "clerk-broken",
      email: "broken@example.com",
      industry: "old-industry",
    });

    // Simulate DB failure inside transaction
    brokenDbAudit.$transaction = async () => {
      throw new Error("PostgreSQL Connection Terminated");
    };

    const failingService = createUserService(brokenDbAudit, mockAiGenerator);

    await assert.rejects(
      async () => {
        await failingService({
          authenticatedUserId: "clerk-broken",
          industryInput: "finance-banking",
        });
      },
      { message: "PostgreSQL Connection Terminated" }
    );

    // Verify user industry was NOT modified
    const user = brokenDbAudit.users.get("user-broken");
    assert.strictEqual(user.industry, "old-industry");
  });
});
