"use client";

import React from "react";
import { Brain, Target, Trophy, Zap, ArrowUpRight, ArrowDownRight, Award } from "lucide-react";
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
    // Assessments are ordered ascending by createdAt; the last item is the latest
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
  const deltaVsAvg = hasAssessments ? Number((latestScore - averageScore).toFixed(1)) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 1. Average Score */}
      <Card className="relative overflow-hidden border-border/80 bg-card/70 backdrop-blur-sm hover:border-primary/40 hover:shadow-card transition-all duration-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-primary" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Average Score
          </CardTitle>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400">
            <Trophy className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {hasAssessments ? `${averageScore}%` : "—"}
            </span>
            {hasAssessments ? (
              <Badge variant={avgStatus.variant} className="text-[11px] font-semibold">
                {avgStatus.label}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px]">No attempts</Badge>
            )}
          </div>

          {hasAssessments ? (
            <div className="space-y-1.5">
              <Progress value={averageScore} className="h-1.5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Passing Benchmark: 70%</span>
                <span className="font-mono">
                  {assessments.length} {assessments.length === 1 ? "quiz" : "quizzes"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete your first mock interview to record a baseline score.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 2. Questions Practiced */}
      <Card className="relative overflow-hidden border-border/80 bg-card/70 backdrop-blur-sm hover:border-primary/40 hover:shadow-card transition-all duration-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Questions Practiced
          </CardTitle>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Brain className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
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
              className="h-1.5"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Goal: 50 questions</span>
              <span className="font-mono">
                {Math.min(100, Math.round((totalQuestions / 50) * 100))}% reached
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Latest Score */}
      <Card className="relative overflow-hidden border-border/80 bg-card/70 backdrop-blur-sm hover:border-primary/40 hover:shadow-card transition-all duration-200 sm:col-span-2 lg:col-span-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Latest Score
          </CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {latestAssessment ? `${latestScore}%` : "—"}
            </span>
            {latestAssessment ? (
              <Badge variant={latestStatus.variant} className="text-[11px] font-semibold">
                {latestStatus.label}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px]">No attempts</Badge>
            )}
          </div>

          {latestAssessment ? (
            <div className="space-y-1.5">
              <Progress value={latestScore} className="h-1.5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {deltaVsAvg >= 0 ? "Above average" : "Below average"}
                </span>
                <span className="font-mono font-semibold flex items-center gap-0.5">
                  {deltaVsAvg >= 0 ? (
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUpRight className="h-3 w-3" />
                      +{deltaVsAvg}%
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center">
                      <ArrowDownRight className="h-3 w-3" />
                      {deltaVsAvg}%
                    </span>
                  )}
                  <span>vs avg</span>
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Take a mock interview to evaluate your current score level.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
