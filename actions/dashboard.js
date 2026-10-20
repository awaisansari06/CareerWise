"use server";

import { currentCareerUser, enqueueCareerJob } from "@/lib/jobs/queue";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { hasValidInrSalaryData } from "@/lib/salary-utils";

export async function getDashboardProgress() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      name: true,
      _count: { select: { assessments: { where: { category: { not: "draft" } } }, coverLetter: true } },
      resumeAnalysis: { select: { updatedAt: true, tipsForImprovement: true } },
      assessments: { where: { category: { not: "draft" } }, orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true, improvementTip: true } },
      roadmaps: { take: 1, select: { roadmapTitle: true, updatedAt: true } },
    },
  });
  if (!user) throw new Error("User not found");
  return {
    name: user.name,
    assessmentCount: user._count.assessments,
    coverLetterCount: user._count.coverLetter,
    analysis: user.resumeAnalysis,
    latestAssessment: user.assessments[0] || null,
    roadmap: user.roadmaps[0] || null,
  };
}

export async function getIndustryInsights(){
 const user=await currentCareerUser();if(!user.resume)return null;
 let industry=user.industry;try{industry=JSON.parse(user.resume.content).industry||industry;}catch{}
 if(!industry)return null;
 const cached=await db.industryInsight.findUnique({where:{industry}});
 if(cached && new Date(cached.nextUpdate)>new Date() && hasValidInrSalaryData(cached))return cached;
 await enqueueCareerJob(user,"INSIGHTS",{industry});
 return cached && hasValidInrSalaryData(cached)?cached:null;
}
