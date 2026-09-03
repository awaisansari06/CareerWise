"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { TrendingUp, Sparkles, ArrowRight, LineChart as ChartIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PerformanceChart({ assessments }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  const chartData = useMemo(() => {
    if (!assessments || assessments.length === 0) return [];
    return assessments.map((assessment, index) => ({
      quizNumber: index + 1,
      name: `Quiz ${index + 1}`,
      rawDate: assessment.createdAt,
      date: format(new Date(assessment.createdAt), "MMM d"),
      fullDate: format(new Date(assessment.createdAt), "MMM d, yyyy · h:mm a"),
      score: Math.round(assessment.quizScore),
      questionsCount: assessment.questions?.length || 10,
    }));
  }, [assessments]);

  const hasEnoughData = chartData.length >= 2;

  // Calculate improvement trend
  const trendDelta = useMemo(() => {
    if (!hasEnoughData) return null;
    const firstScore = chartData[0].score;
    const lastScore = chartData[chartData.length - 1].score;
    return lastScore - firstScore;
  }, [chartData, hasEnoughData]);

  return (
    <Card className="border-border/80 bg-card/70 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Performance Trajectory</span>
            </CardTitle>
            {hasEnoughData && trendDelta !== null && (
              <Badge
                variant={trendDelta >= 0 ? "success" : "warning"}
                className="text-xs font-semibold"
              >
                {trendDelta >= 0 ? `+${trendDelta}% trajectory` : `${trendDelta}% change`}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            Historical score progression and mastery consistency across your completed interviews.
          </CardDescription>
        </div>

        {hasEnoughData && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60 shrink-0 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{chartData.length} evaluations recorded</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {!hasEnoughData ? (
          /* Compact Sparse / Empty state */
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ChartIcon className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {chartData.length === 1
                  ? "1 Assessment Completed"
                  : "Performance Trend Locked"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
                {chartData.length === 1
                  ? "Complete at least one more interview to unlock your dynamic performance trend line and track progression over time."
                  : "Take your first mock interview to establish your baseline and begin tracking your interview readiness trajectory."}
              </p>
            </div>

            {chartData.length === 1 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-card border border-border/80 text-xs text-foreground font-medium shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  Baseline: <strong>{chartData[0].score}%</strong> recorded on {chartData[0].date}
                </span>
              </div>
            )}

            <div className="pt-1">
              <Button asChild size="sm" className="gap-2 shadow-xs font-medium">
                <Link href="/interview/mock">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{chartData.length === 1 ? "Start 2nd Interview" : "Start First Interview"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Actual Performance Trend Chart */
          <div className="h-[280px] sm:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isDark ? "#38bdf8" : "#0284c7"}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={isDark ? "#38bdf8" : "#0284c7"}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"}
                />

                <XAxis
                  dataKey="name"
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.1)" }}
                  dy={8}
                  fontWeight={500}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                  dx={-4}
                  fontWeight={500}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md min-w-[180px]">
                          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 mb-2">
                            <span className="font-bold text-sm text-foreground">
                              {data.name}
                            </span>
                            <Badge
                              variant={data.score >= 80 ? "success" : data.score >= 50 ? "warning" : "danger"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {data.score >= 80 ? "Strong" : data.score >= 50 ? "Passed" : "Retake"}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs">
                            <p className="flex justify-between text-muted-foreground">
                              <span>Score:</span>
                              <strong className="text-foreground font-bold text-sm font-mono">
                                {data.score}%
                              </strong>
                            </p>
                            <p className="flex justify-between text-muted-foreground">
                              <span>Date:</span>
                              <span className="text-foreground font-medium">{data.date}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={isDark ? "#38bdf8" : "#0284c7"}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  dot={{
                    r: 4,
                    fill: isDark ? "#0f172a" : "#ffffff",
                    stroke: isDark ? "#38bdf8" : "#0284c7",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: isDark ? "#38bdf8" : "#0284c7",
                    stroke: isDark ? "#ffffff" : "#0f172a",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
