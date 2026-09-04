"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeUpVariants,
  createStaggerContainer,
  staggerItemVariants,
  defaultViewport,
  standardEase,
} from "@/lib/motion-variants";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  GraduationCap,
  UserCheck,
  Code2,
  Bot,
  Target,
  FileText,
  TrendingUp,
  Check,
  Plus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/**
 * Returns theme-safe semantic styles and status text based on score
 */
function getScoreEvaluation(score) {
  const numericScore = Number(score) || 0;
  if (numericScore >= 80) {
    return {
      status: "Strong",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-500/15",
      borderClass: "border-emerald-500/30",
      progressColor: "bg-emerald-500",
      ringStroke: "#10b981",
    };
  }
  if (numericScore >= 70) {
    return {
      status: "Good",
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/30",
      progressColor: "bg-blue-500",
      ringStroke: "#3b82f6",
    };
  }
  if (numericScore >= 50) {
    return {
      status: "Needs Improvement",
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-500/15",
      borderClass: "border-amber-500/30",
      progressColor: "bg-amber-500",
      ringStroke: "#f59e0b",
    };
  }
  return {
    status: "Critical",
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/15",
    borderClass: "border-rose-500/30",
    progressColor: "bg-rose-500",
    ringStroke: "#f43f5e",
  };
}

/**
 * Dynamic feedback mapping if specific comments were not stored in DB
 */
function getSectionFeedback(sectionKey, score, providedComment) {
  if (providedComment && typeof providedComment === "string" && providedComment.trim().length > 0) {
    return providedComment;
  }

  const s = Number(score) || 0;
  switch (sectionKey) {
    case "contact":
      if (s >= 80) return "Comprehensive contact channels, links, and location clearly structured.";
      if (s >= 50) return "Core contact details present; consider adding GitHub/portfolio or verified LinkedIn.";
      return "Missing essential contact channels or professional portfolio links.";

    case "experience":
      if (s >= 80) return "High-impact achievements with quantifiable metrics and action-oriented verbs.";
      if (s >= 50) return "Clear role history; could benefit from deeper metric-driven business outcomes.";
      return "Lacks measurable achievements and clear role scope descriptions.";

    case "education":
      if (s >= 80) return "Accredited credentials, majors, and relevant timelines well documented.";
      if (s >= 50) return "Degree listed; consider adding relevant coursework or academic honors.";
      return "Educational background requires clearer institution and date formatting.";

    case "skills":
      if (s >= 80) return "Diverse, market-aligned technical and core competencies showcased.";
      if (s >= 50) return "Foundational skills present; group into categories for faster scanning.";
      return "Underrepresented technical and industry keywords limit recruiter discovery.";

    default:
      return s >= 70 ? "Meets industry quality benchmarks." : "Needs targeted refinement.";
  }
}

export default function ResumeAnalysis({ data }) {
  const shouldReduceMotion = useReducedMotion();

  if (!data) {
    return (
      <Card className="p-8 text-center bg-card border border-border">
        <div className="flex flex-col items-center justify-center space-y-3">
          <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground">No Resume Analysis Found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Please upload your resume in the onboarding or resume section to generate an AI career assessment.
          </p>
        </div>
      </Card>
    );
  }

  const overallScore = Math.round(data.overallScore || 0);
  const overallEval = getScoreEvaluation(overallScore);

  const atsScore = Math.round(data.atsScore || 0);
  const atsEval = getScoreEvaluation(atsScore);

  // SVG circular ring calculation (radius = 56, circumference ≈ 351.86)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Sections data
  const sections = useMemo(() => [
    {
      key: "contact",
      title: "Contact Info",
      icon: UserCheck,
      score: Math.round(data.contactScore || 0),
      comment: getSectionFeedback(
        "contact",
        data.contactScore,
        data.sections?.contact_info?.comment || data.contactComment
      ),
    },
    {
      key: "experience",
      title: "Experience",
      icon: Briefcase,
      score: Math.round(data.experienceScore || 0),
      comment: getSectionFeedback(
        "experience",
        data.experienceScore,
        data.sections?.experience?.comment || data.experienceComment
      ),
    },
    {
      key: "education",
      title: "Education",
      icon: GraduationCap,
      score: Math.round(data.educationScore || 0),
      comment: getSectionFeedback(
        "education",
        data.educationScore,
        data.sections?.education?.comment || data.educationComment
      ),
    },
    {
      key: "skills",
      title: "Skills",
      icon: Code2,
      score: Math.round(data.skillsScore || 0),
      comment: getSectionFeedback(
        "skills",
        data.skillsScore,
        data.sections?.skills?.comment || data.skillsComment
      ),
    },
  ], [data]);

  return (
    <div className="space-y-8 pb-12">
      {/* ========================================================================= */}
      {/* 1. REPORT HEADER & VERIFICATION STATUS                                    */}
      {/* ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: standardEase }}
        className="relative rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/85 to-card/50 p-6 md:p-8 shadow-xs backdrop-blur-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                AI Career Assessment Report
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Analysis
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Resume Analysis
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              You submitted your resume and CareerWise has professionally analyzed it against
              modern industry hiring benchmarks and Applicant Tracking Systems.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 border border-border/80 text-xs text-muted-foreground shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Diagnostic Ready</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Evaluated across 4 key hiring dimensions
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 2. OVERALL SCORE & EXECUTIVE SUMMARY (FOCAL POINT)                        */}
      {/* ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={defaultViewport}
        variants={fadeUpVariants}
      >
        <Card className="border border-border/80 bg-card shadow-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Circular Score Ring Visualizer */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border/60 bg-muted/20">
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
                  {/* Background Ring */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted/40"
                    fill="transparent"
                  />
                  {/* Dynamic Progress Ring */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke={overallEval.ringStroke}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>

                {/* Center Score Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                    {overallScore}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider">
                    / 100
                  </span>
                </div>
              </div>

              {/* Semantic Status Badge */}
              <div className="mt-4 flex flex-col items-center space-y-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${overallEval.bgClass} ${overallEval.colorClass} ${overallEval.borderClass}`}>
                  <Target className="h-3 w-3" />
                  {overallEval.status}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Overall Resume Quality
                </span>
              </div>
            </div>

            {/* Right: Executive Feedback & Summary */}
            <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Executive Assessment
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
                    Summary & Diagnostic Verdict
                  </h3>
                </div>

                {data.summaryComment && (
                  <div className="p-4 rounded-xl border border-border/70 bg-background/60 backdrop-blur-xs">
                    <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                      {data.summaryComment}
                    </p>
                  </div>
                )}

                {data.overallFeedback && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Feedback Overview
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {data.overallFeedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60">
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-xs text-muted-foreground">ATS Benchmark</p>
                  <p className="text-lg font-bold text-foreground font-mono mt-0.5">
                    {atsScore}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-xs text-muted-foreground">Keyword Matches</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {data.keywordMatches?.length || 0} Found
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground">Skill Gaps</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                    {data.keywordGaps?.length || 0} Identified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. SECTION SCORES (4 CORE DIMENSIONS)                                     */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Section-by-Section Ratings</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Granular evaluation across structural standards, achievements, credentials, and technical discovery.
          </p>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={defaultViewport}
          variants={createStaggerContainer(0.08, 0.1)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {sections.map((sec) => {
            const SectionIcon = sec.icon;
            const evalInfo = getScoreEvaluation(sec.score);

            return (
              <motion.div
                key={sec.key}
                variants={staggerItemVariants}
                className="h-full"
              >
                <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200 flex flex-col justify-between h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <SectionIcon className="h-4 w-4" />
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${evalInfo.bgClass} ${evalInfo.colorClass} ${evalInfo.borderClass}`}>
                        {evalInfo.status}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold tracking-tight text-foreground pt-2">
                      {sec.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-2xl font-extrabold tracking-tight text-foreground font-mono">
                          {sec.score}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Target: 80%+
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${evalInfo.progressColor}`}
                          style={{ width: `${Math.min(sec.score, 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                      {sec.comment}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ATS ANALYSIS & KEYWORDS (MATCHES & GAPS)                                */}
      {/* ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={defaultViewport}
        variants={fadeUpVariants}
      >
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>ATS Parsing & Keyword Optimization</span>
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">
                  How effectively corporate Applicant Tracking Systems extract and parse your profile.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${atsEval.bgClass} ${atsEval.colorClass} ${atsEval.borderClass}`}>
                  ATS Score: {atsScore}%
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {data.atsComment && (
              <div className="p-4 rounded-xl border border-border/70 bg-muted/20">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {data.atsComment}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keyword Matches */}
              <div className="space-y-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-semibold text-sm text-foreground">Keyword Matches</h4>
                  </div>
                  <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    {data.keywordMatches?.length || 0} Detected
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recognized keywords matching high-volume industry search patterns.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.keywordMatches && data.keywordMatches.length > 0 ? (
                    data.keywordMatches.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      >
                        <Check className="h-3 w-3 text-emerald-500" />
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No primary keyword matches detected.</span>
                  )}
                </div>
              </div>

              {/* Keyword Gaps */}
              <div className="space-y-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-semibold text-sm text-foreground">Keyword Gaps</h4>
                  </div>
                  <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30">
                    {data.keywordGaps?.length || 0} Suggested
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  High-frequency keywords missing from your resume that recruiters search for.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.keywordGaps && data.keywordGaps.length > 0 ? (
                    data.keywordGaps.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      >
                        <Plus className="h-3 w-3 text-amber-500" />
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No critical keyword gaps identified.</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========================================================================= */}
      {/* 5. ACTIONABLE IMPROVEMENT TIPS                                            */}
      {/* ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={defaultViewport}
        variants={fadeUpVariants}
      >
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <span>Actionable Improvement Tips</span>
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">
                  Prioritized recommendations to convert your resume into an interview magnet.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {data.tipsForImprovement?.length || 0} Actions
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.tipsForImprovement || []).map((tip, idx) => {
                // Parse if tip has a problem -> recommendation structure
                const parts = tip.split(/:\s*|\s*-\s*|\s*→\s*/);
                const title = parts.length > 1 ? parts[0] : `Priority Action #${idx + 1}`;
                const description = parts.length > 1 ? parts.slice(1).join(" — ") : tip;

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-xs transition-all"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <h5 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        <span>{title}</span>
                      </h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ========================================================================= */}
      {/* 6. WHAT'S WORKING WELL VS. AREAS FOR IMPROVEMENT                          */}
      {/* ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={defaultViewport}
        variants={fadeUpVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* What's Working Well */}
        <Card className="border border-emerald-500/30 bg-card shadow-xs hover:border-emerald-500/50 transition-colors">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>What's Working Well</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Strengths
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Key resume elements currently executing at high professional standards.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ul className="space-y-3">
              {(data.whatsGood || []).map((good, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-foreground/90 leading-relaxed">{good}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Needs Improvement */}
        <Card className="border border-rose-500/30 bg-card shadow-xs hover:border-rose-500/50 transition-colors">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <span>Areas for Improvement</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs text-rose-600 dark:text-rose-400 border-rose-500/30">
                Weaknesses
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Vulnerabilities that may lower your interview conversion rates.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ul className="space-y-3">
              {(data.needsImprovement || []).map((need, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <span className="text-foreground/90 leading-relaxed">{need}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
