import { RESOURCE_CATALOG } from './roadmap-resources.js';
const hosts=new Set(RESOURCE_CATALOG.map(item=>new URL(item.url).hostname));
export async function checkResourceHealth(resourceId, fetcher=fetch) {
  const item=RESOURCE_CATALOG.find(resource=>resource.id===resourceId);
  if(!item) throw new Error('Unknown resource');
  const checkedAt=new Date().toISOString();
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),6000);
  try {
    let url=item.url, method='HEAD';
    for(let attempt=0;attempt<5;attempt++) {
      const response=await fetcher(url,{method,redirect:'manual',signal:controller.signal,cache:'no-store',headers:method==='GET'?{Range:'bytes=0-0'}:{}});
      await response.body?.cancel();
      if([301,302,303,307,308].includes(response.status)) {
        const location=response.headers.get('location');
        if(!location) break;
        const next=new URL(location,url);
        if(next.protocol!=='https:' || next.username || next.password || next.port || !hosts.has(next.hostname)) break;
        url=next.href;continue;
      }
      if([405,501].includes(response.status) && method==='HEAD') {method='GET';continue;}
      return {status:response.status>=200 && response.status<300?'available':[404,410].includes(response.status)?'unavailable':'unverified',checkedAt};
    }
  } catch { /* A blocked or timed out request does not prove the link is broken. */ }
  finally {clearTimeout(timeout);}
  return {status:'unverified',checkedAt};
}
