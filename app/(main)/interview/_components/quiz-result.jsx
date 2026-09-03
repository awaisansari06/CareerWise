"use client";

import React, { useMemo, useState } from "react";
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
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
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
  const [expandedIndices, setExpandedIndices] = useState(new Set([0])); // First question expanded by default

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

  const toggleQuestion = (index) => {
    const next = new Set(expandedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedIndices(next);
  };

  const handleToggleAll = () => {
    if (expandedIndices.size === questions.length) {
      setExpandedIndices(new Set());
    } else {
      setExpandedIndices(new Set(questions.map((_, i) => i)));
    }
  };

  const isAllExpanded = expandedIndices.size === questions.length;

  return (
    <div className="space-y-6">
      {/* 1. Score Header Hero Card */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-border/60 bg-gradient-to-r from-card via-card/90 to-card/60">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Interview Evaluation
                </h2>
                <Badge variant={evaluation.variant} className="text-xs font-bold">
                  {evaluation.label}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                {evaluation.description}
              </p>
            </div>
          </div>

          {/* Large Score Visualization */}
          <div className="flex flex-col items-center sm:items-end justify-center shrink-0 bg-muted/20 px-5 py-3 rounded-2xl border border-border/60">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono">
                {score}
              </span>
              <span className="text-base sm:text-lg text-muted-foreground font-semibold">
                %
              </span>
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Final Score
            </span>
          </div>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 divide-x divide-border/60 bg-muted/30 border-b border-border/60">
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground font-medium mb-1">Questions</div>
            <div className="text-xl sm:text-2xl font-extrabold text-foreground font-mono">{totalQuestions}</div>
            <div className="text-[11px] text-muted-foreground">Evaluated</div>
          </div>

          <div className="p-4 text-center">
            <div className="text-xs text-emerald-500 dark:text-emerald-400 font-bold mb-1">Correct</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-500 dark:text-emerald-400 font-mono">
              {correctCount}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}% accuracy
            </div>
          </div>

          <div className="p-4 text-center">
            <div className="text-xs text-rose-500 dark:text-rose-400 font-bold mb-1">Incorrect</div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-500 dark:text-rose-400 font-mono">
              {incorrectCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Needs review</div>
          </div>
        </div>

        {/* AI Coaching Card */}
        {result.improvementTip && (
          <div className="p-6 bg-primary/5 dark:bg-primary/10 border-b border-border/60">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 shrink-0 mt-0.5">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>AI Coaching & Targeted Areas to Improve</span>
                </h4>
                <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                  {result.improvementTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Retake / Start New CTA */}
        {!hideStartNew && (
          <div className="p-4 sm:p-6 bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Take another mock interview to reinforce concepts or test alternate industry scenarios.
            </p>
            <Button
              onClick={onStartNew}
              className="w-full sm:w-auto gap-2 px-6 shadow-md font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Start New Mock Interview</span>
            </Button>
          </div>
        )}
      </Card>

      {/* 2. Questions Review Section (Collapsible Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              <span>Question-by-Question Breakdown ({totalQuestions})</span>
            </h3>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleAll}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isAllExpanded ? "Collapse All" : "Expand All"}</span>
          </Button>
        </div>

        {/* Collapsible Question Cards */}
        <div className="space-y-3">
          {questions.map((q, index) => {
            const isCorrect = q.isCorrect;
            const isExpanded = expandedIndices.has(index);

            return (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isCorrect
                    ? "border-emerald-500/30 bg-card/90"
                    : "border-rose-500/30 bg-card/90"
                }`}
              >
                {/* Header (Clickable Accordion Trigger) */}
                <button
                  type="button"
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono font-bold text-xs text-muted-foreground shrink-0 bg-muted/40 px-2 py-1 rounded">
                      Q{index + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {q.question}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Badge
                      variant={isCorrect ? "success" : "danger"}
                      className="text-xs font-semibold gap-1 px-2.5 py-0.5"
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
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Collapsible Content Body */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3 border-t border-border/40 animate-in fade-in duration-150">
                    <div className="text-sm font-medium text-foreground pt-2">
                      {q.question}
                    </div>

                    <div className="grid gap-2 pt-1">
                      <div
                        className={`rounded-lg p-3 text-xs sm:text-sm border flex items-start gap-2.5 ${
                          isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
                        }`}
                      >
                        <span className="font-bold shrink-0">Your Answer:</span>
                        <span className="break-words">{q.userAnswer || "No answer provided"}</span>
                      </div>

                      {!isCorrect && (
                        <div className="rounded-lg p-3 text-xs sm:text-sm border bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
                          <span className="font-bold shrink-0">Correct Answer:</span>
                          <span className="break-words">{q.answer}</span>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs sm:text-sm space-y-1">
                        <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                          <span>Evaluation & Explanation:</span>
                        </span>
                        <p className="text-muted-foreground leading-relaxed pl-5">
                          {q.explanation}
                        </p>
                      </div>
                    )}
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
