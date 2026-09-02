"use client";

import React, { useMemo } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Target,
  FileQuestion,
  HelpCircle,
  Lightbulb,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  const score = Number(result.quizScore.toFixed(1));
  const questions = result.questions || [];
  const totalQuestions = questions.length;
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;

  const evaluation = useMemo(() => {
    if (score >= 80) {
      return {
        label: "Outstanding Proficiency",
        variant: "success",
        description: "Excellent performance! You demonstrated deep mastery of the required concepts and situational judgment.",
      };
    }
    if (score >= 70) {
      return {
        label: "Proficient",
        variant: "info",
        description: "Good job! You have a solid grasp of key industry practices with slight room for fine-tuning.",
      };
    }
    if (score >= 50) {
      return {
        label: "Developing Mastery",
        variant: "warning",
        description: "Reasonable foundation, but some core concepts and domain frameworks need dedicated revision.",
      };
    }
    return {
      label: "Needs Dedicated Practice",
      variant: "danger",
      description: "Focus on reviewing the detailed explanations below to strengthen key fundamentals before your next attempt.",
    };
  }, [score]);

  return (
    <div className="space-y-6">
      {/* Score Header Card */}
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-border/60">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Interview Evaluation
                </h2>
                <Badge variant={evaluation.variant} className="text-xs font-semibold">
                  {evaluation.label}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                {evaluation.description}
              </p>
            </div>
          </div>

          {/* Large Score Indicator */}
          <div className="flex flex-col items-center sm:items-end justify-center shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                {score}
              </span>
              <span className="text-base sm:text-lg text-muted-foreground font-semibold">
                %
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Overall Score
            </span>
          </div>
        </div>

        {/* 3 Metric Cards Row */}
        <div className="grid grid-cols-3 divide-x divide-border/60 bg-muted/20 border-b border-border/60">
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground font-medium mb-1">Questions</div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{totalQuestions}</div>
            <div className="text-[11px] text-muted-foreground">Evaluated</div>
          </div>

          <div className="p-4 text-center">
            <div className="text-xs text-emerald-500 dark:text-emerald-400 font-medium mb-1">Correct</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-500 dark:text-emerald-400">
              {correctCount}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}% accuracy
            </div>
          </div>

          <div className="p-4 text-center">
            <div className="text-xs text-rose-500 dark:text-rose-400 font-medium mb-1">Incorrect</div>
            <div className="text-xl sm:text-2xl font-bold text-rose-500 dark:text-rose-400">
              {incorrectCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Review below</div>
          </div>
        </div>

        {/* AI Improvement Tip */}
        {result.improvementTip && (
          <div className="p-6 bg-primary/5 dark:bg-primary/10 border-b border-border/60">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500 shrink-0 mt-0.5">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <span>AI Coaching & Targeted Areas to Improve</span>
                </h4>
                <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                  {result.improvementTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Start New Quiz CTA */}
        {!hideStartNew && (
          <div className="p-4 sm:p-6 bg-card/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Take another quiz to reinforce concepts or test alternate industry scenarios.
            </p>
            <Button
              onClick={onStartNew}
              className="w-full sm:w-auto gap-2 px-6 shadow-xs font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Start New Mock Interview</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Questions Review Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            <span>Question-by-Question Breakdown ({totalQuestions})</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            {correctCount} passed • {incorrectCount} need review
          </span>
        </div>

        <div className="space-y-3">
          {questions.map((q, index) => {
            const isCorrect = q.isCorrect;

            return (
              <div
                key={index}
                className={`rounded-xl border p-4 sm:p-5 transition-all space-y-3 ${
                  isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                    : "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10"
                }`}
              >
                {/* Header: Question Number & Verdict Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Question {index + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  <Badge
                    variant={isCorrect ? "success" : "danger"}
                    className="text-xs font-medium gap-1 shrink-0"
                  >
                    {isCorrect ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </Badge>
                </div>

                {/* Answer Comparisons */}
                <div className="grid gap-2 pt-1">
                  <div
                    className={`rounded-lg p-3 text-xs sm:text-sm border flex items-start gap-2.5 ${
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
                    }`}
                  >
                    <span className="font-semibold shrink-0">Your Answer:</span>
                    <span className="break-words">{q.userAnswer || "No answer provided"}</span>
                  </div>

                  {!isCorrect && (
                    <div className="rounded-lg p-3 text-xs sm:text-sm border bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
                      <span className="font-semibold shrink-0">Correct Answer:</span>
                      <span className="break-words">{q.answer}</span>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs sm:text-sm space-y-1">
                    <span className="font-semibold text-foreground flex items-center gap-1 text-xs">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <span>Explanation:</span>
                    </span>
                    <p className="text-muted-foreground leading-relaxed pl-4">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
