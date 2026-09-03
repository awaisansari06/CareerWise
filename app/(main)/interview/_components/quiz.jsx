"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import {
  Sparkles,
  Loader2,
  Clock,
  HelpCircle,
  Brain,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  // Normalize questions array and extract quizId
  const questions = quizData?.questions || (Array.isArray(quizData) ? quizData : []);
  const quizId = quizData?.quizId;

  useEffect(() => {
    if (quizData) {
      const qList = quizData?.questions || (Array.isArray(quizData) ? quizData : []);
      setAnswers(new Array(qList.length).fill(null));
      setCurrentQuestion(0);
    }
  }, [quizData]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const finishQuiz = async () => {
    try {
      // Score calculation is performed exclusively on the server
      await saveQuizResultFn({ quizId, answers });
      toast.success("Mock interview completed and saved!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResultData(null);
    generateQuizFn();
  };

  // 1. AI Question Generation Loading State
  if (generatingQuiz) {
    return (
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Brain className="h-8 w-8 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-foreground">
              Synthesizing Interview Rubric
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              CareerWise is evaluating your resume background to generate 10 tailored technical, conceptual, and situational interview questions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Formulating role-targeted questions...</span>
          </div>
        </div>
      </Card>
    );
  }

  // 2. Results Screen
  if (resultData) {
    return (
      <div className="w-full">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  // 3. Mock Interview Readiness / Briefing Card (Empty State before starting)
  if (!quizData || questions.length === 0) {
    return (
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/60 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>AI Proctor Assessment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Interview Readiness Briefing
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Simulate a real-world technical and situational interview tailored directly to your resume background and career discipline.
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <HelpCircle className="h-3.5 w-3.5 text-sky-500" />
                <span>Questions</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground font-mono">10 Items</p>
              <p className="text-[11px] text-muted-foreground">Multiple Choice</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                <span>Duration</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground font-mono">~15 Mins</p>
              <p className="text-[11px] text-muted-foreground">Self-paced</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Target className="h-3.5 w-3.5 text-amber-500" />
                <span>Target Level</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">Adaptive</p>
              <p className="text-[11px] text-muted-foreground">Resume Aligned</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Feedback</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">Instant</p>
              <p className="text-[11px] text-muted-foreground">AI Tip Rubric</p>
            </div>
          </div>

          {/* Assessment Scope */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
              What This Assessment Evaluates
            </h4>
            <div className="grid sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Technical tools, domain frameworks & specialized knowledge</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Real-world workplace problem-solving & situational judgment</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Theoretical fundamentals derived from academic background</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Communication precision and ethical industry best practices</span>
              </div>
            </div>
          </div>

          {/* Guidelines Banner */}
          <div className="flex items-start gap-3 text-xs text-muted-foreground bg-primary/5 rounded-xl p-4 border border-primary/20">
            <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Answer each question to the best of your ability. Comprehensive AI evaluation, correct answers, and actionable coaching tips are provided upon submitting your completed assessment.
            </p>
          </div>
        </CardContent>

        {/* Prominent Start CTA Footer */}
        <CardFooter className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 bg-card/40">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Your results will be permanently recorded in your performance trajectory
          </p>
          <Button
            size="lg"
            onClick={generateQuizFn}
            className="w-full sm:w-auto gap-2 px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Start Mock Interview</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // 4. In-Quiz Question Interface
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progressPercent = Math.round(((currentQuestion + 1) / questions.length) * 100);
  const selectedAnswer = answers[currentQuestion];
  const optionLetters = ["A", "B", "C", "D"];
  const remainingCount = questions.length - (currentQuestion + 1);

  return (
    <Card className="border-border/80 bg-card/70 backdrop-blur-sm overflow-hidden shadow-xl">
      {/* Quiz Progress Header */}
      <div className="p-4 sm:p-6 border-b border-border/60 bg-card/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="text-xs font-bold px-3 py-1">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              • {remainingCount > 0 ? `${remainingCount} remaining` : "Final question"}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-muted-foreground">
            {progressPercent}% completed
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 w-full" />
      </div>

      <CardContent className="p-5 sm:p-8 space-y-6">
        {/* Question Text */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
            {question?.question}
          </h2>
        </div>

        {/* Answers List */}
        <RadioGroup
          value={selectedAnswer || ""}
          onValueChange={handleAnswer}
          className="space-y-3"
        >
          {question?.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const letter = optionLetters[index] || `${index + 1}`;

            return (
              <Label
                key={index}
                htmlFor={`option-${index}`}
                className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none min-h-[56px] ${
                  isSelected
                    ? "border-primary bg-primary/10 dark:bg-primary/15 ring-2 ring-primary/40 shadow-sm text-foreground font-medium"
                    : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-muted/30 text-foreground"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border/60"
                  }`}
                >
                  {letter}
                </div>

                <span className="flex-1 text-sm sm:text-base leading-relaxed">
                  {option}
                </span>

                <div className="shrink-0">
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    className="h-4 w-4 border-border/80 text-primary focus-visible:ring-primary"
                  />
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>

      {/* Footer Navigation */}
      <CardFooter className="p-5 sm:p-6 border-t border-border/60 bg-card/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {currentQuestion > 0 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!selectedAnswer || savingResult}
          className="gap-2 px-6 ml-auto shadow-md font-bold"
        >
          {savingResult ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Assessment...</span>
            </>
          ) : isLastQuestion ? (
            <>
              <span>Finish & View Score</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </>
          ) : (
            <>
              <span>Next Question</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
