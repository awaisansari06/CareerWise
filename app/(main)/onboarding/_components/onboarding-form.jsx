"use client";
import { MAX_RESUME_SIZE, RESUME_SIZE_LABEL } from "@/lib/upload-limits";
import { resolveCareerJob } from "@/lib/jobs/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileText, Sparkles, Upload } from "lucide-react";
import { uploadResume, createCareerProfile } from "@/actions/resume";
import { careerGoals, careerProfileSchema } from "@/lib/career-profile";
import { CareerMountain } from "@/components/career-preview";
export default function ResumeUpload() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [goal, setGoal] = useState("explore");
  const [profile, setProfile] = useState({ name: "", industry: "", skills: "", background: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const heading = useRef(null);
  useEffect(() => { if (step > 0) heading.current?.focus(); }, [step]);
  function chooseFile(candidate) {
    setError("");
    if (!candidate) return;
    if (candidate.size > MAX_RESUME_SIZE) { setError(`Choose a PDF ${RESUME_SIZE_LABEL} or smaller.`); return; }
    if (!candidate.name.toLowerCase().endsWith(".pdf") || (candidate.type && candidate.type !== "application/pdf")) { setError("Please choose a PDF resume."); return; }
    setFile(candidate);
  }
  function next(event) {
    event.preventDefault(); setError("");
    if (step === 0) {
      if (mode === "upload" && !file) { setError("Choose your resume to continue."); return; }
      if (mode === "manual") { const result = careerProfileSchema.safeParse({ ...profile, careerGoal: goal }); if (!result.success) { setError(result.error.issues[0].message); return; } }
    }
    setStep(step + 1);
  }
  async function finish() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      if (mode === "upload") {
        const data = new FormData(); data.append("resume", file); data.append("careerGoal", goal);
        const result = await resolveCareerJob(await uploadResume(data));
        if (!result.success) throw new Error(result.error);
      } else { await createCareerProfile({ ...profile, careerGoal: goal }); }
      router.push("/dashboard"); router.refresh();
    } catch (err) { setError(err.message || "Could not set up your profile. Please try again."); lock.current = false; setBusy(false); }
  }
  return <div className="cw-design cw-onboarding"><aside className="cw-onboarding-story"><p className="cw-eyebrow">Welcome to your next chapter</p><h1>A clearer direction.<br/>A stronger you.</h1><p>Start with your story. We’ll help you see the possibilities and take the next step.</p><CareerMountain/><div className="cw-onboarding-promise"><Sparkles size={20}/><div><h2>Built around your background</h2><p>Resume feedback, career exploration, interview practice, and a roadmap you can work through.</p></div></div></aside>
    <section className="cw-onboarding-form"><nav className="cw-setup-steps" aria-label="Setup progress">{["Your background", "Your direction", "Ready to begin"].map((title, i) => <div key={title} aria-current={step === i ? "step" : undefined} className={step >= i ? "is-active" : ""}><span>{step > i ? <Check size={14}/> : i + 1}</span><small>{title}</small></div>)}</nav>
    <p className="cw-eyebrow">Step {step + 1} of 3</p><h2 ref={heading} tabIndex={-1}>{["Let’s start with you.", "What’s your next chapter?", "You’re ready to move forward."][step]}</h2><p className="cw-panel-intro">{["Upload a resume, or tell us about your background. You can be just starting out.", "Choose the direction that feels right today. You can explore other paths as you go.", "We’ll use your background to personalize your workspace. Review AI suggestions before acting on them."][step]}</p>
    {error && <p role="alert" className="cw-inline-error">{error}</p>}
    {step === 0 && <form className="cw-form" onSubmit={next}><div className="cw-mode-switch"><button type="button" aria-pressed={mode === "upload"} onClick={() => { setMode("upload"); setError(""); }}>Upload resume</button><button type="button" aria-pressed={mode === "manual"} onClick={() => { setMode("manual"); setError(""); }}>Create a profile</button></div>{mode === "upload" ? <label className="cw-upload-zone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); chooseFile(e.dataTransfer.files[0]); }}><Upload size={30}/><strong>{file ? file.name : "Drop your resume here"}</strong><span>{file ? "Click to choose another PDF" : "or click to browse your files"}</span><small>PDF · Up to {RESUME_SIZE_LABEL}</small><input className="sr-only" aria-label="Choose resume PDF" type="file" accept=".pdf,application/pdf" onChange={e => chooseFile(e.target.files[0])}/></label> : <>{[["name", "Your name", "e.g. Alex Shah"], ["industry", "Career field", "e.g. Marketing, education, healthcare"], ["skills", "Skills, separated by commas", "e.g. Research, communication, Excel"]].map(([key, title, placeholder]) => <div key={key}><label htmlFor={key}>{title}</label><input id={key} required maxLength={key === "skills" ? 2000 : key === "name" ? 150 : 120} value={profile[key]} placeholder={placeholder} onChange={e => setProfile({ ...profile, [key]: e.target.value })}/></div>)}<label htmlFor="background">Experience, studies, or projects</label><textarea id="background" required minLength={20} maxLength={10000} rows={5} value={profile.background} onChange={e => setProfile({ ...profile, background: e.target.value })} placeholder="Tell us what you’ve worked on, studied, or helped achieve."/></>}<button className="cw-button cw-button-primary">Continue <ArrowRight size={15}/></button></form>}
    {step === 1 && <form onSubmit={next} className="cw-form"><fieldset className="cw-goal-options"><legend className="sr-only">Choose your career goal</legend>{careerGoals.map(option => <label key={option.id}><input type="radio" name="career-goal" value={option.id} checked={goal === option.id} onChange={() => setGoal(option.id)}/><span><strong>{option.title}</strong><small>{option.description}</small></span></label>)}</fieldset><div className="cw-draft-actions"><button type="button" className="cw-button cw-button-secondary" onClick={() => setStep(0)}><ArrowLeft size={14}/>Back</button><button className="cw-button cw-button-primary">Continue <ArrowRight size={15}/></button></div></form>}
    {step === 2 && <><div className="cw-setup-review"><FileText size={24}/><div><small>Your background</small><strong>{mode === "upload" ? file?.name : profile.name}</strong><p>{mode === "upload" ? "Resume will be analyzed when you begin." : `${profile.industry} · Profile ready`}</p></div></div><div className="cw-setup-review"><Sparkles size={24}/><div><small>Your direction</small><strong>{careerGoals.find(option => option.id === goal)?.title}</strong></div></div><div className="cw-draft-actions"><button disabled={busy} className="cw-button cw-button-secondary" onClick={() => setStep(1)}><ArrowLeft size={14}/>Back</button><button disabled={busy} className="cw-button cw-button-primary" onClick={finish}>{busy ? mode === "upload" ? "Analyzing your resume…" : "Creating your profile…" : "Open my workspace"}<ArrowRight size={15}/></button></div><p className="cw-data-note">Your profile and extracted text are saved to your account. The PDF is held privately for processing and retry, then removed when parsing succeeds. Failed task payloads are scheduled for cleanup after 30 days.</p></>}
    </section></div>;
}
