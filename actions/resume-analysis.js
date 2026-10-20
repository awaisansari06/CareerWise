"use server";
import { currentCareerUser, enqueueCareerJob } from "@/lib/jobs/queue";
import { db } from "@/lib/prisma";
export async function getResumeAnalysis(){const user=await currentCareerUser();if(!user.resume)return null;const analysis=await db.resumeAnalysis.findUnique({where:{userId:user.id}});if(!analysis)await enqueueCareerJob(user,"RESUME_ANALYSIS",{});return analysis;}
