"use server";

import { cache } from "react";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "@/lib/gemini";
import { hasValidInrSalaryData } from "@/lib/salary-utils";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  if (!data?.industry || typeof data.industry !== "string" || !data.industry.trim()) {
    throw new Error("Industry is required");
  }

  const targetIndustry = data.industry.trim();

  // 1. Check if industry insight already exists OUTSIDE the transaction with valid INR data
  let existingInsight = await db.industryInsight.findUnique({
    where: { industry: targetIndustry },
  });

  if (existingInsight && !hasValidInrSalaryData(existingInsight)) {
    existingInsight = null;
  }

  // 2. Perform external AI generation OUTSIDE the database transaction
  let newInsights = null;
  if (!existingInsight) {
    try {
      newInsights = await generateAIInsights(targetIndustry);
    } catch (err) {
      console.error("[User Industry Insights Generation Error]:", err.message);
      // Resilient fallback ensuring database consistency even if external AI call fails
      newInsights = {
        industry: targetIndustry,
        salaryRanges: [],
        growthRate: 0,
        demandLevel: "Medium",
        topSkills: [],
        marketOutlook: "Neutral",
        keyTrends: [],
        recommendedSkills: [],
        jobOpenings: 0,
        jobOpeningsChange: 0,
        topRegions: [],
        careerPath: [],
        certifications: [],
        forecast: [],
      };
    }
  }

  try {
    // 3. Open Prisma transaction ONLY for atomic database operations (strictly zero external API calls)
    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = existingInsight;

        if (!industryInsight && newInsights) {
          industryInsight = await tx.industryInsight.upsert({
            where: { industry: targetIndustry },
            update: {
              ...newInsights,
              industry: targetIndustry,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              lastUpdated: new Date(),
            },
            create: {
              ...newInsights,
              industry: targetIndustry,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              lastUpdated: new Date(),
            },
          });
        }

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { industry: targetIndustry },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 5000,
      }
    );

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("[updateUser DB Error]:", error.message);
    throw new Error("Failed to update profile. Please try again.");
  }
}

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