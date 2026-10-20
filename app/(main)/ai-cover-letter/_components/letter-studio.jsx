"use client";
import { resolveCareerJob } from "@/lib/jobs/client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Copy, Download, FileText, PenLine, Printer, Sparkles } from "lucide-react";
import { generateCoverLetter, updateCoverLetter } from "@/actions/cover-letter";
import { toast } from "sonner";

export default function LetterStudio({ letter = null }) {
  const router = useRouter();
  const lock = useRef(false);
  const generationRequest=useRef(null);
  const [saved, setSaved] = useState(letter);
  const [content, setContent] = useState(letter?.content || "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState({ companyName: letter?.companyName || "", jobTitle: letter?.jobTitle || "", jobDescription: letter?.jobDescription || "" });
  const dirty = content !== (saved?.content || "");
  useEffect(() => {
    if (!dirty) return;
    const guard = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  async function generate(event) {
    event.preventDefault();
    if (lock.current || dirty) return;
    lock.current = true; setBusy("generate"); setError("");
    try {
      const next = await resolveCareerJob(await generateCoverLetter({...fields,requestId:generationRequest.current ??= crypto.randomUUID()}));
      generationRequest.current=null;setSaved(next); setContent(next.content); setEditing(false);
      router.replace(`/ai-cover-letter/${next.id}`); router.refresh();
      toast.success("Your letter has been saved.");
    } catch (err) { if(err.code==="RESULT_REMOVED")generationRequest.current=null;setError(err.message || "Could not create your letter. Please try again."); }
    finally { lock.current = false; setBusy(""); }
  }
  async function save() {
    if (lock.current || !saved) return;
    lock.current = true; setBusy("save"); setError("");
    try { const next = await updateCoverLetter({ id: saved.id, content, updatedAt: new Date(saved.updatedAt).toISOString() }); setSaved(next); setContent(next.content); toast.success("Changes saved."); router.refresh(); }
    catch (err) { setError(err.message || "Could not save your changes."); }
    finally { lock.current = false; setBusy(""); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "CareerWise-cover-letter.txt"; a.click(); URL.revokeObjectURL(url);
  }
  return <div>
    {dirty ? <span className="cw-data-note">Save changes before leaving this letter.</span> : <Link className="cw-text-link" href="/ai-cover-letter"><ArrowLeft size={14}/> All cover letters</Link>}
    <header className="cw-tool-heading cw-letter-heading"><div><p className="cw-eyebrow">Words that open doors</p><h1>Your story. Their next teammate.</h1><p>Connect your experience to the opportunity. Create a draft, make it yours, and save it for your application.</p></div></header>
    {error && <p role="alert" className="cw-inline-error">{error}</p>}
    <div className="cw-letter-studio"><section className="cw-next-card"><div className="cw-card-label"><PenLine size={18}/><h2>The opportunity</h2></div><form className="cw-form" onSubmit={generate}>
      <label htmlFor="letter-company">Company name</label><input id="letter-company" required maxLength={200} value={fields.companyName} onChange={e => setFields({ ...fields, companyName: e.target.value })} placeholder="Where would you like to work?" disabled={!!busy}/>
      <label htmlFor="letter-role">Job title</label><input id="letter-role" required maxLength={200} value={fields.jobTitle} onChange={e => setFields({ ...fields, jobTitle: e.target.value })} placeholder="e.g. Marketing specialist" disabled={!!busy}/>
      <label htmlFor="letter-description">Job description</label><textarea id="letter-description" required minLength={20} maxLength={20000} rows={10} value={fields.jobDescription} onChange={e => setFields({ ...fields, jobDescription: e.target.value })} placeholder="Paste the responsibilities, requirements, and anything that stands out." disabled={!!busy}/>
      <div className="cw-source-note"><Sparkles size={18}/><p>Grounded in your saved resume. Review every claim and detail before sending your letter.</p></div>
      {dirty && <p className="cw-panel-intro">Save your edits before generating another draft.</p>}
      <button disabled={!!busy || dirty} className="cw-button cw-button-primary">{busy === "generate" ? "Writing your draft…" : saved ? "Generate another saved draft" : "Create my cover letter"}<ArrowRight size={15}/></button>
      {saved && <small>Another draft creates a separate letter. Your saved letter stays in your library.</small>}
    </form></section>
    <section className="cw-next-card cw-letter-document"><div className="cw-document-toolbar"><div><FileText size={17}/><h2>{dirty ? "Unsaved edits" : saved ? "Saved draft" : "Your letter"}</h2></div>{content && <button className="cw-text-link" disabled={!!busy} onClick={() => setEditing(!editing)}>{editing ? "Preview" : "Edit draft"}</button>}</div>
      {saved ? <><div className="cw-letter-paper">{editing ? <><label className="sr-only" htmlFor="letter-editor">Edit your cover letter</label><textarea id="letter-editor" maxLength={30000} value={content} onChange={e => setContent(e.target.value)} disabled={!!busy}/></> : <LetterContent content={content}/>}</div><div className="cw-draft-actions"><button className="cw-button cw-button-primary" disabled={!dirty || !!busy || !content.trim()} onClick={save}><Check size={14}/>{busy === "save" ? "Saving…" : "Save changes"}</button><button className="cw-button cw-button-secondary" onClick={async () => { try { await navigator.clipboard.writeText(content); toast.success("Copied to clipboard."); } catch { toast.error("Copy unavailable. Download the letter instead."); } }}><Copy size={14}/>Copy</button><button className="cw-button cw-button-secondary" onClick={download}><Download size={14}/>Download</button><button className="cw-button cw-button-secondary" disabled={!content.trim()} onClick={() => window.print()}><Printer size={14}/>Print / PDF</button></div><p className="cw-data-note">{content.trim().split(/\s+/).filter(Boolean).length} words · Download includes the current text{dirty ? " · Save to keep your edits in your account" : ""}</p></> : <div className="cw-tool-empty"><span className="cw-path-icon"><FileText size={27}/></span><h2>A strong first impression starts here.</h2><p>Add the opportunity on the left. Your personalized draft will appear here, ready for your finishing touches.</p><div className="cw-letter-lines"><i/><i/><i/><i/><i/></div></div>}
    </section></div><div className="cw-print-letter"><LetterContent content={content}/></div>
  </div>;
}
export function LetterContent({ content }) {
  return <article className="cw-letter-text">{content.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph.replace(/^#{1,6}\s+/gm, "").replace(/\*\*([^*]+)\*\*/g, "$1")}</p>)}</article>;
}
