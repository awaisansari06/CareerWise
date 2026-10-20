import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
export default function NotFound() {
  return <div className="cw-design cw-status-page"><Compass size={35}/><p className="cw-eyebrow">404 · A different direction</p><h1>This path ends here.<br/>Your next chapter doesn’t.</h1><p>We couldn’t find this page. Head back to CareerWise to keep exploring.</p><Link className="cw-button cw-button-primary" href="/"><ArrowLeft size={15}/>Return home</Link></div>;
}
