import { PrismaClient } from "@prisma/client";
import { validateProductionEnv } from "./env-validator.js";

// Validate required environment secrets on server runtime initialization
validateProductionEnv();

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}