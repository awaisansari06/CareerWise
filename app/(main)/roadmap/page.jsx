import dynamic from "next/dynamic";
import { getUserOnboardingStatus } from "@/actions/user";
import { saveRoadMap } from "@/actions/road-map";
import { redirect } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";

export const metadata = {
  title: "Personalized Career Roadmap",
  description: "Interactive skill progression milestones and guided career roadmap.",
  robots: privatePageRobots,
};

const CareerRoadmap = dynamic(() => import("./_components/roadmap"), {
  loading: () => (
    <div className="flex min-h-[500px] w-full items-center justify-center rounded-2xl border border-border/80 bg-card/40">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs text-muted-foreground">Loading interactive roadmap graph...</span>
      </div>
    </div>
  ),
});

export default async function RoadmapPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const roadmap = await saveRoadMap();

  return (
    <div className="w-full space-y-6">
      <CareerRoadmap roadmap={roadmap} />
    </div>
  );
}
