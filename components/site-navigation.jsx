"use client";

import { useEffect, useState } from "react";
import Link from "@/components/navigation-link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { ArrowRight, ChevronDown, Compass, FileText, Home, Menu, Mic, PenLine, Route } from "lucide-react";
import { CareerWiseLogo } from "@/components/careerwise-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const marketingLinks = [
  { href: "/#features", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#questions", label: "Questions" },
];
const workspaceLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/career-paths", label: "Career paths", icon: Compass },
  { href: "/resume", label: "Resume review", icon: FileText },
  { href: "/interview", label: "Interview lab", icon: Mic },
  { href: "/ai-cover-letter", label: "Cover letters", icon: PenLine },
  { href: "/roadmap", label: "Roadmap", icon: Route },
];

export default function SiteNavigation({ initialSignedIn = false }) {
  const { isLoaded, userId } = useAuth();
  const signedIn = isLoaded ? !!userId : initialSignedIn;
  const account = <UserButton afterSignOutUrl="/" appearance={{elements:{avatarBox:"!w-8 !h-8",userButtonPopoverCard:"bg-popover text-popover-foreground border border-border",userButtonTrigger:"cw-user-trigger"}}}/>;
  return <NavigationShell signedIn={signedIn} account={account}/>;
}

/** Presentation only; route authorization remains on the server. */
export function NavigationShell({ signedIn = false, account }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [toolsOpen,setToolsOpen]=useState(false);
  useEffect(() => { setOpen(false);setToolsOpen(false); }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = event => { if (event.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const active = href => pathname === href || pathname.startsWith(href + "/");
  const close = () => setOpen(false);
  return <header className={`cw-design cw-site-header${pathname === "/" ? " cw-portrait-header" : ""}`}>
    <nav className="cw-header-nav" aria-label="Main navigation">
      <Link href="/" className="cw-brand" aria-label="CareerWise home" onClick={close}>
        <CareerWiseLogo className="cw-brand-mark"/>
        <span className="cw-brand-name">Career<span>Wise</span></span>
      </Link>
      <div className="cw-desktop-links">
        {!signedIn ? marketingLinks.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>) : <>
          <Link href="/career-paths" aria-current={active("/career-paths") ? "page" : undefined}>Career paths</Link>
          <Link href="/interview" aria-current={active("/interview") ? "page" : undefined}>Interview lab</Link>
          <DropdownMenu open={toolsOpen} onOpenChange={setToolsOpen} modal={false}><DropdownMenuTrigger className="cw-nav-tools">Career tools <ChevronDown size={14}/></DropdownMenuTrigger><DropdownMenuContent align="center" className="cw-design cw-tools-menu">{workspaceLinks.filter(link => !["/career-paths","/interview"].includes(link.href)).map(({href,label,icon:Icon}) => <DropdownMenuItem key={href} asChild onSelect={()=>setToolsOpen(false)}><Link href={href} aria-current={active(href) ? "page" : undefined}><Icon size={17}/>{label}</Link></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
        </>}
      </div>
      <div className="cw-nav-actions">
        {signedIn && <Link className="cw-button cw-dashboard-shortcut" href="/dashboard" aria-current={active("/dashboard") ? "page" : undefined}><Home size={16}/><span>Dashboard</span><ArrowRight size={15}/></Link>}
        <ThemeToggle/>
        <div className="cw-desktop-account">
          {signedIn ? account : <><Link href="/sign-in" className="cw-nav-signin">Sign in</Link><Link href="/sign-up" className="cw-button cw-header-signup">Start free <ArrowRight size={15}/></Link></>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="cw-menu-trigger" aria-label="Open navigation menu"><Menu size={21}/></DialogTrigger>
          <DialogContent className="cw-design cw-mobile-menu">
            <DialogTitle>Find your next step.</DialogTitle>
            <DialogDescription>Navigate CareerWise and your career workspace.</DialogDescription>
            {signedIn && <Link href="/dashboard" className="cw-button cw-mobile-dashboard" onClick={close}><Home size={17}/>Open dashboard <ArrowRight size={16}/></Link>}
            <nav aria-label="Mobile navigation">
              {signedIn && <><p className="cw-eyebrow">Your workspace</p>{workspaceLinks.slice(1).map(({href,label,icon:Icon}) => <Link key={href} href={href} onClick={close} aria-current={active(href) ? "page" : undefined}><Icon size={18}/><span>{label}</span><ArrowRight size={16}/></Link>)}</>}
              <p className="cw-eyebrow">Explore CareerWise</p>
              {marketingLinks.map(link => <Link key={link.href} href={link.href} onClick={close}><span>{link.label}</span><ArrowRight size={16}/></Link>)}
            </nav>
            <div className="cw-mobile-account">
              {!signedIn ? <><Link href="/sign-up" className="cw-button" onClick={close}>Start free <ArrowRight size={16}/></Link><Link href="/sign-in" className="cw-button cw-button-secondary" onClick={close}>Sign in</Link></> : <>{account}<span>Your account</span></>}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  </header>;
}
