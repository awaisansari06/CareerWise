"use server";
import { db } from "@/lib/prisma";
import { currentCareerUser, dispatchJob } from "@/lib/jobs/queue";
import { publicJob, parseJobInput, safeQuiz } from "@/lib/jobs/policy";
import { consumeAiBudget } from "@/lib/ai-budget";
import { auth } from "@clerk/nextjs/server";
const statusFields={id:true,kind:true,status:true,attempt:true,error:true,result:true,createdAt:true,updatedAt:true};
export async function listCareerJobs(){
  const {userId}=await auth();
  if(!userId)throw new Error('Unauthorized');
  const user=await db.user.findUnique({where:{clerkUserId:userId},select:{id:true}});
  if(!user)throw new Error('User not found');
  const jobs=await db.careerJob.findMany({
    where:{
      userId:user.id,
      OR:[
        {status:{in:["QUEUED","RUNNING"]}},
        {dismissed:false,status:{in:["FAILED","COMPLETED"]}}
      ]
    },
    select:statusFields,
    orderBy:{createdAt:"desc"},
    take:30
  });
  const queued=[],failed=[],completed=[];
  for(const j of jobs){
    if(["QUEUED","RUNNING"].includes(j.status)){
      if(queued.length<6)queued.unshift(j);
    }else if(!j.dismissed){
      if(j.status==="FAILED"&&failed.length<10)failed.push(j);
      else if(j.status==="COMPLETED"&&completed.length<5)completed.push(j);
    }
  }
  return [...queued,...failed,...completed].map(job=>publicJob({...job,result:job.kind==='COVER_LETTER' && typeof job.result?.id==='string'?{id:job.result.id}:null}));
}
export async function getCareerJob(id){if(typeof id!=="string"||id.length>120)throw new Error("Invalid task.");const user=await currentCareerUser();const job=await db.careerJob.findFirst({where:{id,userId:user.id},select:statusFields});if(!job)throw new Error("Task not found.");if(job.status==="COMPLETED"&&job.kind==="INTERVIEW_QUIZ"){const draft=typeof job.result?.quizId==="string"?await db.assessment.findFirst({where:{id:job.result.quizId,userId:user.id}}):null;return publicJob({...job,result:!draft?{deleted:true}:draft.category==="draft"?safeQuiz(draft):{completedSession:true}});}
if(job.status==="COMPLETED"&&job.result?.id&&["COVER_LETTER","ROADMAP"].includes(job.kind)){const model=job.kind==="COVER_LETTER"?db.coverLetter:db.roadmap;const current=await model.findFirst({where:{id:job.result.id,userId:user.id}});return publicJob({...job,result:current?JSON.parse(JSON.stringify(current)):{deleted:true}});}return publicJob(job);}
export async function retryCareerJob(id){
 const user=await currentCareerUser();if(typeof id!=="string"||id.length>120)throw new Error("Invalid task.");
 const job=await db.careerJob.findFirst({where:{id,userId:user.id,status:{in:["FAILED","QUEUED"]}}});if(!job)throw new Error("Task cannot be retried.");
 if(job.status==="QUEUED"){await dispatchJob(job);return publicJob(job);}
 if(job.kind!=="RESUME_PARSE"&&!user.resume)throw new Error("Add a profile first.");
 let input=job.input;if(job.kind==="INSIGHTS"){let industry=user.industry;try{industry=JSON.parse(user.resume.content).industry||industry;}catch{}input={industry};}input=parseJobInput(job.kind,input);await consumeAiBudget(user.id);
 try{const changed=await db.careerJob.updateMany({where:{id,userId:user.id,status:"FAILED",attempt:job.attempt},data:{status:"QUEUED",input,activeKey:`${user.id}:${job.kind}`,attempt:{increment:1},resumeVersion:user.resume?.updatedAt||null,error:null,completedAt:null,startedAt:null,dismissed:false}});if(!changed.count)throw new Error("Task already changed.");}catch(error){if(error.code==="P2002")throw new Error("A task of this kind is already running.");throw error;}
 const next=await db.careerJob.findFirst({where:{id,userId:user.id}});await dispatchJob(next);return publicJob(next);
}
export async function dismissCareerJob(id){const user=await currentCareerUser();if(typeof id!=="string")throw new Error("Invalid task.");await db.careerJob.updateMany({where:{id,userId:user.id,status:{in:["COMPLETED","FAILED"]}},data:{dismissed:true}});}
