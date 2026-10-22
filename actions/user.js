"use server";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { currentCareerUser, enqueueCareerJob } from "@/lib/jobs/queue";
export async function updateUser(data){const user=await currentCareerUser();if(typeof data?.industry!=="string"||!data.industry.trim()||data.industry.length>120)throw new Error("Enter a career field under 120 characters.");if(!user.resume)throw new Error("Add your background first.");await enqueueCareerJob(user,"INSIGHTS",{industry:data.industry.trim()});revalidatePath("/dashboard");return {id:user.id,queued:true};}
export const getUserOnboardingStatus = cache(async () => {
  try {
    const user = await currentCareerUser();

    return {
      isOnboarded: !!user?.isUploaded,
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[getUserOnboardingStatus Error]:", error);
    throw new Error("Failed to check onboarding status");
  }
});
