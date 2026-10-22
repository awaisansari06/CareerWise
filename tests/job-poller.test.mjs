import test from 'node:test';
import assert from 'node:assert/strict';
import {createJobPoller} from '../lib/jobs/poller.js';

function harness(fetchJobs){
 const timers=new Map();let serial=0,refreshes=0,updates=0,visible=true;const errors=[];
 const worker=createJobPoller({fetchJobs,onJobs(){updates++;},onError:error=>errors.push(error),onComplete(){refreshes++;},isVisible:()=>visible,setTimer(fn,delay){const id=++serial;timers.set(id,{fn,delay});return id;},clearTimer:id=>timers.delete(id)});
 return {worker,timers,errors,get refreshes(){return refreshes;},get updates(){return updates;},hide(){visible=false;worker.pause();},show(){visible=true;return worker.wake();},async tick(){const [id,timer]=timers.entries().next().value;timers.delete(id);await timer.fn();}};
}
test('completed jobs on first load do not refresh; idle polling waits a full interval',async()=>{
 let calls=0;const h=harness(async()=>{calls++;return [{id:'old',status:'COMPLETED'}];});
 await h.worker.wake();assert.equal(calls,1);assert.equal(h.refreshes,0);assert.equal(h.timers.size,1);assert.equal([...h.timers.values()][0].delay,60000);
 await Promise.resolve();assert.equal(calls,1,'publishing job state must not fetch again');
 await h.tick();assert.equal(calls,2);assert.equal(h.updates,1);assert.equal(h.refreshes,0);h.worker.stop();
});
test('a newly completed job refreshes once and rescheduling never accumulates timers',async()=>{
 let status='RUNNING';const h=harness(async()=>[{id:'job',status}]);
 await h.worker.wake();assert.equal([...h.timers.values()][0].delay,4000);
 status='COMPLETED';await h.tick();assert.equal(h.refreshes,1);assert.equal(h.timers.size,1);
 await h.worker.wake();assert.equal(h.refreshes,1);assert.equal(h.timers.size,1);h.worker.stop();
});
test('overlapping events share a single request and unmount ignores late responses',async()=>{
 let resolve,calls=0;const h=harness(()=>{calls++;return new Promise(done=>{resolve=done;});});
 const first=h.worker.wake();const second=h.worker.wake();await Promise.resolve();assert.equal(calls,1);
 h.worker.stop();resolve([{id:'job',status:'RUNNING'}]);await Promise.all([first,second]);
 assert.equal(h.updates,0);assert.equal(h.timers.size,0);assert.equal(h.refreshes,0);
});
test('hidden tabs stop polling and resume with one request when visible',async()=>{
 let calls=0;const h=harness(async()=>{calls++;return [];});await h.worker.wake();h.hide();assert.equal(h.timers.size,0);
 await h.worker.wake();assert.equal(calls,1);await h.show();assert.equal(calls,2);assert.equal(h.timers.size,1);h.worker.stop();
});
test('failed requests back off and a subsequent wake can recover, including synchronous failure',async()=>{
 let fail=true;const h=harness(()=>{if(fail)throw new Error('offline');return Promise.resolve([]);});await h.worker.wake();
 assert.equal([...h.timers.values()][0].delay,30000);assert.match(h.errors[0].message,/offline/);
 fail=false;await h.worker.wake();assert.equal(h.updates,1);assert.equal(h.errors.at(-1),null);h.worker.stop();
});
