"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { queueForCurrentUser } from "@/lib/jobs/queue";
export async function generateCoverLetter(input){return queueForCurrentUser("COVER_LETTER",input);}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      jobTitle: true,
      companyName: true,
      jobDescription: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // Enforce strict ownership and select all fields required by CoverLetterPreview
  return await db.coverLetter.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      content: true,
      jobTitle: true,
      companyName: true,
      jobDescription: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // Enforce strict ownership check prior to deletion
  const existing = await db.coverLetter.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Cover letter not found or unauthorized");
  }

  const deleted = await db.$transaction(async tx=>{
    const record=await tx.coverLetter.delete({where:{id:existing.id}});
    await tx.careerJob.updateMany({where:{userId:user.id,kind:"COVER_LETTER",result:{path:["id"],equals:existing.id}},data:{result:{deleted:true},dismissed:true}});
    return record;
  });
  revalidatePath("/ai-cover-letter");
  revalidatePath("/dashboard");
  return deleted;
}

export async function updateCoverLetter({ id, content, updatedAt }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (typeof id !== "string" || typeof content !== "string" || !content.trim() || content.length > 30000 || !Number.isFinite(Date.parse(updatedAt))) throw new Error("Enter a letter of up to 30,000 characters.");
  const user = await db.user.findUnique({ where: { clerkUserId: userId }, select: { id: true } });
  if (!user) throw new Error("User not found");
  const result = await db.coverLetter.updateMany({ where: { id, userId: user.id, updatedAt: new Date(updatedAt) }, data: { content: content.trim() } });
  if (!result.count) throw new Error("This letter changed in another tab. Reload before editing again.");
  revalidatePath("/ai-cover-letter");
  return db.coverLetter.findFirst({ where: { id, userId: user.id } });
}
