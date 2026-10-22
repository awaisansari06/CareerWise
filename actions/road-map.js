"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { queueForCurrentUser } from "@/lib/jobs/queue";
import { repairRoadmapResourceNodes, resolveMilestoneResources } from "@/lib/roadmap-resources";
import { checkResourceHealth } from "@/lib/roadmap-resource-health";
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

async function ownedRoadmap(roadmapId) {
  const {userId}=await auth();
  if(!userId) throw new Error('Unauthorized');
  if(typeof roadmapId!=='string') throw new Error('Invalid roadmap');
  const user=await db.user.findUnique({where:{clerkUserId:userId},select:{id:true}});
  if(!user) throw new Error('User not found');
  const roadmap=await db.roadmap.findFirst({where:{id:roadmapId,userId:user.id}});
  if(!roadmap || !Array.isArray(roadmap.initialNodes)) throw new Error('Roadmap not found');
  return roadmap;
}
async function persistResourceNodes(roadmap,nodes) {
  const result=await db.roadmap.updateMany({where:{id:roadmap.id,userId:roadmap.userId,updatedAt:roadmap.updatedAt},data:{initialNodes:nodes}});
  if(!result.count) throw new Error('The roadmap changed in another tab. Reload before trying again.');
  revalidatePath('/roadmap');
  return db.roadmap.findUnique({where:{id:roadmap.id}});
}
export async function repairRoadmapResources({roadmapId}) {
  const roadmap=await ownedRoadmap(roadmapId);
  return persistResourceNodes(roadmap,repairRoadmapResourceNodes(roadmap.initialNodes));
}
export async function updateRoadmapResourceHealth({roadmapId,nodeId,reportResourceId}) {
  const roadmap=await ownedRoadmap(roadmapId);
  const node=roadmap.initialNodes.find(item=>item.id===nodeId);
  if(!node) throw new Error('Milestone not found');
  const resources=resolveMilestoneResources(node);
  if(reportResourceId && !resources.some(item=>item.id===reportResourceId)) throw new Error('Resource not found');
  const results=reportResourceId ? [[reportResourceId,{status:'reported',checkedAt:new Date().toISOString()}]] : await Promise.all(resources.map(async item=>[item.id,await checkResourceHealth(item.id)]));
  const nodes=roadmap.initialNodes.map(item=>item.id===nodeId?{...item,data:{...item.data,resourceHealth:{...item.data?.resourceHealth,...Object.fromEntries(results)}}}:item);
  return persistResourceNodes(roadmap,nodes);
}
