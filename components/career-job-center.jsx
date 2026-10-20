"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CircleAlert, Loader2, RefreshCw, X } from "lucide-react";
import { listCareerJobs, retryCareerJob, dismissCareerJob } from "@/actions/career-jobs";
import { jobDestination } from "@/lib/jobs/policy";
const labels={RESUME_PARSE:"Reading your resume",RESUME_ANALYSIS:"Resume feedback",INSIGHTS:"Career and industry insights",INTERVIEW_QUIZ:"Interview questions",COVER_LETTER:"Cover letter",ROADMAP:"Career roadmap"};
export default function CareerJobCenter(){
 const [jobs,setJobs]=useState([]),[error,setError]=useState(""),[busy,setBusy]=useState(null);const pathname=usePathname();const router=useRouter(),previous=useRef(new Map()),mounted=useRef(true);
 const loading=useRef(false);
 const load=useCallback(async()=>{if(loading.current)return;loading.current=true;try{const next=await listCareerJobs();if(!mounted.current)return;let changed=false;for(const j of next){const key=`${pathname}:${j.id}`;if(j.status==="COMPLETED" && previous.current.get(key)!=="COMPLETED")changed=true;previous.current.set(key,j.status);}setJobs(next);setError("");if(changed)router.refresh();}catch{if(mounted.current)setError("Background task status is unavailable. Check your connection and try again.");}finally{loading.current=false;}},[router,pathname]);
 useEffect(()=>{mounted.current=true;load();const hasActive=jobs.some(j=>["QUEUED","RUNNING"].includes(j.status));const timer=setInterval(load,hasActive?4000:30000);const onVisibility=()=>{if(document.visibilityState==="visible")load();};window.addEventListener("careerwise:jobs-changed",load);window.addEventListener("visibilitychange",onVisibility);return()=>{mounted.current=false;clearInterval(timer);window.removeEventListener("careerwise:jobs-changed",load);window.removeEventListener("visibilitychange",onVisibility);};},[load,jobs]);
 async function action(job,retry){setBusy(job.id);try{if(retry)await retryCareerJob(job.id);else await dismissCareerJob(job.id);await load();}catch(err){setError(err.message||"Could not update the task.");}finally{setBusy(null);}}
 if(!jobs.length&&!error)return null;
 return <CareerJobList jobs={jobs} error={error} busy={busy} load={load} action={action}/>;
}
export function CareerJobList({jobs,error="",busy=null,load,action}){
 return <section className="cw-design cw-job-center" aria-label="Background tasks"><details open={jobs.some(j=>j.status!=="COMPLETED")}><summary><span>Background tasks</span><strong>{jobs.filter(j=>["QUEUED","RUNNING"].includes(j.status)).length} in progress</strong></summary>{error&&<p role="alert">{error}<button onClick={load} className="cw-text-link">Try again</button></p>}<ul>{jobs.map(job=><li key={job.id} data-status={job.status}><span aria-hidden="true">{job.status==="COMPLETED"?<CheckCircle2 size={19}/>:job.status==="FAILED"?<CircleAlert size={19}/>:<Loader2 size={19} className="animate-spin"/>}</span><div><strong>{labels[job.kind]}</strong><p role="status">{job.status==="QUEUED"?"Queued · saved to your account":job.status==="RUNNING"?"Working · safe to leave this page":job.status==="FAILED"?job.error:"Completed · result saved"}</p>{job.status==="QUEUED"&&job.error&&<small>{job.error}</small>}</div>{job.status==="COMPLETED"?<><Link className="cw-text-link" href={jobDestination(job)}>Open result</Link><button aria-label={`Dismiss ${labels[job.kind]}`} disabled={busy===job.id} onClick={()=>action(job,false)}><X size={16}/></button></>:<button className="cw-text-link" disabled={busy===job.id||job.status==="RUNNING"} onClick={()=>action(job,true)}><RefreshCw size={14}/>{job.status==="FAILED"?"Retry":"Check delivery"}</button>}</li>)}</ul></details></section>;
}
