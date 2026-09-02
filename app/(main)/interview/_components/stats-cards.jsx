"use client";

import React from "react";
import { Brain, Target, Trophy, TrendingUp, CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function StatsCards({ assessments }) {
  const hasAssessments = assessments && assessments.length > 0;

  const getAverageScore = () => {
    if (!hasAssessments) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return Number((total / assessments.length).toFixed(1));
  };

  const getLatestAssessment = () => {
    if (!hasAssessments) return null;
    // Assessments are ordered ascending by createdAt, so the last item is the latest
    return assessments[assessments.length - 1];
  };

  const getTotalQuestions = () => {
    if (!hasAssessments) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + (assessment.questions?.length || 0),
      0
    );
  };

  const averageScore = getAverageScore();
  const latestAssessment = getLatestAssessment();
  const latestScore = latestAssessment ? Number(latestAssessment.quizScore.toFixed(1)) : 0;
  const totalQuestions = getTotalQuestions();

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: "High Proficiency", variant: "success" };
    if (score >= 70) return { label: "Proficient", variant: "info" };
    if (score >= 50) return { label: "Developing", variant: "warning" };
    return { label: "Needs Practice", variant: "danger" };
  };

  const avgStatus = getScoreStatus(averageScore);
  const latestStatus = getScoreStatus(latestScore);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Average Score */}
      <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-primary" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Average Score
          </CardTitle>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400">
            <Trophy className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {hasAssessments ? `${averageScore}%` : "—"}
            </span>
            {hasAssessments && (
              <Badge variant={avgStatus.variant} className="text-[11px] font-medium">
                {avgStatus.label}
              </Badge>
            )}
          </div>
          {hasAssessments ? (
            <div className="space-y-1.5">
              <Progress value={averageScore} className="h-2" />
              <p className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Benchmark: 75%</span>
                <span>{assessments.length} {assessments.length === 1 ? "quiz" : "quizzes"} evaluated</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Complete a quiz to set your baseline</p>
          )}
        </CardContent>
      </Card>

      {/* Questions Practiced */}
      <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Questions Practiced
          </CardTitle>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Brain className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {totalQuestions}
            </span>
            <Badge variant="neutral" className="text-[11px] font-medium gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              <span>Skill Drills</span>
            </Badge>
          </div>
          <div className="space-y-1.5">
            <Progress
              value={Math.min(100, (totalQuestions / 50) * 100)}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Goal: 50 questions</span>
              <span>{Math.min(100, Math.round((totalQuestions / 50) * 100))}% reached</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Latest Score */}
      <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all duration-200 sm:col-span-2 lg:col-span-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Latest Score
          </CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {latestAssessment ? `${latestScore}%` : "—"}
            </span>
            {latestAssessment ? (
              <Badge variant={latestStatus.variant} className="text-[11px] font-medium">
                {latestStatus.label}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px]">No attempts yet</Badge>
            )}
          </div>
          {latestAssessment ? (
            <div className="space-y-1.5">
              <Progress value={latestScore} className="h-2" />
              <p className="text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  {latestScore >= averageScore ? "Above average" : "Below average"}
                </span>
                <span className="font-mono">
                  {latestScore >= averageScore ? `+${(latestScore - averageScore).toFixed(1)}%` : `${(latestScore - averageScore).toFixed(1)}%`}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Take a mock interview to record scores</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
