// Strict 5MB server-side limit
export const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5,242,880 bytes

/**
 * Validates resume file metadata, size, extension, MIME, and magic bytes.
 * Throws controlled user-facing errors if validation fails.
 * Executes BEFORE any expensive buffering, Gemini API calls, or DB operations.
 */
export async function validateResumeFile(file) {
  if (!file || typeof file !== "object") {
    throw new Error("No file uploaded");
  }

  // 1. Filename & extension validation
  const filename = typeof file.name === "string" ? file.name.trim() : "";
  if (!filename) {
    throw new Error("Invalid file: missing filename");
  }

  const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
  if (!extMatch) {
    throw new Error("File must have a valid extension (.pdf)");
  }

  const ext = extMatch[1].toLowerCase();
  if (ext !== "pdf") {
    if (ext === "docx" || ext === "doc") {
      throw new Error("Word documents (.docx) must be exported as PDF (.pdf) for AI analysis");
    }
    throw new Error(`Unsupported file type (.${ext}). Only PDF resumes (.pdf) are supported`);
  }

  // 2. Server-side size validation (0-byte check & 5MB limit)
  const size = typeof file.size === "number" ? file.size : 0;
  if (size === 0) {
    throw new Error("The uploaded file is empty (0 bytes). Please upload a valid resume");
  }

  if (size > MAX_RESUME_SIZE) {
    throw new Error("File size exceeds 5MB limit. Please upload a smaller resume file");
  }

  // 3. Client MIME check where available
  const mimeType = typeof file.type === "string" ? file.type.toLowerCase() : "";
  if (mimeType && mimeType !== "application/pdf" && mimeType !== "application/x-pdf") {
    throw new Error("Invalid MIME type. The uploaded file does not match PDF format");
  }

  // 4. Magic bytes / file signature validation (PDF must start with %PDF-)
  if (typeof file.slice === "function") {
    const headerBytes = await file.slice(0, 5).arrayBuffer();
    const headerBuffer = Buffer.from(headerBytes);
    const magic = headerBuffer.toString("ascii", 0, 5);

    if (magic !== "%PDF-") {
      throw new Error("Invalid PDF file signature. The uploaded file is not a genuine PDF document");
    }
  }

  return { filename, size };
}
