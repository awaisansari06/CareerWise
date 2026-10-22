import Link from "@/components/navigation-link";
import { Compass, FileText, Home, Mic, PenLine, Route, Sparkles } from "lucide-react";
import { CareerMountain } from "@/components/career-preview";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Career paths", href: "/career-paths", icon: Compass },
  { label: "Resume review", href: "/resume", icon: FileText },
  { label: "Interview lab", href: "/interview", icon: Mic },
  { label: "Cover letters", href: "/ai-cover-letter", icon: PenLine },
  { label: "Roadmap", href: "/roadmap", icon: Route },
];

export default function WorkspaceSidebar({ activeHref = "/dashboard" }) {
  return (
    <aside className="cw-workspace-sidebar">
      <p className="cw-eyebrow">Your workspace</p>
      <nav aria-label="Career workspace">
        {links.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={href === activeHref ? "is-active" : ""} aria-current={href === activeHref ? "page" : undefined}>
            <Icon size={19} /><span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="cw-sidebar-note">
        <Sparkles size={21} />
        <h2>Small steps.<br />Brighter opportunities.</h2>
        <p>Your next chapter starts with the next thing you do.</p>
        <CareerMountain />
      </div>
    </aside>
  );
}
