import LetterStudio from "../_components/letter-studio";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";
export const metadata = { title: "Create a Cover Letter", robots: privatePageRobots };
export default async function NewCoverLetterPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");
  return <LetterStudio/>;
}
