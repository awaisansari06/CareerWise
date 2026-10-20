import { redirect } from "next/navigation";
import { getActivePractice } from "@/actions/workspace-state";
import { getAssessments } from "@/actions/interview";
import { getResumeDocument } from "@/actions/resume";
import { getUserOnboardingStatus } from "@/actions/user";
import { privatePageRobots } from "@/lib/site-config";
import InterviewLab from "./_components/interview-lab";

export const metadata = {
  title: "Interview Lab",
  description: "Practice questions based on your background, review your answers, and build on saved feedback.",
  robots: privatePageRobots,
};

export default async function InterviewPrepPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");
  const [assessments, resume, activePractice] = await Promise.all([getAssessments(), getResumeDocument(), getActivePractice()]);
  return <InterviewLab activePractice={activePractice} assessments={assessments} industry={resume?.document?.industry} />;
}
