"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileQuestion,
  History,
  Lightbulb,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: "High Proficiency", variant: "success" };
    if (score >= 70) return { label: "Proficient", variant: "info" };
    if (score >= 50) return { label: "Developing", variant: "warning" };
    return { label: "Needs Practice", variant: "danger" };
  };

  const hasAssessments = assessments && assessments.length > 0;
  // Reverse assessments for recent quizzes list so the latest appears first
  const reversedAssessments = hasAssessments ? [...assessments].reverse() : [];

  return (
    <>
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <span>Assessment History</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
              Review past mock interview attempts, scoring breakdowns, and AI feedback
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push("/interview/mock")}
            className="gap-2 self-start sm:self-auto shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Start New Quiz</span>
          </Button>
        </CardHeader>

        <CardContent>
          {!hasAssessments ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <FileQuestion className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                No Quizzes Completed Yet
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
                Take your first personalized mock interview to practice realistic industry questions and get instant AI feedback.
              </p>
              <Button
                onClick={() => router.push("/interview/mock")}
                className="gap-2"
                size="sm"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Start Your First Interview</span>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {reversedAssessments.map((assessment, displayIndex) => {
                const chronologicalIndex = assessments.indexOf(assessment) + 1;
                const score = Number(assessment.quizScore.toFixed(1));
                const status = getScoreStatus(score);
                const questionCount = assessment.questions?.length || 10;
                const correctCount = assessment.questions?.filter((q) => q.isCorrect).length || 0;

                return (
                  <div
                    key={assessment.id}
                    className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/80 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-md cursor-pointer"
                    onClick={() => setSelectedQuiz(assessment)}
                  >
                    {/* Top Row: Quiz # and Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                          Quiz #{chronologicalIndex}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {format(new Date(assessment.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <Badge variant={status.variant} className="text-[11px] font-medium">
                        {status.label}
                      </Badge>
                    </div>

                    {/* Middle Row: Score & Performance Summary */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold tracking-tight text-foreground">
                            {score}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({correctCount}/{questionCount} correct)
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <FileQuestion className="h-3.5 w-3.5" />
                          <span>{questionCount} Qs</span>
                        </span>
                      </div>
                      <Progress value={score} className="h-1.5" />
                    </div>

                    {/* AI Tip Snippet if available */}
                    {assessment.improvementTip && (
                      <div className="mb-3.5 flex items-start gap-2 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground border border-border/40 line-clamp-2">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{assessment.improvementTip}</span>
                      </div>
                    )}

                    {/* Action Link */}
                    <div className="mt-auto pt-2 border-t border-border/40 flex items-center justify-between text-xs font-medium text-primary">
                      <span>View Full Breakdown</span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>
                Assessment Review — Quiz #{selectedQuiz ? assessments.indexOf(selectedQuiz) + 1 : ""}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedQuiz && format(new Date(selectedQuiz.createdAt), "MMMM d, yyyy · h:mm a")}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <QuizResult
              result={selectedQuiz}
              hideStartNew
              onStartNew={() => {
                setSelectedQuiz(null);
                router.push("/interview/mock");
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
