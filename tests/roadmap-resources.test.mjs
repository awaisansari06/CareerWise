import test from 'node:test';
import assert from 'node:assert/strict';
import { RESOURCE_CATALOG, resolveMilestoneResources, repairRoadmapResourceNodes, resourceSearchLinks } from '../lib/roadmap-resources.js';
import { checkResourceHealth } from '../lib/roadmap-resource-health.js';
const node=(label,extra={})=>({id:'one',position:{x:10,y:20},data:{label,completed:true,...extra}});
test('repair wrong roadmap domain and provide official alternatives without resetting progress',()=>{
 const original=[node('Computer Science Fundamentals',{link:'https://roadmap.dev/computer-science',custom:'keep'})];
 const snapshot=structuredClone(original);
 const repaired=repairRoadmapResourceNodes(original);
 assert.equal(repaired[0].data.link,'https://roadmap.sh/computer-science');
 assert.deepEqual(repaired[0].data.resourceIds,['cs-roadmap','cs50']);
 assert.equal(repaired[0].data.completed,true);
 assert.equal(repaired[0].data.custom,'keep');
 assert.deepEqual(repaired[0].position,original[0].position);
 assert.deepEqual(original,snapshot);
 assert.deepEqual(repairRoadmapResourceNodes(repaired),repaired);
});
test('unknown URLs and unknown topics use search instead of invented resources',()=>{
 const item=node('Bridge structural mechanics',{link:'https://made-up.example/lesson'});
 assert.deepEqual(resolveMilestoneResources(item),[]);
 assert.equal(repairRoadmapResourceNodes([item])[0].data.link,null);
 const links=resourceSearchLinks(node('Law & ethics?'),'Legal');
 assert.equal(new URL(links[0].url).searchParams.get('q'),'Law & ethics? Legal learning tutorial');
 assert.ok(links.every(item=>new URL(item.url).protocol==='https:'));
});
test('topic matching uses words and prioritizes titles; unavailable resources have alternatives',()=>{
 assert.equal(resolveMilestoneResources(node('Java programming')).some(item=>item.id==='javascript'),false);
 assert.equal(resolveMilestoneResources(node('React',{description:'Learn git and web development'}))[0].id,'react');
 const git=resolveMilestoneResources(node('Version Control & Git Workflow',{resourceHealth:{'git-book':{status:'unavailable'}}}));
 assert.equal(git[0].id,'github-git');
 assert.equal(git[1].health.status,'unavailable');
});
test('catalog uses unique IDs and HTTPS addresses without credentials',()=>{
 assert.equal(new Set(RESOURCE_CATALOG.map(item=>item.id)).size,RESOURCE_CATALOG.length);
 for(const item of RESOURCE_CATALOG){const url=new URL(item.url);assert.equal(url.protocol,'https:');assert.equal(url.username,'');}
});
test('reachability distinguishes unavailable links from provider blocks',async()=>{
 for(const [code,status] of [[200,'available'],[404,'unavailable'],[410,'unavailable'],[403,'unverified'],[429,'unverified'],[500,'unverified']]){
  assert.equal((await checkResourceHealth('cs50',async()=>new Response(null,{status:code}))).status,status);
 }
 assert.equal((await checkResourceHealth('cs50',async()=>{throw new Error('timeout');})).status,'unverified');
});
test('HEAD fallback and allowed redirects work; redirects to arbitrary hosts are never fetched',async()=>{
 const methods=[];
 const result=await checkResourceHealth('cs50',async(url,options)=>{methods.push(options.method);return new Response(null,{status:options.method==='HEAD'?405:206});});
 assert.equal(result.status,'available');assert.deepEqual(methods,['HEAD','GET']);
 let count=0;
 const blocked=await checkResourceHealth('cs50',async()=>{count++;return new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}});});
 assert.equal(blocked.status,'unverified');assert.equal(count,1);
 const redirects=[];
 assert.equal((await checkResourceHealth('cs50',async(url)=>{redirects.push(url);return redirects.length===1?new Response(null,{status:302,headers:{location:'/x/2026/'}}):new Response(null,{status:200});})).status,'available');
 assert.equal(redirects[1],'https://cs50.harvard.edu/x/2026/');
 await assert.rejects(checkResourceHealth('https://localhost'),/Unknown resource/);
});
