import { getIndustryInsights, getDashboardProgress } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { getResume } from "@/actions/resume";
import { redirect } from "next/navigation";
import DashboardView from "./_components/dashboard-view";
import { privatePageRobots } from "@/lib/site-config";

export const maxDuration = 60;

export const metadata = {
  title: "Your Career Overview",
  description: "Your next career step, resume, practice progress, and industry insights in one place.",
  robots: privatePageRobots,
};

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const [insightResult, resume, progress] = await Promise.all([
    getIndustryInsights().then((insights) => ({ insights })).catch(() => ({ insights: null, unavailable: true })),
    getResume(),
    getDashboardProgress(),
  ]);

  return (
    <DashboardView insights={insightResult.insights} insightsUnavailable={insightResult.unavailable} initialResume={resume} progress={progress} />
  );
}
