import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/function";
import { processCareerJob, recoverCareerJobs } from "@/lib/inngest/career-jobs";
import { serve } from "inngest/next";
export const maxDuration=60;
export const {GET,POST,PUT}=serve({client:inngest,functions:[generateIndustryInsights,processCareerJob,recoverCareerJobs]});
