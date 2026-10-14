import { db } from "./prisma.js";

/** Atomic database increments prevent bypasses across processes and deployments. */
export async function consumeAiBudget(userId) {
  const configuredLimit = Number(process.env.AI_HOURLY_LIMIT || 30);
  const limit = Number.isInteger(configuredLimit) && configuredLimit > 0 ? configuredLimit : 30;
  const windowStart = new Date(Math.floor(Date.now() / 3600000) * 3600000);
  const usage = await db.aiUsage.upsert({
    where: { id: `${userId}:${windowStart.toISOString()}` },
    create: { id: `${userId}:${windowStart.toISOString()}`, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (usage.count > limit) {
    throw new Error("You have reached the hourly AI request limit. Please try again later.");
  }
}
