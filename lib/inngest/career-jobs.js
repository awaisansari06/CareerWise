import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { generateTask } from "@/lib/jobs/generators";
import { publishJob } from "@/lib/jobs/publish";
import { sameVersion } from "@/lib/jobs/policy";
import { NonRetriableError } from "inngest";

export const processCareerJob=inngest.createFunction({
 id:"process-career-job",name:"Process CareerWise task",triggers:[{event:"careerwise/job.requested"}],retries:2,
 concurrency:{limit:1,key:"event.data.jobId"},
 onFailure:async({event})=>{const data=event.data.event?.data;if(typeof data?.jobId!=="string"||!Number.isInteger(data.attempt)||data.attempt<0)return;await db.careerJob.updateMany({where:{id:data.jobId,attempt:data.attempt,status:{in:["QUEUED","RUNNING"]}},data:{status:"FAILED",activeKey:null,error:"This task could not finish. Your saved work is safe. Retry to use your latest profile.",completedAt:new Date()}});}
},async({event,step})=>{
 const {jobId,attempt}=event.data;
 if(typeof jobId!=="string"||jobId.length>120||!Number.isInteger(attempt)||attempt<0)throw new NonRetriableError("Invalid task event");
 const job=await step.run("load-and-start",async()=>{
  const current=await db.careerJob.findUnique({where:{id:jobId},include:{user:{include:{resume:true}}}});
  if(!current || current.attempt!==attempt || ["COMPLETED","FAILED"].includes(current.status))return null;
  if(!sameVersion(current.resumeVersion,current.user.resume?.updatedAt))throw new NonRetriableError("Profile changed; retry with the current profile.");
  await db.careerJob.updateMany({where:{id:jobId,attempt,status:"QUEUED"},data:{status:"RUNNING",startedAt:new Date(),error:null}});
  return {id:current.id};
 });
 if(!job)return {ignored:true};
 const generated=await step.run("generate",async()=>{const current=await db.careerJob.findUnique({where:{id:jobId},include:{user:{include:{resume:true}}}});if(!current||current.attempt!==attempt||current.status!=="RUNNING")throw new NonRetriableError("Task no longer active");if(!sameVersion(current.resumeVersion,current.user.resume?.updatedAt))throw new NonRetriableError("Profile changed");return generateTask(current.kind,current.input,current.user);});
 return step.run("publish-once",()=>publishJob(jobId,attempt,generated,db));
});

// Persist-before-send outbox recovery: a failed HTTP send does not lose the task.
export const recoverCareerJobs=inngest.createFunction({id:"recover-career-jobs",triggers:[{cron:"*/2 * * * *"}],retries:2},async({step})=>{
 const pending=await step.run("pending",()=>db.careerJob.findMany({where:{status:"QUEUED"},select:{id:true,attempt:true},take:100,orderBy:{createdAt:"asc"}}));
 for(const job of pending)await step.sendEvent(`dispatch-${job.id}-${job.attempt}`,{id:`${job.id}:${job.attempt}`,name:"careerwise/job.requested",data:{jobId:job.id,attempt:job.attempt}});
 await step.run("timeout-undelivered",()=>db.careerJob.updateMany({where:{status:"QUEUED",updatedAt:{lt:new Date(Date.now()-30*60000)}},data:{status:"FAILED",activeKey:null,error:"The background service did not start this task. Retry to continue.",completedAt:new Date()}}));
 await step.run("timeout-abandoned",()=>db.careerJob.updateMany({where:{status:"RUNNING",startedAt:{lt:new Date(Date.now()-30*60000)}},data:{status:"FAILED",activeKey:null,error:"The background service timed out. Retry this task to continue.",completedAt:new Date()}}));
 await step.run("remove-old-job-payloads",()=>db.careerJob.deleteMany({where:{status:{in:["COMPLETED","FAILED"]},completedAt:{lt:new Date(Date.now()-30*86400000)}}}));
 return {dispatched:pending.length};
});
