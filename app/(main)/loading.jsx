import { Loader2 } from 'lucide-react';

export default function WorkspaceLoading() {
  return <section className="cw-design cw-panel cw-tool-empty" role="status" aria-live="polite"><Loader2 size={24} className="animate-spin"/><h2>Opening your workspace…</h2><p>Your saved work is on its way.</p></section>;
}
