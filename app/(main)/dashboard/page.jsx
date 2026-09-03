import { getIndustryInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { getResume } from "@/actions/resume";
import { redirect } from "next/navigation";
import DashboardView from "./_components/dashboard-view";
import { privatePageRobots } from "@/lib/site-config";

export const metadata = {
  title: "Career Intelligence Command Center",
  description: "View your real-time industry intelligence, salary benchmarks, and career growth metrics.",
  robots: privatePageRobots,
};

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const [insights, resume] = await Promise.all([
    getIndustryInsights(),
    getResume(),
  ]);

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} initialResume={resume} />
    </div>
  );
}