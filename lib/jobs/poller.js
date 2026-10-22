/** One request at a time, followed by one timer. Rendering cannot restart polling. */
export function createJobPoller({fetchJobs,onJobs,onError,onComplete,isVisible=()=>true,setTimer=setTimeout,clearTimer=clearTimeout}) {
  let stopped=false,inFlight=null,timer=null,initialized=false,signature='';
  let previous=new Map();
  const clear=()=>{if(timer!==null)clearTimer(timer);timer=null;};
  async function wake() {
    if(stopped || inFlight || !isVisible())return inFlight;
    clear();
    inFlight=Promise.resolve().then(async()=>{
      let delay=60000;
      try {
        const jobs=await fetchJobs();
        if(stopped)return;
        if(!Array.isArray(jobs))throw new Error('Invalid task status');
        const completed=initialized && jobs.some(job=>job.status==='COMPLETED' && previous.get(job.id)!=='COMPLETED');
        previous=new Map(jobs.map(job=>[job.id,job.status]));
        initialized=true;
        const nextSignature=JSON.stringify(jobs);
        if(signature!==nextSignature){signature=nextSignature;onJobs(jobs);}
        onError(null);
        if(completed)onComplete();
        delay=jobs.some(job=>['QUEUED','RUNNING'].includes(job.status))?4000:60000;
      } catch(error) {
        if(!stopped)onError(error);
        delay=30000;
      } finally {
        inFlight=null;
        if(!stopped && isVisible())timer=setTimer(wake,delay);
      }
    });
    return inFlight;
  }
  return {wake,pause:clear,stop(){stopped=true;clear();}};
}
