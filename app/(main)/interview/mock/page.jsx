import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getActivePractice } from "@/actions/workspace-state";
import Quiz from "../_components/quiz";
import { getResumeDocument } from "@/actions/resume";
import { getUserOnboardingStatus } from "@/actions/user";
import { privatePageRobots } from "@/lib/site-config";

export const maxDuration = 60;
export const metadata = {
  title: "Interview Practice Session",
  description: "Practice resume-based multiple-choice questions, then review your answers and feedback.",
  robots: privatePageRobots,
};

export default async function MockInterviewPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");
  const [resume, activePractice] = await Promise.all([getResumeDocument(),getActivePractice()]);
  return (
    <div className="cw-practice-page">
      <Link href="/interview" className="cw-text-link cw-back-link"><ArrowLeft size={15} />Back to interview lab</Link>
      <header className="cw-tool-heading"><div><p className="cw-eyebrow">Interview lab · Practice session</p><h1>A little practice.<br className="cw-wide-break" /> A stronger next step.</h1><p>Take your time. Think it through. Learn something you can use.</p></div></header>
      <Quiz initialPractice={activePractice} industry={resume?.document?.industry} />
    </div>
  );
}
