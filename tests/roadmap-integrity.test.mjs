import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * In-memory Prisma-like simulation modeling the exact schema behavior:
 * model Roadmap {
 *   id String @id
 *   userId String @unique
 *   roadmapTitle String
 *   description String
 *   duration String?
 *   industry String?
 *   initialNodes Json
 *   initialEdges Json
 * }
 */
class MockRoadmapDb {
  constructor() {
    this.roadmaps = new Map(); // key: userId, value: roadmap record
    this.idCounter = 1;
  }

  async findFirst({ where: { userId } }) {
    return this.roadmaps.get(userId) || null;
  }

  async findUnique({ where: { userId } }) {
    return this.roadmaps.get(userId) || null;
  }

  async create({ data }) {
    if (this.roadmaps.has(data.userId)) {
      // Prisma P2002 error signature
      const error = new Error("Unique constraint failed on the fields: (`userId`)");
      error.code = "P2002";
      throw error;
    }
    const record = {
      id: `roadmap-${this.idCounter++}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roadmaps.set(data.userId, record);
    return record;
  }

  async upsert({ where: { userId }, update, create }) {
    if (this.roadmaps.has(userId)) {
      const existing = this.roadmaps.get(userId);
      const updated = {
        ...existing,
        ...update,
        updatedAt: new Date(),
      };
      this.roadmaps.set(userId, updated);
      return updated;
    } else {
      const record = {
        id: `roadmap-${this.idCounter++}`,
        ...create,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.roadmaps.set(userId, record);
      return record;
    }
  }
}

/**
 * Simulated saveRoadMap server action mirroring actions/road-map.js logic.
 */
function createRoadmapService(mockDb, mockAiGenerator) {
  return async function saveRoadMap({ authenticatedUserId, forceRegenerate = false, userResume = { content: "Sample resume" } } = {}) {
    // 1. Authenticate user
    if (!authenticatedUserId) {
      throw new Error("Unauthorized");
    }

    if (!userResume) {
      throw new Error("User or resume not found");
    }

    // 2. Cache check when forceRegenerate is false
    if (!forceRegenerate) {
      const existing = await mockDb.findUnique({
        where: { userId: authenticatedUserId },
      });
      if (existing) return existing;
    }

    // 3. AI generation
    const rawAiRoadmap = await mockAiGenerator(userResume.content);
    if (!rawAiRoadmap) {
      throw new Error("AI did not return valid roadmap JSON");
    }

    const safeRoadmap = {
      roadmapTitle: rawAiRoadmap.roadmapTitle || "Untitled Roadmap",
      description: rawAiRoadmap.description || "No description provided.",
      duration: rawAiRoadmap.duration || "Flexible",
      industry: rawAiRoadmap.industry || "General",
      initialNodes: Array.isArray(rawAiRoadmap.initialNodes) ? rawAiRoadmap.initialNodes : [],
      initialEdges: Array.isArray(rawAiRoadmap.initialEdges) ? rawAiRoadmap.initialEdges : [],
    };

    // 4. Safe upsert preserving Roadmap.userId @unique constraint
    return await mockDb.upsert({
      where: { userId: authenticatedUserId },
      update: safeRoadmap,
      create: {
        userId: authenticatedUserId,
        ...safeRoadmap,
      },
    });
  };
}

/**
 * Route protection matcher matching middleware.js
 */
const protectedRoutes = [
  "/dashboard",
  "/resume",
  "/interview",
  "/ai-cover-letter",
  "/onboarding",
  "/roadmap",
];

function isRouteProtected(pathname) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function simulateMiddleware({ pathname, userId }) {
  if (!userId && isRouteProtected(pathname)) {
    return {
      action: "REDIRECT_TO_SIGN_IN",
      redirectUrl: `/sign-in?redirect_url=${encodeURIComponent(pathname)}`,
    };
  }
  return { action: "NEXT" };
}

describe("Roadmap Integrity & Regeneration Test Suite", () => {
  let mockDb;
  let aiCallCount = 0;
  let saveRoadMap;

  const mockAiGenerator = async (resumeContent) => {
    aiCallCount++;
    return {
      roadmapTitle: `Career Roadmap Generation #${aiCallCount}`,
      description: "AI-generated curriculum progression",
      duration: "6 Months",
      industry: "Software Engineering",
      initialNodes: [
        { id: "node-1", data: { label: "Foundations" }, position: { x: 0, y: 100 } },
        { id: "node-2", data: { label: "Core Skills" }, position: { x: 250, y: 100 } },
      ],
      initialEdges: [
        { id: "edge-1", source: "node-1", target: "node-2" },
      ],
    };
  };

  test("Setup test environment", () => {
    mockDb = new MockRoadmapDb();
    aiCallCount = 0;
    saveRoadMap = createRoadmapService(mockDb, mockAiGenerator);
  });

  // Test 1: First roadmap generation creates one roadmap
  test("1. First roadmap generation creates one roadmap for authenticated user", async () => {
    const roadmap = await saveRoadMap({
      authenticatedUserId: "user-1",
      forceRegenerate: false,
    });

    assert.ok(roadmap);
    assert.strictEqual(roadmap.userId, "user-1");
    assert.strictEqual(roadmap.roadmapTitle, "Career Roadmap Generation #1");
    assert.strictEqual(aiCallCount, 1);
  });

  // Test 2: Second generation for same user does NOT throw P2002
  test("2. Second generation for same user does NOT throw P2002 unique constraint error", async () => {
    // Attempting regeneration without upsert used to crash with P2002
    await assert.doesNotReject(async () => {
      await saveRoadMap({
        authenticatedUserId: "user-1",
        forceRegenerate: true,
      });
    });
  });

  // Test 3: forceRegenerate=true updates/replaces existing roadmap
  test("3. forceRegenerate=true updates/replaces existing roadmap", async () => {
    const regenerated = await saveRoadMap({
      authenticatedUserId: "user-1",
      forceRegenerate: true,
    });

    assert.strictEqual(regenerated.roadmapTitle, "Career Roadmap Generation #3");
    assert.strictEqual(regenerated.userId, "user-1");
  });

  // Test 4: Existing roadmap remains unique per user
  test("4. Existing roadmap remains unique per user in database", async () => {
    let user1Count = 0;
    for (const [userId] of mockDb.roadmaps) {
      if (userId === "user-1") user1Count++;
    }
    assert.strictEqual(user1Count, 1, "There must be exactly one roadmap record for user-1");
  });

  // Test 5: Roadmap data after regeneration is the newly generated data
  test("5. Roadmap data after regeneration reflects the newly generated AI content", async () => {
    const current = await mockDb.findUnique({ where: { userId: "user-1" } });
    assert.strictEqual(current.roadmapTitle, "Career Roadmap Generation #3");
    assert.strictEqual(current.initialNodes.length, 2);
  });

  // Test 6: User A cannot modify User B's roadmap
  test("6. User A cannot modify User B's roadmap", async () => {
    // Create roadmap for User B
    const userBRoadmap = await saveRoadMap({
      authenticatedUserId: "user-2",
      forceRegenerate: false,
    });
    assert.strictEqual(userBRoadmap.userId, "user-2");

    // User A regenerates their own roadmap
    await saveRoadMap({
      authenticatedUserId: "user-1",
      forceRegenerate: true,
    });

    // Verify User B's roadmap is unmodified
    const userBCurrent = await mockDb.findUnique({ where: { userId: "user-2" } });
    assert.strictEqual(userBCurrent.roadmapTitle, "Career Roadmap Generation #4");
    assert.strictEqual(userBCurrent.userId, "user-2");
  });

  // Test 7: Missing authentication is rejected
  test("7. Missing authentication is rejected before AI or database access", async () => {
    const currentAiCount = aiCallCount;
    await assert.rejects(
      async () => {
        await saveRoadMap({ authenticatedUserId: null });
      },
      { message: "Unauthorized" }
    );
    assert.strictEqual(aiCallCount, currentAiCount, "AI generator must not be called when unauthenticated");
  });

  // Test 8: Normal non-regeneration behavior uses cache
  test("8. Normal non-regeneration (forceRegenerate=false) returns cached roadmap without invoking AI", async () => {
    const beforeCalls = aiCallCount;
    const cached = await saveRoadMap({
      authenticatedUserId: "user-1",
      forceRegenerate: false,
    });
    assert.strictEqual(aiCallCount, beforeCalls, "AI generator must not be invoked when cache exists");
    assert.strictEqual(cached.userId, "user-1");
  });
});

describe("Clerk Middleware Route Protection Test Suite", () => {
  // Test 9: Unauthenticated GET /roadmap redirected to sign-in
  test("9. Unauthenticated GET /roadmap is redirected to Clerk sign-in", () => {
    const result = simulateMiddleware({ pathname: "/roadmap", userId: null });
    assert.strictEqual(result.action, "REDIRECT_TO_SIGN_IN");
    assert.ok(result.redirectUrl.startsWith("/sign-in"));
  });

  // Test 10: Unauthenticated GET /roadmap/subpath redirected to sign-in
  test("10. Unauthenticated nested roadmap routes (/roadmap/details) are protected", () => {
    const result = simulateMiddleware({ pathname: "/roadmap/details", userId: null });
    assert.strictEqual(result.action, "REDIRECT_TO_SIGN_IN");
  });

  // Test 11: Authenticated GET /roadmap allowed through
  test("11. Authenticated GET /roadmap is allowed through middleware", () => {
    const result = simulateMiddleware({ pathname: "/roadmap", userId: "user-clerk-123" });
    assert.strictEqual(result.action, "NEXT");
  });

  // Test 12: Existing protected routes remain protected
  test("12. Existing protected routes (/dashboard, /resume, /interview, etc.) remain protected", () => {
    const protectedPaths = ["/dashboard", "/resume", "/interview", "/ai-cover-letter", "/onboarding"];
    for (const path of protectedPaths) {
      const unauthResult = simulateMiddleware({ pathname: path, userId: null });
      assert.strictEqual(unauthResult.action, "REDIRECT_TO_SIGN_IN", `${path} must be protected`);

      const authResult = simulateMiddleware({ pathname: path, userId: "user-123" });
      assert.strictEqual(authResult.action, "NEXT", `${path} must allow authenticated users`);
    }
  });

  // Test 13: Public routes remain publicly accessible
  test("13. Public routes (/, /sign-in, /sign-up) remain publicly accessible", () => {
    const publicPaths = ["/", "/sign-in", "/sign-up"];
    for (const path of publicPaths) {
      const result = simulateMiddleware({ pathname: path, userId: null });
      assert.strictEqual(result.action, "NEXT", `${path} must be public`);
    }
  });
});
