import { getUserOnboardingStatus } from "@/actions/user";
import { getRoadMap } from "@/actions/road-map";
import { redirect } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";
import CareerRoadmap from "./_components/roadmap";
export const metadata = { title: "Your Career Roadmap", robots: privatePageRobots };
export default async function RoadmapPage({ searchParams }) {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) redirect("/onboarding");
  const params = await searchParams;
  const role = typeof params?.role === "string" ? params.role.slice(0, 120) : "";
  return <CareerRoadmap roadmap={await getRoadMap()} targetRole={role}/>;
}
