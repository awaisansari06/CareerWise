import nextEnv from '@next/env';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import {publishJob} from '../lib/jobs/publish.js';
nextEnv.loadEnvConfig(process.cwd(),false);
const {PrismaClient}=await import('@prisma/client');const db=new PrismaClient();
const rollback=new Error('ROLLBACK_SYNTHETIC_VERIFICATION');const checks=[];
try{
 await db.$transaction(async tx=>{
  const suffix=randomUUID();const user=await tx.user.create({data:{clerkUserId:`verification-${suffix}`,email:`verification-${suffix}@example.invalid`}});
  const resume=await tx.resume.create({data:{userId:user.id,content:JSON.stringify({skills:['Writing']})}});
  const job=await tx.careerJob.create({data:{userId:user.id,kind:'COVER_LETTER',input:{},activeKey:`${user.id}:COVER_LETTER`,resumeVersion:resume.updatedAt}});
  const adapter={$transaction:fn=>fn(tx)};
  const data={content:'Synthetic verification only',companyName:'Verification',jobTitle:'Writer',status:'draft'};
  const first=await publishJob(job.id,0,data,adapter);const replay=await publishJob(job.id,0,data,adapter);
  assert.equal(first.id,replay.id);assert.equal(await tx.coverLetter.count({where:{userId:user.id}}),1);checks.push('PostgreSQL publication replay creates one result');
  const saved=await tx.careerJob.findUnique({where:{id:job.id}});assert.equal(saved.status,'COMPLETED');assert.deepEqual(saved.input,{});assert.equal(saved.activeKey,null);checks.push('Completion and result persist together; private input cleared');
  assert.equal(await tx.careerJob.findFirst({where:{id:job.id,userId:'different-account'}}),null);checks.push('Owned query excludes another account');
  await tx.resumeWorkspace.create({data:{userId:user.id,resumeVersion:resume.updatedAt,draft:'Saved draft',addressed:[1]}});
  assert.equal((await tx.resumeWorkspace.findUnique({where:{userId:user.id}})).draft,'Saved draft');
  const changed=await tx.resumeWorkspace.updateMany({where:{userId:user.id,version:99},data:{draft:'Should not save'}});assert.equal(changed.count,0);checks.push('Resume draft persists and stale version cannot overwrite');
  await tx.careerExploration.create({data:{userId:user.id,selectedRole:'Writer',comparison:['Writer','Editor']}});
  assert.deepEqual((await tx.careerExploration.findUnique({where:{userId:user.id}})).comparison,['Writer','Editor']);checks.push('Role comparison persists');
  const quizJob=await tx.careerJob.create({data:{userId:user.id,kind:'INTERVIEW_QUIZ',input:{},resumeVersion:resume.updatedAt}});
  const quiz=await publishJob(quizJob.id,0,{questions:[{id:1,question:'Choose evidence',options:['Verify','Guess'],answer:'Verify',explanation:'Check first'}]},adapter);
  assert.equal(quiz.questions[0].answer,undefined);
  await tx.assessment.update({where:{id:quiz.quizId},data:{selectedAnswers:['Verify'],progressVersion:{increment:1}}});
  assert.deepEqual((await tx.assessment.findUnique({where:{id:quiz.quizId}})).selectedAnswers,['Verify']);checks.push('Quiz answer key stays private and selected answers persist');
  const stale=await tx.careerJob.create({data:{userId:user.id,kind:'COVER_LETTER',input:{},resumeVersion:new Date(0)}});
  await assert.rejects(publishJob(stale.id,0,data,adapter),/profile changed/);assert.equal(await tx.coverLetter.count({where:{userId:user.id}}),1);checks.push('Stale profile blocks publication');
  throw rollback;
 },{isolationLevel:'Serializable',timeout:60000,maxWait:20000});
}catch(error){if(error!==rollback){console.error(JSON.stringify({passed:false,code:error.code||error.name}));process.exitCode=1;}else{const report={passed:true,checks,transactionRolledBack:true,scope:'Prisma/PostgreSQL integration; not Clerk or Inngest end-to-end'};fs.writeFileSync('output/product-audit/database-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}}
finally{await db.$disconnect();}
