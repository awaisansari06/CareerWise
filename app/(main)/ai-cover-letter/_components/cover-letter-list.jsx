"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Plus, Search, Trash2 } from "lucide-react";
import { deleteCoverLetter } from "@/actions/cover-letter";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
export default function CoverLetterList({ coverLetters = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const letters = coverLetters.filter(l => `${l.companyName} ${l.jobTitle}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === "company" ? a.companyName.localeCompare(b.companyName) : new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  async function remove(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try { await deleteCoverLetter(pending.id); setPending(null); router.refresh(); }
    catch (err) { setError(err.message || "Could not delete this letter."); }
    finally { setBusy(false); }
  }
  return <><header className="cw-tool-heading"><div><p className="cw-eyebrow">Your application, your voice</p><h1>Every opportunity has a story.</h1><p>Keep your tailored letters together, refine your drafts, and make every introduction count.</p></div><Link className="cw-button cw-button-primary" href="/ai-cover-letter/new"><Plus size={16}/>Create a letter</Link></header>
    {error && <p role="alert" className="cw-inline-error">{error}</p>}<label className="cw-search"><Search size={17}/><input aria-label="Search saved cover letters" placeholder="Search by company or role…" value={query} onChange={e => setQuery(e.target.value)}/><span>{letters.length} letters</span></label>
    <div className="cw-library-toolbar"><p>{coverLetters.length} saved {coverLetters.length === 1 ? "draft" : "drafts"} · Ready for your finishing touches</p><label>Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Recently edited</option><option value="company">Company name</option></select></label></div><div className="cw-letter-library">{letters.map(letter => <article className="cw-next-card" key={letter.id}><div className="cw-letter-card-top"><span className="cw-path-icon">{letter.companyName.slice(0,2).toUpperCase()}</span><button aria-label={`Delete letter for ${letter.companyName}`} className="cw-icon-button" onClick={() => setPending(letter)}><Trash2 size={15}/></button></div><p className="cw-eyebrow">{letter.companyName}</p><h2>{letter.jobTitle}</h2><p className="cw-data-note">Saved draft · Updated {new Date(letter.updatedAt || letter.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</p><Link className="cw-text-link" href={`/ai-cover-letter/${letter.id}`}>Open letter <ArrowRight size={15}/></Link></article>)}</div>
    {!letters.length && <section className="cw-next-card cw-tool-empty"><FileText size={30}/><h2>{coverLetters.length ? "No letters match your search." : "Your next introduction starts here."}</h2><p>{coverLetters.length ? "Try another company or role." : "Turn your experience into a thoughtful letter for an opportunity you care about."}</p>{!coverLetters.length && <Link className="cw-button cw-button-primary" href="/ai-cover-letter/new">Write my first letter <ArrowRight size={15}/></Link>}</section>}
    <AlertDialog open={!!pending} onOpenChange={open => { if (!open && !busy) setPending(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this cover letter?</AlertDialogTitle><AlertDialogDescription>The letter for {pending?.companyName} will be permanently deleted.</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={busy}>Keep letter</AlertDialogCancel><AlertDialogAction onClick={remove} disabled={busy}>{busy ? "Deleting…" : "Delete letter"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
