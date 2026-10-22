"use client";
import { ExternalLink } from 'lucide-react';
import { resolveMilestoneResources, resourceSearchLinks } from '@/lib/roadmap-resources';

const labels={unchecked:'Not checked yet',available:'Reachable',unavailable:'Link unavailable',unverified:'Could not verify',reported:'Reported by you'};
export default function MilestoneResources({node,industry,busy,onAction}) {
  const resources=resolveMilestoneResources(node);
  return <section className="cw-learning-resources" aria-label="Learning resources">
    <div className="cw-resource-heading"><h3>Learning resources</h3>{resources.length>0 && <button type="button" disabled={busy} onClick={()=>onAction()}>Check links</button>}</div>
    <p className="cw-resource-note">Official sources matched to this topic. Access and course requirements may vary.</p>
    {resources.map(item=>{const unavailable=['unavailable','reported'].includes(item.health.status);return <article className="cw-resource-card" key={item.id}>
      <span>{item.provider} · {item.format}</span>
      {unavailable?<strong>{item.title}</strong>:<a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<ExternalLink size={13}/></a>}
      <div><span title={item.health.checkedAt?`Checked ${new Date(item.health.checkedAt).toLocaleString()}`:undefined}>{labels[item.health.status] || labels.unchecked}</span>{!unavailable && <button type="button" disabled={busy} onClick={()=>onAction(item.id)} aria-label={`Report broken link: ${item.title}`}>Report broken link</button>}</div>
    </article>;})}
    {!resources.length && <p className="cw-resource-note">No catalog match yet. Search for a suitable lesson below.</p>}
    <details className="cw-resource-alternatives" open={!resources.length || resources.every(item=>['unavailable','reported'].includes(item.health.status))}><summary>Find more resources</summary>{resourceSearchLinks(node,industry).map(item=><a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<ExternalLink size={12}/></a>)}<p className="cw-resource-note">Search results are not checked or endorsed. A blocked check does not necessarily mean a link is broken.</p></details>
  </section>;
}
