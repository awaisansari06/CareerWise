import { sameVersion, safeQuiz } from "./policy.js";

// Result + domain changes publish together; a replay cannot create a second letter/session.
export async function publishJob(jobId, attempt, generated, database){
 return database.$transaction(async tx=>{
  const job=await tx.careerJob.findUnique({where:{id:jobId}});
  if(!job || job.attempt!==attempt || job.status==="FAILED")return null;
  if(job.status==="COMPLETED")return job.result;
  const resume=await tx.resume.findUnique({where:{userId:job.userId}});
  if(!sameVersion(job.resumeVersion,resume?.updatedAt))throw new Error("Your profile changed. Start this task again with the updated profile.");
  let result;
  if(job.kind==="RESUME_PARSE"){
   const saved=await tx.resume.upsert({where:{userId:job.userId},create:{...generated,userId:job.userId},update:generated});
   await tx.resumeAnalysis.deleteMany({where:{userId:job.userId}});
   await tx.resumeWorkspace.deleteMany({where:{userId:job.userId}});
   await tx.user.update({where:{id:job.userId},data:{isUploaded:true,industry:null}});
   // Keep existing roadmap and completed milestones; the owner can explicitly replace it.
   result={success:true,resume:{id:saved.id,filename:saved.filename,updatedAt:saved.updatedAt.toISOString(),skills:JSON.parse(saved.content).skills||[]}};
  }else if(job.kind==="RESUME_ANALYSIS"){
   result=await tx.resumeAnalysis.upsert({where:{userId:job.userId},create:{userId:job.userId,...generated},update:generated});
  }else if(job.kind==="ROADMAP"){
   result=await tx.roadmap.upsert({where:{userId:job.userId},create:{userId:job.userId,...generated},update:generated});
  }else if(job.kind==="COVER_LETTER"){
   result=await tx.coverLetter.create({data:{...generated,userId:job.userId}});
  }else if(job.kind==="INTERVIEW_QUIZ"){
   const draft=await tx.assessment.create({data:{userId:job.userId,category:"draft",quizScore:0,questions:generated.questions}});
   result=safeQuiz(draft);
  }else if(job.kind==="INSIGHTS"){
   const industry=job.input.industry;
   if(!generated.salaryRanges?.length || !generated.careerPath?.length)throw new Error("Industry guidance was unavailable. Please try again.");
   const data={...generated,industry,lastUpdated:new Date(),nextUpdate:new Date(Date.now()+604800000)};
   result=await tx.industryInsight.upsert({where:{industry},update:data,create:data});
   await tx.user.update({where:{id:job.userId},data:{industry}});
  }else throw new Error("Unsupported job type");
  const json=JSON.parse(JSON.stringify(result));
  const committed=await tx.careerJob.updateMany({where:{id:jobId,attempt,status:{in:["QUEUED","RUNNING"]}},data:{status:"COMPLETED",activeKey:null,input:{},result:json,error:null,completedAt:new Date()}});
  if(committed.count!==1)throw new Error("The job changed before publication.");
  return json;
 },{isolationLevel:"Serializable",timeout:15000});
}
