"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { queueForCurrentUser } from "@/lib/jobs/queue";
export async function saveRoadMap(input={}){return queueForCurrentUser("ROADMAP",input);}

export async function getRoadMap() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId }, select: { id: true } });
  if (!user) throw new Error("User not found");
  return db.roadmap.findUnique({ where: { userId: user.id } });
}

export async function setMilestoneCompletion({ roadmapId, nodeId, completed }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (typeof roadmapId !== "string" || typeof nodeId !== "string" || typeof completed !== "boolean") throw new Error("Invalid milestone update");
  const user = await db.user.findUnique({ where: { clerkUserId: userId }, select: { id: true } });
  if (!user) throw new Error("User not found");
  const roadmap = await db.roadmap.findFirst({ where: { id: roadmapId, userId: user.id } });
  if (!roadmap || !Array.isArray(roadmap.initialNodes) || !roadmap.initialNodes.some(node => node.id === nodeId)) throw new Error("Milestone not found");
  const nodes = roadmap.initialNodes.map(node => node.id === nodeId ? { ...node, data: { ...node.data, completed } } : node);
  const result = await db.roadmap.updateMany({ where: { id: roadmap.id, userId: user.id, updatedAt: roadmap.updatedAt }, data: { initialNodes: nodes } });
  if (!result.count) throw new Error("The roadmap changed in another tab. Reload to see the latest progress.");
  revalidatePath("/roadmap");
  return db.roadmap.findUnique({ where: { id: roadmap.id } });
}
