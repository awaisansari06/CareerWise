import { Loader2 } from "lucide-react";
export default function Loading() {
  return <section className="cw-next-card cw-tool-empty" role="status"><Loader2 size={28} className="animate-spin"/><h1>Getting your workspace ready.</h1><p>Your saved work is loading.</p></section>;
}
