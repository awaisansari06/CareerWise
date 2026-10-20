// A persisted task is an outbox entry. Failed delivery never deletes the request.
export async function deliverJob(job,database,send){
 const event={id:`${job.id}:${job.attempt}`,name:"careerwise/job.requested",data:{jobId:job.id,attempt:job.attempt}};
 try{await send(event);return {accepted:true};}
 catch{await database.careerJob.updateMany({where:{id:job.id,status:"QUEUED",attempt:job.attempt},data:{error:"Waiting for the background service. We will try delivery again automatically."}});return {accepted:false};}
}
