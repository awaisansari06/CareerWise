import { Loader2 } from "lucide-react";

export default function ResumeLoading() {
  return <section className="cw-panel cw-tool-empty" role="status"><Loader2 size={30} className="animate-spin" /><h1>Bringing your experience into focus.</h1><p>Your resume and personalized review are loading.</p></section>;
}
