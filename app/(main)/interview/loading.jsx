import { Loader2 } from "lucide-react";

export default function InterviewLoading() {
  return <section className="cw-panel cw-tool-empty" role="status"><Loader2 size={30} className="animate-spin" /><h1>Your practice workspace is loading.</h1><p>Getting your background and saved sessions ready.</p></section>;
}
