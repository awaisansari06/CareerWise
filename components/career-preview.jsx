import { Check, ChevronRight, Circle, Compass, FileText, Flag, Home, Route, Sparkles, TrendingUp } from "lucide-react";
import { CareerWiseLogo } from "@/components/careerwise-logo";

export function CareerMountain({ className = "" }) {
  return <svg className={className} viewBox="0 0 360 210" fill="none" aria-hidden="true"><circle cx="270" cy="52" r="33" className="cw-mountain-sun" /><path d="M0 210 86 75l58 61 71-116 145 190Z" className="cw-mountain-back" /><path d="m86 75 19 135H0Zm129-55 26 190H112Z" className="cw-mountain-mid" /><path d="m215 20 145 190H241Z" className="cw-mountain-front" /><path d="M142 210c83-38 89-58 40-76-45-16-16-33 27-46 39-11 30-29 8-37" className="cw-mountain-path" strokeWidth="12" /><path d="M215 20V0m0 1h25l-7 8 7 8h-25" className="cw-mountain-flag" strokeWidth="3" /></svg>;
}

/** Labeled example content, independent of the authenticated dashboard. */
export function CareerPreview() {
  return (
    <div className="cw-product-preview" role="img" aria-label="Example career overview showing transferable strengths, skills to explore, and practical next steps for a product management role.">
      <div className="cw-preview-top"><span><i /><i /><i /></span><small>CareerWise · Example workspace</small><Sparkles size={13} /></div>
      <div className="cw-preview-body">
        <aside className="cw-preview-nav" aria-hidden="true"><div className="cw-preview-brand"><CareerWiseLogo /> CareerWise</div><span className="active"><Home /> Overview</span><span><Compass /> Career paths</span><span><FileText /> Resume</span><span><Route /> My roadmap</span><div className="cw-preview-nav-bottom">Small steps.<br /><strong>A brighter career.</strong><CareerMountain /></div></aside>
        <div className="cw-preview-main">
          <div className="cw-preview-heading"><div><small>YOUR NEXT CHAPTER</small><h2>Your career, in focus.</h2><p>A little clarity. A practical way forward.</p></div><span className="cw-chip">Example</span></div>
          <div className="cw-preview-cards"><div className="cw-preview-card"><small><Compass size={12} /> EXPLORE A PATH</small><div className="cw-fit-icon"><TrendingUp /></div><h3>Product Manager</h3><p>Build on your communication and analytical strengths.</p><span className="cw-preview-link">Explore this role <ChevronRight size={12} /></span></div><div className="cw-preview-card"><small><Sparkles size={12} /> SKILLS TO EXPLORE</small>{["Product strategy", "Customer research", "Stakeholder storytelling"].map((skill, index) => <div className="cw-preview-skill" key={skill}><span>0{index + 1}</span><div><strong>{skill}</strong><p>A direction for your next step</p></div></div>)}</div></div>
          <div className="cw-preview-bottom"><div className="cw-preview-card"><small><Flag size={12} /> YOUR NEXT STEPS</small>{["Understand your transferable skills", "Strengthen your resume story", "Practice a role-specific interview"].map((task, index) => <div className="cw-preview-task" key={task}>{index === 0 ? <Check className="done" /> : <Circle />}<span>{task}</span></div>)}</div><div className="cw-preview-destination"><CareerMountain /><strong>A clearer path forward.</strong></div></div>
        </div>
      </div>
    </div>
  );
}
