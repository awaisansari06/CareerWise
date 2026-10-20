import { getCoverLetters } from "@/actions/cover-letter";
import CoverLetterList from "./_components/cover-letter-list";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";
export const metadata = { title: "Your Cover Letters", robots: privatePageRobots };
export default async function CoverLetterPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");
  return <CoverLetterList coverLetters={await getCoverLetters()}/>;
}
