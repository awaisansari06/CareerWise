import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/actions/user";
import ResumeUpload from "./_components/onboarding-form";
import { privatePageRobots } from "@/lib/site-config";
export const maxDuration = 60;
export const metadata = { title: "Your Next Chapter", robots: privatePageRobots };
export default async function OnboardingPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (isOnboarded) redirect("/dashboard");
  return <ResumeUpload/>;
}
