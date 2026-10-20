"use server";
import { cache } from "react";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { currentCareerUser, enqueueCareerJob } from "@/lib/jobs/queue";
export async function updateUser(data){const user=await currentCareerUser();if(typeof data?.industry!=="string"||!data.industry.trim()||data.industry.length>120)throw new Error("Enter a career field under 120 characters.");if(!user.resume)throw new Error("Add your background first.");await enqueueCareerJob(user,"INSIGHTS",{industry:data.industry.trim()});revalidatePath("/dashboard");return {id:user.id,queued:true};}
export const getUserOnboardingStatus = cache(async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { isUploaded: true },
    });

    return {
      isOnboarded: !!user?.isUploaded,
    };
  } catch (error) {
    console.error("[getUserOnboardingStatus Error]:", error);
    throw new Error("Failed to check onboarding status");
  }
});