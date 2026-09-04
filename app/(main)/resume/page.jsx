import { getResumeAnalysis } from "@/actions/resume-analysis";
import ResumeAnalysis from "./_components/resume-analysis ";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";

export const maxDuration = 60;

export const metadata = {
  title: "Resume Analysis & ATS Diagnostic",
  description: "Detailed resume analysis, ATS compatibility scoring, and personalized improvement suggestions.",
  robots: privatePageRobots,
};

export default async function ResumePage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }
  const resume = await getResumeAnalysis();

  return (
    <div className="container mx-auto">
      <ResumeAnalysis data={resume} />
    </div>
  );
}