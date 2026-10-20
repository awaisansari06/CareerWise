import { z } from "zod";
export const kinds=["RESUME_PARSE","RESUME_ANALYSIS","INSIGHTS","INTERVIEW_QUIZ","COVER_LETTER","ROADMAP"];
export function parseJobInput(kind,input){
 const schemas={
 RESUME_PARSE:z.object({filename:z.string().min(1).max(255),pdf:z.string().min(8).max(7_000_000),careerGoal:z.enum(["grow","change","first","explore"])}),
 RESUME_ANALYSIS:z.object({}), INTERVIEW_QUIZ:z.object({}),
 INSIGHTS:z.object({industry:z.string().trim().min(1).max(120)}),
 ROADMAP:z.object({targetRole:z.string().trim().max(120).default(""),forceRegenerate:z.boolean().default(false)}),
 COVER_LETTER:z.object({companyName:z.string().trim().min(1).max(200),jobTitle:z.string().trim().min(1).max(200),jobDescription:z.string().trim().min(20).max(20000)})};
 if(!schemas[kind])throw new Error("Unsupported job type.");
 const result=schemas[kind].safeParse(input);
 if(!result.success)throw new Error(result.error.issues[0]?.message||"Invalid request.");
 return result.data;
}
export function publicJob(job){return {id:job.id,kind:job.kind,status:job.status,attempt:job.attempt,error:job.error,result:job.status==="COMPLETED"?job.result:null,createdAt:job.createdAt,updatedAt:job.updatedAt};}
export function sameVersion(left,right){return (left?new Date(left).getTime():null)===(right?new Date(right).getTime():null);}
export function safeQuiz(draft){return {quizId:draft.id,questions:draft.questions.map(q=>({id:q.id,question:q.question,options:q.options})),answers:draft.selectedAnswers||[],progressVersion:draft.progressVersion};}
export function jobDestination(job){const routes={RESUME_PARSE:"/dashboard",RESUME_ANALYSIS:"/resume",INSIGHTS:"/career-paths",INTERVIEW_QUIZ:"/interview",COVER_LETTER:job.result?.id?`/ai-cover-letter/${job.result.id}`:"/ai-cover-letter",ROADMAP:"/roadmap"};return routes[job.kind]||"/dashboard";}
