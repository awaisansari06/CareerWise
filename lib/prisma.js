import { PrismaClient } from "@prisma/client";
import { validateProductionEnv } from "./env-validator.js";
import { parseDatabaseUrl } from "./database-url.js";

// Validate required environment secrets on server runtime initialization
validateProductionEnv();

function getClientDatasourceUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const parsed = parseDatabaseUrl(raw);
    let modified = false;
    // Allow up to 30 seconds for serverless compute (e.g. Neon) cold starts
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "30");
      modified = true;
    }
    // Prevent P2024 pool timeout errors during wake-up or connection queues
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "30");
      modified = true;
    }
    // Cap connection limit per process to avoid exhausting pooler slots
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "10");
      modified = true;
    }
    return modified ? parsed.toString() : raw;
  } catch {
    throw new Error("DATABASE_URL must be a PostgreSQL URL only, without the psql command or shell quotes.");
  }
}

const datasourceUrl = getClientDatasourceUrl();

export const db =
  globalThis.prisma ||
  new PrismaClient(
    datasourceUrl
      ? {
          datasources: {
            db: {
              url: datasourceUrl,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}