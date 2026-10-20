import "server-only";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";
import { consumeAiBudget } from "@/lib/ai-budget";
import { requestJobId } from "./request-key";
import { deliverJob } from "./outbox";
import { parseJobInput, publicJob } from "./policy";
export async function currentCareerUser(){const {userId}=await auth();if(!userId)throw new Error("Unauthorized");const user=await db.user.findUnique({where:{clerkUserId:userId},include:{resume:true}});if(!user)throw new Error("User not found");return user;}
export async function dispatchJob(job){return deliverJob(job,db,event=>inngest.send(event));}
export async function enqueueCareerJob(user,kind,raw){
 const input=parseJobInput(kind,raw);if(kind!=="RESUME_PARSE"&&!user.resume)throw new Error("Add a resume or career profile first.");
 const requestId=requestJobId(user.id,kind,raw?.requestId,input,user.resume?.updatedAt);
 if(requestId){const prior=await db.careerJob.findFirst({where:{id:requestId,userId:user.id,kind}});if(prior)return {job:publicJob(prior)};}
 const activeKey=`${user.id}:${kind}`;
 let job=await db.careerJob.findUnique({where:{activeKey}});
 if(!job && ["RESUME_ANALYSIS","INSIGHTS"].includes(kind)){job=await db.careerJob.findFirst({where:{userId:user.id,kind,status:"FAILED",resumeVersion:user.resume?.updatedAt||null},orderBy:{createdAt:"desc"}});if(job)return {job:publicJob(job)};}
 if(job && JSON.stringify(job.input,Object.keys(job.input).sort())!==JSON.stringify(input,Object.keys(input).sort()))throw new Error("Another task of this kind is already running. Wait for it to finish before starting a different request.");
 if(!job){
  await consumeAiBudget(user.id);
  try{job=await db.careerJob.create({data:{...(requestId?{id:requestId}:{}),userId:user.id,kind,input,activeKey,resumeVersion:user.resume?.updatedAt||null}});}catch(error){if(error.code!=="P2002")throw error;job=await db.careerJob.findUnique({where:{activeKey}});}
 }
 if(!job)throw new Error("This task changed. Please try again.");
 if(job.status==="QUEUED")await dispatchJob(job);
 return {job:publicJob(job)};
}
export async function queueForCurrentUser(kind,input){const user=await currentCareerUser();const parsed=parseJobInput(kind,input);if(kind==="ROADMAP"&&!parsed.forceRegenerate){const existing=await db.roadmap.findUnique({where:{userId:user.id}});if(existing)return existing;}return enqueueCareerJob(user,kind,{...parsed,requestId:input?.requestId});}
