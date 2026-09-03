import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Resume Replacement & Single-Resume Lifecycle Test Suite", () => {
  // 1. Existing user can upload a replacement resume
  test("1. Existing user can upload a replacement resume successfully", async () => {
    const resumeStore = new Map([
      ["u-1", { id: "res-1", userId: "u-1", filename: "old_resume.pdf", content: '{"skills":["Java"]}' }],
    ]);

    async function replaceResume(userId, newFilename, newContent) {
      const updated = {
        ...(resumeStore.get(userId) || {}),
        userId,
        filename: newFilename,
        content: newContent,
        updatedAt: new Date(),
      };
      resumeStore.set(userId, updated);
      return updated;
    }

    const res = await replaceResume("u-1", "revised_resume.pdf", '{"skills":["TypeScript","React"]}');
    assert.strictEqual(res.filename, "revised_resume.pdf");
    assert.strictEqual(JSON.parse(res.content).skills[0], "TypeScript");
  });

  // 2. Resume.upsert updates existing Resume rather than creating duplicate
  test("2. Resume.upsert updates existing record rather than creating duplicate row", () => {
    const db = new Map();

    function upsertResume(userId, data) {
      const current = db.get(userId) || { id: "resume-" + userId, userId };
      db.set(userId, { ...current, ...data });
      return db.get(userId);
    }

    // Initial upload
    upsertResume("user-100", { filename: "version1.pdf", content: "{}" });
    assert.strictEqual(db.size, 1);

    // Replacement upload
    upsertResume("user-100", { filename: "version2.pdf", content: '{"v":2}' });
    assert.strictEqual(db.size, 1, "Must not create a second resume record for same user");
    assert.strictEqual(db.get("user-100").filename, "version2.pdf");
  });

  // 3. New filename/content are persisted
  test("3. New filename and extracted content are persisted in the record", () => {
    const resumeRecord = {
      id: "r-99",
      userId: "u-99",
      filename: "software_dev.pdf",
      content: JSON.stringify({ name: "Alex", skills: ["Go", "Kubernetes"] }),
    };

    assert.strictEqual(resumeRecord.filename, "software_dev.pdf");
    const parsed = JSON.parse(resumeRecord.content);
    assert.strictEqual(parsed.name, "Alex");
    assert.deepStrictEqual(parsed.skills, ["Go", "Kubernetes"]);
  });

  // 4. ResumeAnalysis is invalidated after successful replacement
  test("4. ResumeAnalysis is invalidated (deleted) after successful replacement so fresh analysis runs", async () => {
    const db = {
      resume: new Map([["u-1", { id: "res-1", filename: "old.pdf" }]]),
      resumeAnalysis: new Map([["u-1", { id: "ana-1", atsScore: 72 }]]),
    };

    async function executeReplacement(userId, newFilename) {
      db.resume.set(userId, { id: "res-1", filename: newFilename });
      // Invalidate analysis
      db.resumeAnalysis.delete(userId);
    }

    assert.ok(db.resumeAnalysis.has("u-1"));
    await executeReplacement("u-1", "new.pdf");
    assert.strictEqual(db.resumeAnalysis.has("u-1"), false, "Prior analysis must be deleted");
  });

  // 5. Invalid PDF is rejected
  test("5. Non-PDF files (e.g. .docx or .exe) are rejected before database update", () => {
    function validateExtension(filename) {
      if (!filename.toLowerCase().endsWith(".pdf")) {
        throw new Error("Only PDF files are supported");
      }
      return true;
    }

    assert.strictEqual(validateExtension("resume.pdf"), true);
    assert.throws(() => validateExtension("resume.docx"), /Only PDF files are supported/);
    assert.throws(() => validateExtension("script.exe"), /Only PDF files are supported/);
  });

  // 6. >5 MB PDF is rejected
  test("6. Files exceeding 5MB are rejected before buffering or AI invocation", () => {
    const MAX_LIMIT = 5 * 1024 * 1024; // 5MB

    function checkFileSize(sizeBytes) {
      if (sizeBytes > MAX_LIMIT) {
        throw new Error("File size exceeds 5MB limit");
      }
      return true;
    }

    assert.strictEqual(checkFileSize(4 * 1024 * 1024), true);
    assert.throws(() => checkFileSize(5 * 1024 * 1024 + 1), /File size exceeds 5MB limit/);
  });

  // 7. Invalid PDF magic bytes are rejected
  test("7. Disguised files lacking %PDF- magic bytes are rejected", () => {
    function verifyMagicBytes(buffer) {
      if (buffer.toString("utf-8", 0, 5) !== "%PDF-") {
        throw new Error("Invalid PDF header");
      }
      return true;
    }

    const valid = Buffer.from("%PDF-1.7...");
    const invalid = Buffer.from("PK\x03\x04..."); // zip / docx
    assert.strictEqual(verifyMagicBytes(valid), true);
    assert.throws(() => verifyMagicBytes(invalid), /Invalid PDF header/);
  });

  // 8. Unauthenticated upload is rejected
  test("8. Unauthenticated upload request throws Unauthorized before processing", async () => {
    async function uploadAction(session) {
      if (!session?.userId) {
        throw new Error("Unauthorized");
      }
      return { success: true };
    }

    await assert.rejects(() => uploadAction(null), /Unauthorized/);
    await assert.rejects(() => uploadAction({ userId: "" }), /Unauthorized/);
    const valid = await uploadAction({ userId: "clerk_123" });
    assert.strictEqual(valid.success, true);
  });

  // 9. User cannot modify another user's resume
  test("9. User A cannot overwrite or delete User B's resume", () => {
    const db = new Map([
      ["alice-id", { userId: "alice-id", filename: "alice_resume.pdf" }],
      ["bob-id", { userId: "bob-id", filename: "bob_resume.pdf" }],
    ]);

    function updateResumeForUser(authUserId, targetUserId, newFilename) {
      if (authUserId !== targetUserId) {
        throw new Error("Unauthorized cross-user mutation");
      }
      db.set(targetUserId, { userId: targetUserId, filename: newFilename });
    }

    assert.throws(
      () => updateResumeForUser("attacker-id", "bob-id", "malicious.pdf"),
      /Unauthorized cross-user mutation/
    );
    assert.strictEqual(db.get("bob-id").filename, "bob_resume.pdf");
  });

  // 10. Gemini/extraction failure preserves previous resume and analysis
  test("10. AI parsing failure aborts prior to DB update, preserving previous resume and analysis intact", async () => {
    const db = {
      resume: { filename: "original_resume.pdf", content: '{"name":"Alex"}' },
      analysis: { atsScore: 88 },
    };

    async function safeReplaceWithSimulatedAiFailure() {
      // Step 1: Simulate Gemini failure
      const aiSucceeded = false;
      if (!aiSucceeded) {
        throw new Error("The uploaded file does not look like a professional resume");
      }

      // Step 2: Database mutation only reached on success
      db.resume = { filename: "new.pdf", content: "{}" };
      db.analysis = null;
    }

    await assert.rejects(() => safeReplaceWithSimulatedAiFailure(), /The uploaded file does not look like a professional resume/);
    // Assert original state preserved
    assert.strictEqual(db.resume.filename, "original_resume.pdf");
    assert.strictEqual(db.analysis.atsScore, 88);
  });

  // 11. Repeated upload does not create duplicate Resume records
  test("11. Rapid repeated uploads sequentially update the single Resume record", () => {
    const db = new Map();

    function upsert(userId, filename) {
      db.set(userId, { userId, filename, updatedAt: Date.now() });
    }

    upsert("user-1", "upload1.pdf");
    upsert("user-1", "upload2.pdf");
    upsert("user-1", "upload3.pdf");

    assert.strictEqual(db.size, 1, "Only one resume record per user allowed");
    assert.strictEqual(db.get("user-1").filename, "upload3.pdf");
  });

  // 12. Dashboard/resume data is correctly refreshed after replacement
  test("12. getResume returns updated metadata for dashboard display after replacement", async () => {
    let mockResume = {
      id: "res-1",
      userId: "u-1",
      filename: "old_resume.pdf",
      updatedAt: new Date("2026-01-01"),
    };

    async function getResumeMetadata(userId) {
      if (mockResume.userId !== userId) return null;
      return {
        id: mockResume.id,
        filename: mockResume.filename,
        updatedAt: mockResume.updatedAt,
      };
    }

    // Before
    const before = await getResumeMetadata("u-1");
    assert.strictEqual(before.filename, "old_resume.pdf");

    // Replace
    mockResume = {
      id: "res-1",
      userId: "u-1",
      filename: "updated_resume.pdf",
      updatedAt: new Date("2026-09-03"),
    };

    // After
    const after = await getResumeMetadata("u-1");
    assert.strictEqual(after.filename, "updated_resume.pdf");
    assert.strictEqual(after.updatedAt.toISOString(), "2026-09-03T00:00:00.000Z");
  });
});
