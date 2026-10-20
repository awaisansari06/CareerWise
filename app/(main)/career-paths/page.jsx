import { getIndustryInsights } from "@/actions/dashboard";
import { getResumeDocument } from "@/actions/resume";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";
import { getCareerExploration } from "@/actions/workspace-state";
import CareerPaths from "./career-paths";
export const metadata = { title: "Explore Career Paths", robots: privatePageRobots };
export default async function CareerPathsPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");
  const [insights, resume, exploration] = await Promise.all([getIndustryInsights().catch(() => null), getResumeDocument(), getCareerExploration()]);
  return <CareerPaths insights={insights} resume={resume} exploration={exploration}/>;
}
