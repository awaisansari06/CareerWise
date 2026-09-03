import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/actions/user";
import ResumeUpload from "./_components/onboarding-form";
import { privatePageRobots } from "@/lib/site-config";

export const metadata = {
  title: "Professional Onboarding",
  description: "Set up your CareerWise profile and analyze your resume.",
  robots: privatePageRobots,
};

export default async function OnboardingPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard"); // server-side redirect, instant
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <ResumeUpload />
    </main>
  );
}
