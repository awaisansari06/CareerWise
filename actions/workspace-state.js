"use server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { currentCareerUser } from "@/lib/jobs/queue";
import { sameVersion, safeQuiz } from "@/lib/jobs/policy";
import { revalidatePath } from "next/cache";

export async function getResumeWorkspace(){const user=await currentCareerUser();const saved=await db.resumeWorkspace.findUnique({where:{userId:user.id}});return saved&&sameVersion(saved.resumeVersion,user.resume?.updatedAt)?saved:null;}
function conflict(error){if(["P2002","P2034"].includes(error.code))throw new Error("Saved work changed in another tab. Copy your edits, then reload before saving again.");throw error;}
const workspaceInput=z.object({draft:z.string().max(60000),addressed:z.array(z.number().int().min(0).max(200)).max(201),version:z.number().int().min(-1),resumeVersion:z.string().datetime()});
export async function saveResumeWorkspace(raw){
 const input=workspaceInput.parse(raw),user=await currentCareerUser();
 if(!user.resume||!sameVersion(input.resumeVersion,user.resume.updatedAt))throw new Error("Your resume changed. Reload before saving this draft.");
 return db.$transaction(async tx=>{
  const current=await tx.resume.findUnique({where:{userId:user.id}});
  if(!sameVersion(input.resumeVersion,current?.updatedAt))throw new Error("Your resume changed. Reload before saving.");
  let saved;
  if(input.version===-1){saved=await tx.resumeWorkspace.create({data:{userId:user.id,resumeVersion:current.updatedAt,draft:input.draft,addressed:[...new Set(input.addressed)]}});}
  else{const changed=await tx.resumeWorkspace.updateMany({where:{userId:user.id,version:input.version,resumeVersion:current.updatedAt},data:{draft:input.draft,addressed:[...new Set(input.addressed)],version:{increment:1}}});if(!changed.count)throw new Error("This draft changed in another tab. Reload before editing.");saved=await tx.resumeWorkspace.findUnique({where:{userId:user.id}});}
  return saved;
 },{isolationLevel:"Serializable"}).catch(conflict);
}
export async function getCareerExploration(){const user=await currentCareerUser();return db.careerExploration.findUnique({where:{userId:user.id}});}
export async function saveCareerExploration(raw){
 const input=z.object({selectedRole:z.string().trim().min(1).max(120).nullable(),comparison:z.array(z.string().trim().min(1).max(120)).max(3),version:z.number().int().min(-1)}).parse(raw);
 const user=await currentCareerUser();
 const data={selectedRole:input.selectedRole,comparison:[...new Set(input.comparison)]};
 if(input.version===-1)return db.careerExploration.create({data:{userId:user.id,...data}}).catch(conflict);
 const changed=await db.careerExploration.updateMany({where:{userId:user.id,version:input.version},data:{...data,version:{increment:1}}});
 if(!changed.count)throw new Error("Your saved directions changed in another tab. Reload to continue.");
 return db.careerExploration.findUnique({where:{userId:user.id}});
}
export async function getActivePractice(){const user=await currentCareerUser();const draft=await db.assessment.findFirst({where:{userId:user.id,category:"draft"},orderBy:{createdAt:"desc"}});return draft?safeQuiz(draft):null;}
export async function savePracticeProgress(raw){
 const input=z.object({quizId:z.string().min(1).max(120),answers:z.array(z.string().max(10000).nullable()).max(30),version:z.number().int().min(0)}).parse(raw);
 const user=await currentCareerUser();const draft=await db.assessment.findFirst({where:{id:input.quizId,userId:user.id,category:"draft"}});
 if(!draft||draft.questions.length!==input.answers.length)throw new Error("Practice session not found. Reload to continue.");
 if(input.answers.some((answer,i)=>answer!==null&&!draft.questions[i].options.includes(answer)))throw new Error("Choose only a listed answer.");
 const changed=await db.assessment.updateMany({where:{id:draft.id,userId:user.id,category:"draft",progressVersion:input.version},data:{selectedAnswers:input.answers,progressVersion:{increment:1}}});
 if(!changed.count)throw new Error("This session changed in another tab. Reload before continuing.");
 revalidatePath("/interview/mock");return {version:input.version+1};
}
