"use client";
import { resolveCareerJob } from "@/lib/jobs/client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass, ExternalLink, Route } from "lucide-react";
import { saveRoadMap, setMilestoneCompletion } from "@/actions/road-map";
import { getSafeResourceUrl } from "@/lib/resource-url";
import { CareerMountain } from "@/components/career-preview";

const stages = ["Fundamentals", "Core", "Advanced", "Specialization"];
export default function CareerRoadmap({ roadmap: initialRoadmap, targetRole = "" }) {
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  useEffect(()=>{setRoadmap(initialRoadmap);},[initialRoadmap]);
  const [stage, setStage] = useState(() => {
    const next = initialRoadmap?.initialNodes?.find(node => !node.data?.completed);
    return stages.find(name => name.toLowerCase() === next?.data?.level?.toLowerCase()) || "Fundamentals";
  });
  const [selected, setSelected] = useState(null);
  const [role, setRole] = useState(targetRole);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const generationRequest=useRef(null);
  const nodes = Array.isArray(roadmap?.initialNodes) ? roadmap.initialNodes : [];
  const complete = nodes.filter(n => n.data?.completed).length;
  const group = node => stages.find(s => s.toLowerCase() === node.data?.level?.toLowerCase()) || "Fundamentals";
  const active = nodes.find(n => n.id === selected) || nodes.find(n => group(n) === stage && !n.data?.completed) || nodes.find(n => group(n) === stage);
  async function generate(event) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { const next = await resolveCareerJob(await saveRoadMap({ forceRegenerate: !!roadmap, targetRole: role, requestId:generationRequest.current ??= crypto.randomUUID() })); generationRequest.current=null;setRoadmap(next); setSelected(null); setStage("Fundamentals"); }
    catch (err) { if(err.code==="RESULT_REMOVED")generationRequest.current=null;setError(err.message || "Your roadmap could not be created. Please try again."); }
    finally { lock.current = false; setBusy(false); }
  }
  async function toggle(node) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { setRoadmap(await setMilestoneCompletion({ roadmapId: roadmap.id, nodeId: node.id, completed: !node.data?.completed })); }
    catch (err) { setError(err.message || "Progress could not be saved."); }
    finally { lock.current = false; setBusy(false); }
  }
  const resource = getSafeResourceUrl(active?.data?.link);
  return <div className="cw-roadmap-journey">
    <header className="cw-tool-heading"><div><p className="cw-eyebrow">A little progress, every day</p><h1>Your next chapter, mapped.</h1><p>A practical path from where you are to where you want to go. Work through it at your own pace.</p></div><Link className="cw-button cw-button-secondary" href="/career-paths"><Compass size={15}/> Explore career paths</Link></header>
    {error && <p role="alert" className="cw-inline-error">{error}</p>}
    {!roadmap ? <section className="cw-next-card cw-roadmap-welcome"><div><p className="cw-eyebrow">Start with a direction</p><h2>Big ambitions.<br/>Manageable steps.</h2><p>Build a learning plan based on your resume. Choose a target role, or explore growth in your current field.</p><RoadmapForm role={role} setRole={setRole} busy={busy} onSubmit={generate}/></div><CareerMountain/></section> : <>
      <section className="cw-next-card cw-plan-summary"><div><p className="cw-eyebrow">{roadmap.industry || "Your career plan"}</p><h2>{roadmap.roadmapTitle}</h2><p>{roadmap.description}</p><small>{roadmap.duration ? `Suggested pace: ${roadmap.duration} · ` : ""}AI-generated guidance; adjust the pace to your circumstances.</small></div><div className="cw-roadmap-progress"><strong>{complete}<span> / {nodes.length}</span></strong><p>milestones completed</p><progress aria-label="Roadmap completion" max={nodes.length || 1} value={complete}/><button className="cw-text-link" onClick={() => { const next = nodes.find(n => !n.data?.completed); if (next) { setStage(group(next)); setSelected(next.id); } }} disabled={complete === nodes.length}>Find my next step <ArrowRight size={14}/></button></div></section>
      <nav className="cw-stage-nav" aria-label="Roadmap stages">{stages.map((name, i) => <button key={name} aria-pressed={stage === name} onClick={() => { setStage(name); setSelected(null); }}><span>0{i + 1}</span><strong>{name}</strong><small>{nodes.filter(n => group(n) === name && n.data?.completed).length}/{nodes.filter(n => group(n) === name).length} done</small></button>)}</nav>
      <div className="cw-split-layout"><section className="cw-next-card"><p className="cw-eyebrow">Your milestones</p><h2>{stage}</h2><div className="cw-milestones">{nodes.filter(n => group(n) === stage).map((node, i) => <div className={active?.id === node.id ? "is-selected" : ""} key={node.id}><input aria-label={`Mark ${node.data?.label || node.data?.title} complete`} type="checkbox" checked={!!node.data?.completed} disabled={busy} onChange={() => toggle(node)}/><button aria-current={active?.id === node.id ? "step" : undefined} onClick={() => setSelected(node.id)}><small>STEP {String(i + 1).padStart(2, "0")}</small><strong>{node.data?.label || node.data?.title}</strong><span>{node.data?.completed ? "Completed" : "View milestone"} <ArrowRight size={13}/></span></button></div>)}</div>{!nodes.some(n => group(n) === stage) && <p className="cw-panel-intro">This plan has no milestones in this stage.</p>}</section>
      <aside className="cw-next-card cw-milestone-detail"><Route size={25}/>{active ? <><p className="cw-eyebrow">Make your next move</p><h2>{active.data?.label || active.data?.title}</h2><p>{active.data?.description || "Explore this skill, practice it, and collect evidence of what you learned."}</p>{resource && <a className="cw-button cw-button-secondary" href={resource} target="_blank" rel="noopener noreferrer">Explore resource <ExternalLink size={14}/></a>}<button disabled={busy} className="cw-button cw-button-primary" onClick={() => toggle(active)}><Check size={15}/>{active.data?.completed ? "Mark as incomplete" : busy ? "Saving…" : "Complete milestone"}</button><small>Progress is saved to your account.</small></> : <p>Select a milestone to see the details.</p>}</aside></div>
      <details className="cw-next-card cw-rebuild-plan"><summary>Change direction or rebuild your plan</summary><p>Generating a new plan replaces this roadmap and resets its completed milestones. Your current plan stays available if generation fails.</p><RoadmapForm role={role} setRole={setRole} busy={busy} onSubmit={generate} replacement/></details>
    </>}
  </div>;
}
function RoadmapForm({ role, setRole, busy, onSubmit, replacement }) {
  return <form onSubmit={onSubmit} className="cw-form"><label htmlFor="target-role">Target role <span>(optional)</span></label><input id="target-role" maxLength={120} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Product designer" disabled={busy}/>{replacement && <label className="cw-confirm-choice"><input type="checkbox" required disabled={busy}/> I understand this will replace my plan and reset its progress.</label>}<button className="cw-button cw-button-primary" disabled={busy}>{busy ? "Building your plan…" : replacement ? "Replace roadmap" : "Build my roadmap"}<ArrowRight size={15}/></button></form>;
}
