import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

export default async function InterviewPrepPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }
  const assessments = await getAssessments();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Interview Preparation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Practice AI-generated mock interviews tailored to your career domain, benchmark responses, and track progress
          </p>
        </div>
      </div>

      {/* Main Dashboard Flow */}
      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  );
}
