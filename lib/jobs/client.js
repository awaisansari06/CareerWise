import { getCareerJob } from "@/actions/career-jobs";
// Server data is authoritative. This wait improves immediate feedback; it is never required for completion.
export async function resolveCareerJob(response){
 if(!response?.job)return response;
 window.dispatchEvent(new Event("careerwise:jobs-changed"));
 const deadline=Date.now()+5*60*1000;let job=response.job;if(job.status==="COMPLETED")job=await getCareerJob(job.id);
 while(Date.now()<deadline){
  if(job.status==="COMPLETED"){if(job.result?.completedSession){const error=new Error("This practice set is already completed. Open Interview lab for its feedback, or start a new request.");error.code="RESULT_REMOVED";throw error;}if(job.result?.deleted){const error=new Error("This result was removed. Start a new request to create another one.");error.code="RESULT_REMOVED";throw error;}return job.result;}
  if(job.status==="FAILED")throw new Error(job.error||"Task failed. Retry it from background tasks.");
  await new Promise(resolve=>setTimeout(resolve,2000));job=await getCareerJob(job.id);
 }
 throw new Error("Your task is still saved. You can leave this page and follow its progress under Background tasks.");
}
