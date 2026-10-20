import { CareerMountain } from "@/components/career-preview";
export const metadata = { title: "Welcome to CareerWise", description: "Sign in or create your CareerWise account." };
export default function AuthLayout({ children }) {
  return <div className="cw-design cw-auth-layout"><section className="cw-auth-story"><p className="cw-eyebrow">Make room for what’s next</p><h1>Your experience.<br/>New possibilities.</h1><p>One workspace to understand your strengths, prepare with confidence, and plan your next move.</p><CareerMountain/><div><span>01</span><p>Start with your background</p><span>02</span><p>Find a direction that fits</p><span>03</span><p>Take the next step</p></div></section><section className="cw-auth-form">{children}</section></div>;
}
