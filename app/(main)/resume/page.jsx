import { getResumeWorkspace } from "@/actions/workspace-state";
import { getResumeAnalysis } from "@/actions/resume-analysis";
import { getResumeDocument } from "@/actions/resume";
import ResumeReview from "./_components/resume-review";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";

export const maxDuration = 60;

export const metadata = {
  title: "Resume Review",
  description: "Review your experience, explore personalized feedback, and work on a stronger resume draft.",
  robots: privatePageRobots,
};

export default async function ResumePage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }
  const [resume, workspace, analysis] = await Promise.all([
    getResumeDocument(),
    getResumeWorkspace(),
    getResumeAnalysis().catch(() => null),
  ]);

  return (
    <ResumeReview key={`${resume?.id}:${resume?.updatedAt?.toISOString()}`} resume={resume} analysis={analysis} workspace={workspace} />
  );
}
