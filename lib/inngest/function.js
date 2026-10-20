import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { generateAIInsights } from "@/lib/gemini";
export const generateIndustryInsights=inngest.createFunction({id:"generate-industry-insights",name:"Refresh industry insights",triggers:[{cron:"0 0 * * 0"}],retries:2},async({step})=>{
 const industries=await step.run("industries",()=>db.industryInsight.findMany({select:{industry:true}}));
 for(const {industry} of industries){
  const insights=await step.run(`generate-${industry}`,async()=>{const data=await generateAIInsights(industry);if(!data.salaryRanges?.length||!data.careerPath?.length)throw new Error("Industry generation unavailable");return data;});
  await step.run(`save-${industry}`,()=>db.industryInsight.update({where:{industry},data:{...insights,industry,lastUpdated:new Date(),nextUpdate:new Date(Date.now()+604800000)}}));
 }
 await step.run("expire-budgets",()=>db.aiUsage.deleteMany({where:{windowStart:{lt:new Date(Date.now()-7*86400000)}}}));
 return {updated:industries.length};
});
