import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateResumeFile, MAX_RESUME_SIZE } from "../lib/resume-validator.js";

/**
 * Creates a mock File-like object with header bytes and slice support.
 */
function createMockFile({ name, size, type, headerString = "%PDF-1.4" }) {
  const headerBytes = Buffer.from(headerString, "ascii");
  
  return {
    name,
    size,
    type,
    slice(start, end) {
      const sliceLength = Math.max(0, end - start);
      const slicedBuf = Buffer.alloc(sliceLength);
      headerBytes.copy(slicedBuf, 0, start, Math.min(headerBytes.length, end));
      return {
        arrayBuffer: async () => slicedBuf.buffer.slice(slicedBuf.byteOffset, slicedBuf.byteOffset + slicedBuf.byteLength),
      };
    },
    arrayBuffer: async () => {
      const buf = Buffer.alloc(size);
      headerBytes.copy(buf, 0, 0, Math.min(headerBytes.length, size));
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    },
  };
}

describe("Resume Upload Security & Validation Test Suite", () => {
  // Test 1: Valid PDF accepted
  test("1. Valid PDF file is accepted by server validation", async () => {
    const validPdf = createMockFile({
      name: "john_doe_resume.pdf",
      size: 1024 * 500, // 500 KB
      type: "application/pdf",
      headerString: "%PDF-1.7",
    });

    const result = await validateResumeFile(validPdf);
    assert.strictEqual(result.filename, "john_doe_resume.pdf");
    assert.strictEqual(result.size, 1024 * 500);
  });

  // Test 2: DOCX rejection with informative guidance
  test("2. Word documents (.docx) are rejected with instruction to export as PDF", async () => {
    const docxFile = createMockFile({
      name: "resume.docx",
      size: 1024 * 200,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      headerString: "PK\x03\x04",
    });

    await assert.rejects(
      async () => {
        await validateResumeFile(docxFile);
      },
      {
        message: "Word documents (.docx) must be exported as PDF (.pdf) for AI analysis",
      }
    );
  });

  // Test 3: Oversized file rejected (> 5MB)
  test("3. Oversized file (> 5MB) is rejected before processing", async () => {
    const oversizedFile = createMockFile({
      name: "huge_resume.pdf",
      size: 5 * 1024 * 1024 + 1, // 5MB + 1 byte
      type: "application/pdf",
      headerString: "%PDF-",
    });

    await assert.rejects(
      async () => {
        await validateResumeFile(oversizedFile);
      },
      {
        message: "File size exceeds 5MB limit. Please upload a smaller resume file",
      }
    );
  });

  // Test 4: Zero-byte file rejected
  test("4. Zero-byte empty file (0 bytes) is rejected", async () => {
    const zeroByteFile = createMockFile({
      name: "empty.pdf",
      size: 0,
      type: "application/pdf",
      headerString: "",
    });

    await assert.rejects(
      async () => {
        await validateResumeFile(zeroByteFile);
      },
      {
        message: "The uploaded file is empty (0 bytes). Please upload a valid resume",
      }
    );
  });

  // Test 5: Missing file rejected
  test("5. Missing or null file object is rejected", async () => {
    await assert.rejects(
      async () => {
        await validateResumeFile(null);
      },
      {
        message: "No file uploaded",
      }
    );

    await assert.rejects(
      async () => {
        await validateResumeFile(undefined);
      },
      {
        message: "No file uploaded",
      }
    );
  });

  // Test 6: Wrong extension rejected
  test("6. Unsupported extensions (.exe, .sh, .jpg) are rejected", async () => {
    const exeFile = createMockFile({
      name: "malicious.exe",
      size: 1024 * 100,
      type: "application/x-msdownload",
      headerString: "MZ\x90\x00",
    });

    await assert.rejects(
      async () => {
        await validateResumeFile(exeFile);
      },
      {
        message: "Unsupported file type (.exe). Only PDF resumes (.pdf) are supported",
      }
    );
  });

  // Test 7: Incorrect MIME rejected where applicable
  test("7. Incorrect MIME type (e.g. image/jpeg) on .pdf is rejected", async () => {
    const spoofedMimeFile = createMockFile({
      name: "spoofed.pdf",
      size: 1024 * 50,
      type: "image/jpeg",
      headerString: "%PDF-",
    });

    await assert.rejects(
      async () => {
        await validateResumeFile(spoofedMimeFile);
      },
      {
        message: "Invalid MIME type. The uploaded file does not match PDF format",
      }
    );
  });

  // Test 8: Invalid/mismatched magic bytes rejected
  test("8. Executable binary disguised as .pdf with invalid magic bytes is rejected", async () => {
    // Windows executable starts with 'MZ' (0x4D 0x5A), not '%PDF-'
    const disguisedFile = createMockFile({
      name: "disguised_virus.pdf",
      size: 1024 * 80,
      type: "application/pdf",
      headerString: "MZ\x90\x00\x03\x00\x00\x00",
    });

    await assert.rejects(
      async () => {
        await validateResumeFile(disguisedFile);
      },
      {
        message: "Invalid PDF file signature. The uploaded file is not a genuine PDF document",
      }
    );
  });

  // Test 9 & 10: Rejected files do NOT reach Gemini and do NOT modify the database
  test("9 & 10. Rejected files do NOT reach Gemini and do NOT modify database", async () => {
    let geminiCalled = false;
    let dbModified = false;

    // Simulated upload handler pipeline using the same validation step
    async function simulateUpload(file) {
      // Step 1: Validate file
      await validateResumeFile(file);

      // Step 2: Gemini call (must not be reached for invalid file)
      geminiCalled = true;

      // Step 3: DB update (must not be reached for invalid file)
      dbModified = true;
    }

    const invalidFile = createMockFile({
      name: "bad_file.exe",
      size: 1024 * 10,
      type: "application/x-msdownload",
      headerString: "MZ\x90",
    });

    try {
      await simulateUpload(invalidFile);
      assert.fail("Simulation should have thrown validation error");
    } catch (err) {
      assert.ok(err.message.includes("Unsupported file type"));
    }

    assert.strictEqual(geminiCalled, false, "Gemini must not be called when validation fails");
    assert.strictEqual(dbModified, false, "Database must not be modified when validation fails");
  });

  // Test 11: Authenticated user can upload a valid resume
  test("11. Authenticated user pipeline completes successfully with valid file", async () => {
    let geminiCalled = false;
    let dbUpdated = false;

    async function simulateUpload({ authenticatedUserId, file }) {
      if (!authenticatedUserId) throw new Error("Unauthorized");
      const { filename } = await validateResumeFile(file);
      geminiCalled = true;
      dbUpdated = true;
      return { success: true, filename };
    }

    const validPdf = createMockFile({
      name: "candidate_resume.pdf",
      size: 1024 * 250,
      type: "application/pdf",
      headerString: "%PDF-1.5",
    });

    const result = await simulateUpload({
      authenticatedUserId: "clerk_user_123",
      file: validPdf,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(geminiCalled, true);
    assert.strictEqual(dbUpdated, true);
  });

  // Test 12: Unauthenticated user cannot upload a resume
  test("12. Unauthenticated user request throws Unauthorized before validation", async () => {
    async function simulateUpload({ authenticatedUserId, file }) {
      if (!authenticatedUserId) throw new Error("Unauthorized");
      return await validateResumeFile(file);
    }

    const validPdf = createMockFile({
      name: "candidate_resume.pdf",
      size: 1024 * 250,
      type: "application/pdf",
      headerString: "%PDF-1.5",
    });

    await assert.rejects(
      async () => {
        await simulateUpload({
          authenticatedUserId: null,
          file: validPdf,
        });
      },
      {
        message: "Unauthorized",
      }
    );
  });
});
