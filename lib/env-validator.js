/**
 * Server-Side Environment Variable Validation Utility
 * Validates required configuration keys without exposing sensitive secret values.
 */

const REQUIRED_SERVER_VARS = [
  "DATABASE_URL",
  "GEMINI_API_KEY",
  "CLERK_SECRET_KEY",
];

const REQUIRED_CLIENT_VARS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
];

let isEnvValidated = false;

/**
 * Validates server-side environment variables at runtime.
 * Throws a sanitized diagnostic error listing missing variable names only.
 * Safely ignores validation if explicitly in build-phase without active database.
 */
export function validateProductionEnv() {
  if (isEnvValidated) {
    return { valid: true, missing: [] };
  }

  // Allow next build phase to evaluate without runtime database secrets if configured
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build" ||
    process.env.npm_lifecycle_script?.includes("next build")
  ) {
    return { valid: true, missing: [] };
  }

  const missing = [];

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key] || process.env[key].trim() === "") {
      missing.push(key);
    }
  }

  for (const key of REQUIRED_CLIENT_VARS) {
    if (!process.env[key] || process.env[key].trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `[Startup Configuration Error]: Missing required environment variables: ${missing.join(", ")}. Check your .env configuration.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  isEnvValidated = true;
  return { valid: true, missing: [] };
}
