"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Compass, Search, X } from "lucide-react";
import { saveCareerExploration } from "@/actions/workspace-state";
import { formatInrLakhs } from "@/lib/salary-utils";
import { getRoleEvidence } from "@/lib/career-path-evidence";

export default function CareerPaths({ insights, resume, exploration }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(exploration?.selectedRole || null);
  const [compare, setCompare] = useState(exploration?.comparison || []);
  const [version,setVersion]=useState(exploration?.version ?? -1);
  const [saveState,setSaveState]=useState("");
  async function saveDirections(){if(saveState==="Saving…")return;setSaveState("Saving…");try{const saved=await saveCareerExploration({selectedRole:active?.title||null,comparison:compare,version});setVersion(saved.version);setSaveState("Directions saved to your account.");}catch(error){setSaveState(error.message||"Could not save directions.");}}
  const detail = useRef(null);
  const roles = (Array.isArray(insights?.careerPath) ? insights.careerPath : []).filter(r => typeof r?.title === "string" && r.title.trim());
  const filtered = roles.filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
  const active = filtered.find(r => r.title === selected) || filtered[0];
  const skills = resume?.document?.sections?.find(s => s.key === "skills")?.items || [];
  const evidence = getRoleEvidence(active, skills, insights?.recommendedSkills);
  function select(role) {
    setSelected(role.title);setSaveState("");
    if (window.matchMedia("(max-width: 900px)").matches) requestAnimationFrame(() => detail.current?.focus());
  }
  function toggleComparison(title) { setSaveState(""); setCompare(current => current.includes(title) ? current.filter(t => t !== title) : current.length < 3 ? [...current, title] : current); }
  const salary = role => Number(role?.salary) > 0 ? formatInrLakhs(Number(role.salary)) : "Unavailable";
  return <div className="cw-career-explorer">
    <header className="cw-tool-heading"><div><p className="cw-eyebrow">Possibilities, with perspective</p><h1>Find a direction worth exploring.</h1><p>Compare roles in {insights?.industry || resume?.document?.industry || "your field"}, see the skills you can build on, and choose a practical next step.</p></div><span className="cw-domain-chip"><Compass size={16}/>{roles.length} career possibilities</span></header>
    <div className="cw-workspace-save"><p role="status">{saveState || "Keep your selected direction and comparison for your next visit."}</p><button className="cw-button" disabled={saveState==="Saving…"} onClick={saveDirections}>Save my directions <Check size={16}/></button></div>
    <div className="cw-explorer-intro"><p>Start with curiosity. Choose a role to look closer.</p><small>AI-generated guidance · India · Annual salary estimates</small></div>
    <div className="cw-split-layout cw-path-layout"><section aria-label="Career possibilities">
      <label className="cw-search"><Search size={17}/><input aria-label="Search career paths" placeholder="Find a role…" value={query} onChange={e => setQuery(e.target.value)}/><span>{filtered.length} roles</span></label>
      <div className="cw-role-options">{filtered.map((role,index) => {
        const data = getRoleEvidence(role, skills, insights?.recommendedSkills);
        return <article key={role.title + index} className={active?.title === role.title ? "is-selected" : ""}>
          <button className="cw-role-select" aria-pressed={active?.title === role.title} onClick={() => select(role)}><span className="cw-role-index">{String(index+1).padStart(2,"0")}</span><span><strong>{role.title}</strong><small>{salary(role)}{Number(role.salary)>0 ? " / year · estimate" : " salary estimate"}</small>{data.scope === "role" && <em>{data.transferable.length} listed skills in common</em>}</span><ArrowRight size={17}/></button>
          <label className="cw-compare-choice"><input type="checkbox" checked={compare.includes(role.title)} onChange={() => toggleComparison(role.title)} disabled={compare.length >= 3 && !compare.includes(role.title)}/> Compare <span className="sr-only">{role.title}</span></label>
        </article>;
      })}</div>
      {!filtered.length && <section className="cw-next-card cw-tool-empty"><Compass size={28}/><h2>{roles.length ? "No matching paths" : "Choose your own direction."}</h2><p>{roles.length ? "Try a broader search." : "Industry suggestions are unavailable. You can still create a roadmap for a role you have in mind."}</p><Link className="cw-button" href="/roadmap">Choose a direction <ArrowRight size={15}/></Link></section>}
      <p className="cw-data-note">Select up to three roles to compare. These are possibilities to investigate, not individual fit scores or job offers.</p>
    </section>
    <aside ref={detail} tabIndex={-1} className="cw-path-detail cw-next-card" aria-label="Selected career path">
      <p className="cw-eyebrow">A closer look</p><h2 key={active?.title} className="cw-detail-title">{active?.title || "Your next chapter"}</h2>
      {active && <><div className="cw-role-salary"><strong>{salary(active)}</strong><span>AI-estimated annual salary · INR</span></div>{typeof active.description === "string" && <p>{active.description}</p>}
      <section className="cw-role-evidence"><h3><Check size={16}/> What you can build on</h3><p>{evidence.scope === "role" ? "Skills listed in your resume that also appear in this role’s suggested requirements." : "Your saved insights have industry-level skills only. These overlaps provide a starting point, rather than evidence of fit for this particular role."}</p><div className="cw-skill-tags">{evidence.transferable.map(skill => <span key={skill}>{skill}</span>)}</div>{!evidence.transferable.length && <p>No exact skill matches are listed yet. Review your resume for relevant experience you could make clearer.</p>}</section>
      <section className="cw-role-evidence"><h3>{evidence.scope === "role" ? "Skills to investigate" : "Industry skills to investigate"}</h3><div className="cw-skill-tags">{evidence.toExplore.map(skill => <span key={skill}>{skill}</span>)}</div><p>{evidence.toExplore.length ? "Not listed in your resume. You may already have experience to add; this is not a proficiency assessment." : "No additional skill suggestions are available."}</p></section>
      <Link className="cw-button" href={`/roadmap?role=${encodeURIComponent(active.title)}`}>Build a path to this role <ArrowRight size={16}/></Link><small>A roadmap turns your background and target role into learning milestones.</small></>}
    </aside></div>
    {compare.length > 0 && <section className="cw-comparison" aria-label="Role comparison"><header><div><p className="cw-eyebrow">Side by side</p><h2>{compare.length === 1 ? "Choose another role to compare." : "A clearer view of your options."}</h2></div><button className="cw-text-link" onClick={() => {setCompare([]);setSaveState("");}}><X size={15}/>Clear selection</button></header><div className="cw-table-scroll" role="region" aria-label="Selected role comparison" tabIndex={0}><table><thead><tr><th scope="col">Role</th><th scope="col">Annual estimate</th><th scope="col">Listed skill overlap</th><th scope="col">Next step</th></tr></thead><tbody>{roles.filter(r=>compare.includes(r.title)).map(role => { const data=getRoleEvidence(role,skills,insights?.recommendedSkills); return <tr key={role.title}><th scope="row">{role.title}</th><td>{salary(role)}</td><td>{data.scope === "role" ? data.transferable.join(", ") || "No exact matches" : "Role-specific data unavailable"}</td><td><Link className="cw-text-link" href={`/roadmap?role=${encodeURIComponent(role.title)}`}>Build roadmap <ArrowRight size={14}/></Link></td></tr>; })}</tbody></table></div></section>}
  </div>;
}
