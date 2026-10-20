"use client";
import { resolveCareerJob } from "@/lib/jobs/client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronRight, Circle, Compass, FileText, Home, Loader2, MapPin, Mic, PenLine, RefreshCw, Route, Sparkles, TrendingUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadResume } from "@/actions/resume";
import { CareerMountain } from "@/components/career-preview";
import WorkspaceSidebar from "@/components/workspace-sidebar";
import PageMotion from "@/components/page-motion";
import { getDashboardNextStep, getSkillComparison } from "@/lib/dashboard-state";
import { formatInrLakhs } from "@/lib/salary-utils";

function dateLabel(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
}

function PanelHeading({ title, href, label = "Explore" }) {
  return <div className="cw-panel-heading"><h2>{title}</h2>{href && <Link href={href} className="cw-text-link">{label} <ArrowUpRight size={15} /></Link>}</div>;
}

export default function DashboardView({ insights, initialResume, progress = {}, insightsUnavailable = false }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentResume, setCurrentResume] = useState(initialResume);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeReplaced, setResumeReplaced] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => { setCurrentResume(initialResume); setResumeReplaced(false); }, [initialResume]);

  const analysis = resumeReplaced ? null : progress.analysis;
  const roadmap = resumeReplaced ? null : progress.roadmap;
  const activeInsights = resumeReplaced ? null : insights;
  const skillDirections = getSkillComparison(currentResume?.skills, activeInsights?.recommendedSkills);
  const nextStep = getDashboardNextStep({ hasResume: !!currentResume, hasAnalysis: !!analysis, assessmentCount: progress.assessmentCount, hasRoadmap: !!roadmap });
  const firstName = progress.name?.trim().split(/\s+/)[0];
  const salaryRanges = (activeInsights?.salaryRanges || []).filter((range) => range?.role && Number(range.max) > 0);
  const topSalary = salaryRanges[0];
  const resumeDate = dateLabel(currentResume?.updatedAt);
  const updatedDate = dateLabel(activeInsights?.lastUpdated);
  const steps = [
    { title: "Bring your experience into focus", detail: currentResume ? `Resume uploaded${resumeDate ? ` · ${resumeDate}` : ""}` : "Start by uploading your resume", done: !!currentResume, href: "/onboarding" },
    { title: "Strengthen your resume", detail: analysis ? `Review saved${dateLabel(analysis.updatedAt) ? ` · ${dateLabel(analysis.updatedAt)}` : ""}` : "Find specific ways to improve", done: !!analysis, href: "/resume" },
    { title: "Practice your next conversation", detail: progress.assessmentCount ? `${progress.assessmentCount} practice ${progress.assessmentCount === 1 ? "session" : "sessions"} completed` : "Prepare with questions for your background", done: !!progress.assessmentCount, href: "/interview" },
    { title: "Give your goals a roadmap", detail: roadmap ? roadmap.roadmapTitle : "Build a plan you can act on", done: !!roadmap, href: "/roadmap" },
  ];
  const completedSteps = steps.filter((step) => step.done).length;

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploading) return;
    if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) { toast.error("Choose a PDF resume."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Your PDF must be 5 MB or smaller."); return; }
    const formData = new FormData();
    formData.append("resume", file);
    setIsUploading(true);
    setUploadStatus("Reading your resume and updating your profile…");
    try {
      const response = await resolveCareerJob(await uploadResume(formData));
      if (!response?.success || !response.resume) throw new Error(response?.error || "Could not update your resume. Please try again.");
      setCurrentResume(response.resume);
      setResumeReplaced(true);
      setUploadStatus("Resume updated. Refreshing your career overview…");
      toast.success("Resume updated. Your new profile is ready.");
      startRefresh(() => router.refresh());
    } catch (error) { setUploadStatus(error.message); toast.error(error.message); }
    finally { setIsUploading(false); }
  }

  return (
    <div className="cw-design cw-dashboard">
      <WorkspaceSidebar />
      <PageMotion className="cw-dashboard-main">
        <header className="cw-dashboard-heading"><div><p className="cw-eyebrow">Your career overview</p><h1>Welcome back{firstName ? `, ${firstName}` : ""}.</h1><p>A little clarity. Your next best move.</p></div><div className="cw-momentum"><Sparkles size={19} /><span>Progress starts with<br /><strong>one practical step.</strong></span></div></header>
        <div className="cw-dashboard-top">
          <section className="cw-next-action"><p className="cw-eyebrow">Your next best move</p><h2>{nextStep.title}</h2><p>{nextStep.description}</p>{nextStep.href ? <Link href={nextStep.href} className="cw-button cw-button-white">{nextStep.label}<ArrowRight size={17} /></Link> : <button type="button" className="cw-button cw-button-white" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>{isUploading ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}{nextStep.label}</button>}<CareerMountain className="cw-action-mountain" /><span className="cw-action-footnote"><Compass size={15} /> Built around your experience</span></section>
          <section className="cw-panel cw-profile-panel"><PanelHeading title="Your foundation" href="/resume" label="View resume" /><span className="cw-mini-label">CAREER FIELD</span><h3>{activeInsights?.industry || "Your professional profile"}</h3><div className="cw-profile-file"><span className="cw-icon-tile"><FileText size={21} /></span><div><strong>{currentResume?.filename || "No resume yet"}</strong><small>{resumeDate ? `Updated ${resumeDate}` : "Upload a PDF to get started"}</small></div></div><p className="cw-mini-label">SKILLS FROM YOUR RESUME</p><div className="cw-skill-tags">{currentResume?.skills?.length ? currentResume.skills.slice(0, 6).map((skill) => <span key={skill}>{skill}</span>) : <p className="cw-muted">Your extracted skills will appear here.</p>}</div>{currentResume?.skills?.length > 6 && <Link href="/resume" className="cw-text-link">View all {currentResume.skills.length} skills <ChevronRight size={14} /></Link>}<button type="button" className="cw-button cw-button-secondary cw-upload-button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isRefreshing}>{isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}{isUploading ? "Reading resume…" : "Update resume"}</button><small className="cw-muted">PDF · up to 5 MB</small><input ref={fileInputRef} className="sr-only" type="file" accept=".pdf,application/pdf" aria-label="Upload a PDF resume" disabled={isUploading} onChange={handleFileChange} /><span className="sr-only" role="status">{uploadStatus}</span></section>
          <section className="cw-panel cw-progress-panel"><PanelHeading title="Your progress" href="/roadmap" label="Roadmap" /><p className="cw-progress-summary"><strong>{completedSteps} of {steps.length}</strong> foundations in place</p><ol className="cw-progress-list">{steps.map((step) => <li key={step.title}><span className={step.done ? "cw-step-state is-done" : "cw-step-state"}>{step.done ? <Check size={13} /> : <Circle size={13} />}</span><Link href={step.href}><strong>{step.title}</strong><small>{step.detail}</small></Link><ChevronRight size={14} /></li>)}</ol></section>
        </div>
        <div className="cw-dashboard-middle"><section className="cw-panel cw-market-panel"><PanelHeading title="Your market, at a glance" /><p className="cw-panel-intro">{activeInsights ? `${activeInsights.industry} · Indian job market` : "A broader view of the opportunities around you."}</p>{activeInsights ? <><div className="cw-market-grid"><div><TrendingUp className="cw-market-icon" size={22} /><span className="cw-mini-label">HIRING DEMAND</span><h3>{activeInsights.demandLevel || "Not available"}</h3><p>{activeInsights.marketOutlook ? `${activeInsights.marketOutlook} market outlook` : "Outlook not available"}</p></div><div><span className="cw-market-icon cw-currency">₹</span><span className="cw-mini-label">{topSalary?.role || "ANNUAL SALARY"}</span><h3>{topSalary ? `${formatInrLakhs(Number(topSalary.min))} – ${formatInrLakhs(Number(topSalary.max))}` : "Not available"}</h3><p>Estimated annual range · INR</p></div><div><Compass className="cw-market-icon" size={22} /><span className="cw-mini-label">IN-DEMAND SKILLS</span><ol>{activeInsights.topSkills?.slice(0, 3).map((skill, index) => <li key={skill}><span>{index + 1}</span>{skill}</li>)}</ol>{!activeInsights.topSkills?.length && <p>No skill trends available yet.</p>}</div></div><p className="cw-data-note">AI-generated industry estimates{updatedDate ? ` · Updated ${updatedDate}` : ""}. Use as guidance and verify against current job listings.</p><a href="#market-details" className="cw-text-link">Explore market details <ArrowRight size={15} /></a></> : <div className="cw-insight-empty"><Compass size={28} /><h3>{isRefreshing || resumeReplaced ? "Updating your industry overview" : "Your market insights are unavailable"}</h3><p>{insightsUnavailable ? "Your resume and career tools are ready. Try refreshing your industry insights in a moment." : "Your latest resume will help shape your industry overview."}</p><button type="button" className="cw-button cw-button-secondary" disabled={isRefreshing} onClick={() => startRefresh(() => router.refresh())}><RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />{isRefreshing ? "Refreshing…" : "Try again"}</button></div>}</section>
          <section className="cw-panel cw-focus-panel"><PanelHeading title="A direction to explore" href="/roadmap" label="Build on it" />{skillDirections.length ? <><p className="cw-panel-intro">Industry-recommended skills not listed in your resume. You may already have experience to add.</p><div className="cw-direction-list">{skillDirections.slice(0, 3).map((skill) => <Link href="/roadmap" key={skill}><span className="cw-icon-tile"><BookOpen size={18} /></span><div><strong>{skill}</strong><small>Explore in your learning plan</small></div><ArrowUpRight size={16} /></Link>)}</div></> : <><div className="cw-focus-illustration"><Route size={35} /></div><h3>Your next chapter has options.</h3><p className="cw-panel-intro">Build a roadmap to explore skills and career directions that connect to your background.</p><Link href="/roadmap" className="cw-text-link">Explore my roadmap <ArrowRight size={15} /></Link></>}</section></div>
        {(analysis?.tipsForImprovement?.[0] || progress.latestAssessment?.improvementTip) && <section className="cw-feedback-strip"><Sparkles size={22} /><div><span className="cw-mini-label">FROM YOUR LATEST {analysis?.tipsForImprovement?.[0] ? "RESUME REVIEW" : "PRACTICE"}</span><p>{analysis?.tipsForImprovement?.[0] || progress.latestAssessment.improvementTip}</p></div><Link href={analysis?.tipsForImprovement?.[0] ? "/resume" : "/interview"} aria-label="Read your latest feedback"><ArrowRight size={20} /></Link></section>}
        <section className="cw-quick-tools" aria-label="Career tools"><Link href="/interview"><span className="cw-icon-tile"><Mic size={20} /></span><div><strong>Find your interview confidence</strong><small>{progress.assessmentCount ? `${progress.assessmentCount} sessions completed · Keep practicing` : "Start your first practice session"}</small></div><ArrowUpRight size={18} /></Link><Link href="/ai-cover-letter"><span className="cw-icon-tile"><PenLine size={20} /></span><div><strong>Tell your story in a cover letter</strong><small>{progress.coverLetterCount ? `${progress.coverLetterCount} saved ${progress.coverLetterCount === 1 ? "letter" : "letters"} · Open your workspace` : "Create a tailored draft for your next role"}</small></div><ArrowUpRight size={18} /></Link></section>
        {activeInsights && <MarketDetails insights={activeInsights} salaryRanges={salaryRanges} />}
      </PageMotion>
    </div>
  );
}

function MarketDetails({ insights, salaryRanges }) {
  return <section id="market-details" className="cw-market-details"><details><summary><span><TrendingUp size={20} /> Explore your industry in detail</span><ChevronRight size={19} /></summary><div className="cw-market-detail-body"><div className="cw-detail-metrics"><div><span>Industry growth estimate</span><strong>{Number.isFinite(insights.growthRate) ? `${insights.growthRate}%` : "Unavailable"}</strong></div><div><span>Estimated job openings</span><strong>{Number.isFinite(insights.jobOpenings) && insights.jobOpenings > 0 ? insights.jobOpenings.toLocaleString("en-IN") : "Unavailable"}</strong></div><div><span>Openings change</span><strong>{Number.isFinite(insights.jobOpeningsChange) ? `${insights.jobOpeningsChange > 0 ? "+" : ""}${insights.jobOpeningsChange}%` : "Unavailable"}</strong></div></div>
    {!!salaryRanges.length && <div className="cw-salary-table"><h3>Annual salary benchmarks</h3><p className="cw-muted">AI-estimated ranges in INR, for comparison.</p><div className="cw-table-scroll" tabIndex={0} role="region" aria-label="Salary benchmarks"><table><thead><tr><th scope="col">Role</th><th scope="col">Minimum</th><th scope="col">Median</th><th scope="col">Maximum</th><th scope="col">Location</th></tr></thead><tbody>{salaryRanges.map((range, i) => <tr key={`${range.role}-${i}`}><th scope="row">{range.role}</th><td>{formatInrLakhs(Number(range.min))}</td><td>{formatInrLakhs(Number(range.median))}</td><td>{formatInrLakhs(Number(range.max))}</td><td>{range.location || "India"}</td></tr>)}</tbody></table></div></div>}
    <div className="cw-detail-grid">{!!insights.keyTrends?.length && <div><h3>Industry trends</h3><ul>{insights.keyTrends.map((trend) => <li key={trend}>{trend}</li>)}</ul></div>}{!!insights.topRegions?.length && <div><h3>Regional opportunities</h3>{insights.topRegions.map((region) => <div className="cw-detail-row" key={region.name}><span><MapPin size={14} />{region.name}</span><strong>{Number(region.jobs).toLocaleString("en-IN")}</strong></div>)}</div>}{!!insights.careerPath?.length && <div><h3>Career possibilities</h3>{insights.careerPath.map((role, index) => <div className="cw-detail-row" key={`${role.title}-${index}`}><span>{role.title}</span>{Number(role.salary) > 0 && <strong>{formatInrLakhs(Number(role.salary))}</strong>}</div>)}</div>}{!!insights.certifications?.length && <div><h3>Certifications to explore</h3><ul>{insights.certifications.map((certification) => <li key={certification}>{certification}</li>)}</ul></div>}{!!insights.forecast?.length && <div><h3>Growth forecast</h3><p className="cw-muted">AI projections, not guaranteed outcomes.</p>{insights.forecast.map((point, index) => <div className="cw-detail-row" key={`${point.year}-${index}`}><span>{point.year}</span><strong>{point.growth}%</strong></div>)}</div>}{!!insights.recommendedSkills?.length && <div><h3>Recommended skills</h3><div className="cw-skill-tags">{insights.recommendedSkills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>}</div><p className="cw-data-note">AI-generated guidance{dateLabel(insights.lastUpdated) ? ` · Updated ${dateLabel(insights.lastUpdated)}` : ""}{dateLabel(insights.nextUpdate) ? ` · Next scheduled refresh ${dateLabel(insights.nextUpdate)}` : ""}</p>
    </div></details></section>;
}
