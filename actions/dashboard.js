"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "@/lib/gemini";
import { hasValidInrSalaryData } from "@/lib/salary-utils";

/**
 * Returns or generates industry insights for the authenticated user.
 * Protected by Clerk authentication.
 */
export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true, industryInsight: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.resume) throw new Error("Resume not uploaded yet");

  // Check if resume content has a classified industry
  let resumeIndustry = null;
  try {
    const parsedResume = typeof user.resume.content === "string" ? JSON.parse(user.resume.content) : user.resume.content;
    if (parsedResume?.industry && typeof parsedResume.industry === "string" && parsedResume.industry.trim()) {
      resumeIndustry = parsedResume.industry.trim();
    }
  } catch (e) {}

  const effectiveIndustry = resumeIndustry || user.industry;

  const now = new Date();

  // Validate that linked industryInsight matches current effectiveIndustry, has not expired, and contains valid INR data
  const hasValidMatchingInsight =
    user.industryInsight &&
    effectiveIndustry &&
    user.industryInsight.industry.toLowerCase() === effectiveIndustry.toLowerCase() &&
    new Date(user.industryInsight.nextUpdate) >= now &&
    hasValidInrSalaryData(user.industryInsight);

  if (!hasValidMatchingInsight) {
    const targetIndustry = effectiveIndustry || "Information Technology";

    // Check if an existing cached IndustryInsight already exists for targetIndustry with valid INR data
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: targetIndustry },
    });

    if (!industryInsight || new Date(industryInsight.nextUpdate) < now || !hasValidInrSalaryData(industryInsight)) {
      const referenceData = effectiveIndustry || user.resume;
      const insights = await generateAIInsights(referenceData);
      const generatedIndustry = effectiveIndustry || insights.industry;

      industryInsight = await db.industryInsight.upsert({
        where: { industry: generatedIndustry },
        update: {
          ...insights,
          industry: generatedIndustry,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(),
        },
        create: {
          industry: generatedIndustry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(),
        },
      });
    }

    if (user.industry !== industryInsight.industry) {
      await db.user.update({
        where: { id: user.id },
        data: {
          industry: industryInsight.industry,
        },
      });
    }

    return industryInsight;
  }

  return user.industryInsight;
}
