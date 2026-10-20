"use client";
import { resolveCareerJob } from "@/lib/jobs/client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, ChevronDown, Copy, Download, FileText, Lightbulb, Loader2, Pencil, RefreshCw, Search, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveResumeWorkspace } from "@/actions/workspace-state";
import { uploadResume } from "@/actions/resume";
import { diagnosticScore, resumeDocumentToText } from "@/lib/resume-review";
import { practiceDate } from "@/lib/interview-state";

function FeedbackList({ items, empty, positive = false }) {
  if (!items?.length) return <p className="cw-muted">{empty}</p>;
  return <ul className="cw-review-feedback-list">{items.map((item, index) => <li key={`${index}-${item}`}><span className={positive ? "is-positive" : ""}>{positive ? <Check size={13} /> : <ArrowRight size={13} />}</span><p>{item}</p></li>)}</ul>;
}

export default function ResumeReview({ resume, analysis, workspace }) {
  const router = useRouter();
  const uploadRef = useRef(null);
  const draftRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const [replacingResume, setReplacingResume] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => workspace?.draft ?? resumeDocumentToText(resume?.document));
  const [status, setStatus] = useState("");
  const [addressed, setAddressed] = useState(workspace?.addressed || []);
  const [workspaceVersion,setWorkspaceVersion]=useState(workspace?.version ?? -1);
  const [savingDraft,setSavingDraft]=useState(false);
  const [draftSaved,setDraftSaved]=useState(!!workspace);
  async function persistDraft(){if(savingDraft)return;setSavingDraft(true);try{const saved=await saveResumeWorkspace({draft,addressed,version:workspaceVersion,resumeVersion:new Date(resume.updatedAt).toISOString()});setWorkspaceVersion(saved.version);setDraftSaved(true);toast.success("Draft and reviewed suggestions saved to your account.");}catch(error){toast.error(error.message||"Could not save your draft.");}finally{setSavingDraft(false);}}
  const document = resume?.document;
  const recommendations = analysis?.tipsForImprovement || [];
  const busy = isUploading || isRefreshing || replacingResume;

  async function copyText(text, message) {
    try { await navigator.clipboard.writeText(text); toast.success(message); }
    catch { toast.error("Could not copy automatically. Select the text and copy it manually."); }
  }

  function editDraft() {
    setEditing(true);
    requestAnimationFrame(() => draftRef.current?.focus());
  }

  function downloadDraft() {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${(resume?.filename || "Resume").replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_")}-draft.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function replaceResume(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) { toast.error("Choose a PDF resume."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Your PDF must be 5 MB or smaller."); return; }
    setIsUploading(true);
    setStatus("Reading your resume…");
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const response = await resolveCareerJob(await uploadResume(formData));
      if (!response?.success) throw new Error(response?.error || "Could not upload your resume.");
      setReplacingResume(true);
      setStatus("Resume uploaded. Preparing a fresh review…");
      toast.success("Resume uploaded. Your new review is on its way.");
      startRefresh(() => router.refresh());
    } catch (error) { setStatus(error.message); toast.error(error.message); }
    finally { setIsUploading(false); }
  }

  return (
    <div className="cw-resume-review">
      <header className="cw-tool-heading">
        <div><p className="cw-eyebrow">Resume review</p><h1>Make your experience<br className="cw-wide-break" /> easier to see.</h1><p>Clear feedback. Practical improvements. A stronger version of your story.</p></div>
        <div className="cw-tool-heading-action"><button type="button" className="cw-button cw-button-secondary" disabled={busy} onClick={() => uploadRef.current?.click()}>{isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}{isUploading ? "Reading resume…" : "Upload new resume"}</button><small>PDF · up to 5 MB</small></div>
        <input ref={uploadRef} type="file" accept=".pdf,application/pdf" className="sr-only" aria-label="Upload a new PDF resume" disabled={busy} onChange={replaceResume} />
      </header>
      <span className="sr-only" role="status">{status}</span>
      {resume && <div className="cw-workspace-save"><p role="status">{draftSaved ? "Draft and review progress saved to your account" : "Save to keep your draft and reviewed suggestions after refresh"}</p><button className="cw-button" disabled={savingDraft || draftSaved} onClick={persistDraft}>{savingDraft ? "Saving…" : "Save draft & review progress"}</button></div>}
      {replacingResume ? <section className="cw-panel cw-tool-empty" role="status"><Loader2 size={30} className="animate-spin" /><h2>Your new chapter is taking shape.</h2><p>Your updated resume is saved. We’re refreshing the preview and feedback.</p></section> : !resume ? <section className="cw-panel cw-tool-empty"><FileText size={32} /><h2>Start with what you’ve done.</h2><p>Upload your resume to see your experience and personalized feedback side by side.</p><button type="button" className="cw-button" onClick={() => uploadRef.current?.click()}>Upload my resume <ArrowRight size={16} /></button></section> : (
        <>
          <div className="cw-review-context"><span><span className="cw-status-dot" /> Your active resume</span><p>{resume.filename || "Resume"}</p><small>Updated {practiceDate(resume.updatedAt)}</small></div>
          <div className="cw-review-grid">
            <section className="cw-document-panel" aria-labelledby="document-title">
              <div className="cw-document-toolbar"><div><FileText size={17} /><h2 id="document-title">{editing ? "Your working draft" : "Extracted resume"}</h2></div><button type="button" className="cw-icon-button" aria-label={editing ? "Show extracted resume" : "Edit a resume draft"} onClick={() => setEditing(!editing)}>{editing ? <FileText size={16} /> : <Pencil size={16} />}</button></div>
              {editing ? <div className="cw-draft-editor"><label htmlFor="resume-draft">Edit your draft</label><p>Save your draft and reviewed suggestions to your account. Upload a revised PDF to update the profile used by AI tools.</p><textarea ref={draftRef} id="resume-draft" value={draft} maxLength={60000} onChange={(event) => {setDraft(event.target.value);setDraftSaved(false);}} spellCheck /><div className="cw-draft-actions"><button type="button" className="cw-button cw-button-secondary" disabled={!draft.trim()} onClick={() => copyText(draft, "Draft copied.")}><Copy size={14} />Copy draft</button><button type="button" className="cw-button" disabled={!draft.trim()} onClick={downloadDraft}><Download size={14} />Download .txt</button></div></div> : <div className="cw-extracted-document">
                {document?.rawText ? <pre>{document.rawText}</pre> : <><h3>{document?.name || "Your resume"}</h3>{document?.industry && <p className="cw-document-industry">{document.industry}</p>}{!!document?.contact?.length && <p className="cw-document-contact">{document.contact.join(" · ")}</p>}{document?.sections?.map((section) => <section key={section.key}><h4>{section.title}</h4>{section.key === "skills" || section.key === "languages" ? <p>{section.items.join(" · ")}</p> : section.items.map((item, index) => <p key={index} className="cw-document-entry">{item}</p>)}</section>)}</>}
              </div>}
              <div className="cw-document-caption"><Search size={13} /><p>This is a preview of extracted content. It does not reproduce your PDF’s layout.</p></div>
            </section>
            <section className="cw-review-analysis" aria-label="Personalized resume feedback">
              {!analysis ? <div className="cw-panel cw-tool-empty"><Sparkles size={27} /><h2>Your resume is saved. Check your review status.</h2><p>Background tasks above shows the saved review status. Use its Retry action if generation failed; your extracted content stays available here.</p><button type="button" className="cw-button cw-button-secondary" disabled={isRefreshing} onClick={() => startRefresh(() => router.refresh())}><RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />{isRefreshing ? "Loading review…" : "Refresh review status"}</button></div> : <Tabs defaultValue="content" className="cw-review-tabs">
                <TabsList aria-label="Resume feedback views"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="content">Content</TabsTrigger><TabsTrigger value="keywords">Keywords</TabsTrigger></TabsList>
                <TabsContent value="content"><div className="cw-review-tab-body"><p className="cw-eyebrow">A little stronger, one edit at a time</p><h2>{recommendations.length ? `${recommendations.length} ${recommendations.length === 1 ? "opportunity" : "opportunities"} to strengthen your resume.` : "Give your experience a fresh look."}</h2><p className="cw-panel-intro">Use these suggestions to refine your draft. Keep every change accurate to your experience.</p><div className="cw-feedback-checklist" role="status"><strong>{addressed.length} of {recommendations.length} reviewed</strong><span>Save your review progress with your working draft.</span></div><div className="cw-recommendations">{recommendations.map((tip, index) => <details key={index} open={index === 0}><summary><span className="cw-recommendation-number">{String(index + 1).padStart(2, "0")}</span><span>{tip}</span><ChevronDown size={17} /></summary><div className="cw-recommendation-body"><label className="cw-addressed-choice"><input type="checkbox" checked={addressed.includes(index)} onChange={() => {setDraftSaved(false);setAddressed(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index]);}}/> I have addressed this in my draft</label><p>Work on this in your draft, then upload a revised PDF when you’re ready to refresh your review.</p><div><button type="button" className="cw-text-link" onClick={editDraft}><Pencil size={14} />Edit my draft</button><button type="button" className="cw-text-link" onClick={() => copyText(tip, "Suggestion copied.")}><Copy size={14} />Copy suggestion</button></div></div></details>)}</div>{!recommendations.length && <p className="cw-review-no-items">There are no saved content suggestions in this review. Check the overview and keywords for more context.</p>}<button type="button" className="cw-button cw-review-edit-button" onClick={editDraft}>Work on my draft <ArrowRight size={16} /></button></div></TabsContent>
                <TabsContent value="overview"><div className="cw-review-tab-body"><p className="cw-eyebrow">Your experience, in focus</p><h2>A foundation to build on.</h2>{analysis.summaryComment && <p className="cw-review-summary">{analysis.summaryComment}</p>}{analysis.overallFeedback && <p className="cw-panel-intro">{analysis.overallFeedback}</p>}<div className="cw-review-strengths"><h3><CheckCircle2 size={17} />What’s working well</h3><FeedbackList positive items={analysis.whatsGood} empty="No strengths were saved with this review." /></div><div className="cw-review-needs"><h3><Lightbulb size={17} />Where to focus next</h3><FeedbackList items={analysis.needsImprovement} empty="No further areas for improvement were saved." /></div></div></TabsContent>
                <TabsContent value="keywords"><div className="cw-review-tab-body"><p className="cw-eyebrow">Help your experience get noticed</p><h2>Make relevant skills visible.</h2><p className="cw-panel-intro">These are AI-suggested keywords from your resume review, not a comparison with a specific job description. Add a skill only when it reflects experience you actually have.</p><div className="cw-keyword-group"><h3><CheckCircle2 size={17} />Recognized in your resume</h3><div className="cw-skill-tags">{analysis.keywordMatches?.length ? analysis.keywordMatches.map((keyword, index) => <span key={index}>{keyword}</span>) : <p className="cw-muted">No keyword matches were saved.</p>}</div></div><div className="cw-keyword-group"><h3><Search size={17} />Worth checking</h3><div className="cw-skill-tags cw-keyword-gaps">{analysis.keywordGaps?.length ? analysis.keywordGaps.map((keyword, index) => <span key={index}>{keyword}</span>) : <p className="cw-muted">No additional keywords were suggested.</p>}</div></div>{analysis.atsComment && <div className="cw-review-keyword-note"><Sparkles size={16} /><p>{analysis.atsComment}</p></div>}</div></TabsContent>
              </Tabs>}
              {analysis && <details className="cw-diagnostic-details"><summary>AI diagnostic details <ChevronDown size={16} /></summary><div><p>These estimates can help prioritize edits. They do not measure employer interest or guarantee how an applicant tracking system will process your PDF.</p><div className="cw-diagnostic-scores">{[["Overall", analysis.overallScore], ["ATS estimate", analysis.atsScore], ["Contact", analysis.contactScore], ["Experience", analysis.experienceScore], ["Education", analysis.educationScore], ["Skills", analysis.skillsScore]].map(([label, score]) => <div key={label}><span>{label}</span><strong>{diagnosticScore(score) ?? "—"}<small> / 100</small></strong></div>)}</div></div></details>}
            </section>
          </div>
          <div className="cw-review-next"><span className="cw-icon-tile"><Sparkles size={20} /></span><div><h2>A stronger resume is just the beginning.</h2><p>Practice explaining your experience with questions grounded in your background.</p></div><Link href="/interview" className="cw-text-link">Open interview lab <ArrowRight size={16} /></Link></div>
        </>
      )}
    </div>
  );
}
