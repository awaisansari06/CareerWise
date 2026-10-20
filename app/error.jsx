"use client";
import Link from "next/link";
import { Compass, RotateCw } from "lucide-react";
export default function ErrorPage({ reset }) {
  return <div className="cw-design cw-status-page"><Compass size={35}/><p className="cw-eyebrow">A brief detour</p><h1>Let’s get you back on track.</h1><p>We couldn’t load this page. Try again, or return home and pick up where you left off.</p><div><button onClick={reset} className="cw-button cw-button-primary"><RotateCw size={15}/>Try again</button><Link className="cw-button cw-button-secondary" href="/">Return home</Link></div></div>;
}
