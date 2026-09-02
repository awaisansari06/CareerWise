"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Brain,
  Sparkles,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Award,
  MapPin,
  Route,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DashboardView({ insights }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Memoized salary chart data
  const salaryData = useMemo(() => {
    if (!insights?.salaryRanges || !Array.isArray(insights.salaryRanges)) return [];
    return insights.salaryRanges.map((range) => ({
      name: range.role,
      min: Math.round(range.min / 1000),
      max: Math.round(range.max / 1000),
      median: Math.round(range.median / 1000),
    }));
  }, [insights?.salaryRanges]);

  // Memoized forecast line data
  const forecastData = useMemo(() => {
    if (!insights?.forecast || !Array.isArray(insights.forecast)) return [];
    return insights.forecast.map((item) => ({
      year: item.year,
      growth: Number(item.growth) || 0,
    }));
  }, [insights?.forecast]);

  // Maximum jobs in regions for relative visual progress
  const maxRegionJobs = useMemo(() => {
    if (!insights?.topRegions?.length) return 1;
    return Math.max(...insights.topRegions.map((r) => r.jobs || 0), 1);
  }, [insights?.topRegions]);

  // Market outlook mapping
  const getMarketOutlookConfig = (outlook) => {
    switch (outlook?.toLowerCase()) {
      case "positive":
        return {
          icon: TrendingUp,
          badgeVariant: "success",
          badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          iconColor: "text-emerald-500",
          dotColor: "bg-emerald-500",
          description: "Accelerating hiring momentum",
        };
      case "neutral":
        return {
          icon: Minus,
          badgeVariant: "warning",
          badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          iconColor: "text-amber-500",
          dotColor: "bg-amber-500",
          description: "Stable market equilibrium",
        };
      case "negative":
        return {
          icon: TrendingDown,
          badgeVariant: "danger",
          badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          iconColor: "text-rose-500",
          dotColor: "bg-rose-500",
          description: "Cautious hiring cycle",
        };
      default:
        return {
          icon: TrendingUp,
          badgeVariant: "secondary",
          badgeClass: "bg-secondary text-secondary-foreground",
          iconColor: "text-primary",
          dotColor: "bg-primary",
          description: "Market in transition",
        };
    }
  };

  // Demand level styling
  const getDemandConfig = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return {
          colorClass: "text-emerald-500",
          badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          barColor: "bg-emerald-500",
          percentage: 85,
        };
      case "medium":
        return {
          colorClass: "text-amber-500",
          badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          barColor: "bg-amber-500",
          percentage: 55,
        };
      case "low":
        return {
          colorClass: "text-rose-500",
          badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          barColor: "bg-rose-500",
          percentage: 25,
        };
      default:
        return {
          colorClass: "text-primary",
          badgeClass: "bg-secondary text-secondary-foreground",
          barColor: "bg-primary",
          percentage: 50,
        };
    }
  };

  const outlookConfig = getMarketOutlookConfig(insights?.marketOutlook);
  const OutlookIcon = outlookConfig.icon;
  const demandConfig = getDemandConfig(insights?.demandLevel);

  // Formatted dates
  const lastUpdatedDate = insights?.lastUpdated
    ? format(new Date(insights.lastUpdated), "dd MMM yyyy")
    : "Recently";
  const nextUpdateDistance = insights?.nextUpdate
    ? formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true })
    : "in 7 days";

  // Chart theme colors
  const chartColors = {
    grid: isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.08)",
    axis: isDark ? "#94a3b8" : "#64748b",
    salaryMin: isDark ? "#38bdf8" : "#0284c7",       // Sky
    salaryMedian: isDark ? "#818cf8" : "#4f46e5",    // Indigo
    salaryMax: isDark ? "#34d399" : "#059669",       // Emerald
    forecastLine: isDark ? "#38bdf8" : "#0284c7",
    forecastAreaStart: isDark ? "rgba(56, 189, 248, 0.28)" : "rgba(2, 132, 199, 0.22)",
    forecastAreaEnd: isDark ? "rgba(56, 189, 248, 0.0)" : "rgba(2, 132, 199, 0.0)",
  };

  // Custom Tooltip for Salary Bar Chart
  const CustomSalaryTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-popover-foreground transition-all">
        <p className="font-semibold text-sm tracking-tight text-foreground mb-2 pb-1 border-b border-border/60">
          {label}
        </p>
        <div className="space-y-1.5 text-xs">
          {payload.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color || item.fill }}
                />
                <span>{item.name}:</span>
              </span>
              <span className="font-bold text-foreground font-mono">
                ${item.value?.toLocaleString()}K
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom Tooltip for Forecast Line Chart
  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-popover-foreground">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Calendar className="h-3 w-3" />
          <span>Projected Year</span>
        </div>
        <p className="font-semibold text-base text-foreground mb-2">{label}</p>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span>Growth Rate:</span>
          </span>
          <span className="font-bold text-foreground font-mono">
            {payload[0]?.value}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ========================================================================= */}
      {/* 1. DASHBOARD HEADING & PERSONALIZED INTRODUCTION                          */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/80 to-card/40 p-6 md:p-8 shadow-xs backdrop-blur-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3 w-3" />
                AI Career Intelligence
              </span>
              {insights?.industry && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {insights.industry}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Industry Insights
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Real-time career analytics and market benchmarks synthesized from industry demands,
              recruiting patterns, and compensation data.
            </p>
          </div>

          {/* Intelligence Metainfo & Status */}
          <div className="flex flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 border border-border/80 text-xs text-muted-foreground shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Intelligence</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 opacity-70" />
              <span>Next update: <strong className="text-foreground font-medium">{nextUpdateDistance}</strong></span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Last refreshed {lastUpdatedDate}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KEY METRIC CARDS                                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Market Outlook */}
        <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Market Outlook
            </span>
            <div className={`p-2 rounded-lg bg-background/80 border border-border/60 ${outlookConfig.iconColor}`}>
              <OutlookIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {insights?.marketOutlook || "Neutral"}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${outlookConfig.badgeClass}`}>
                {insights?.marketOutlook || "Neutral"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{outlookConfig.description}</span>
            </p>
          </CardContent>
        </Card>

        {/* Industry Growth */}
        <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Industry Growth
            </span>
            <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {insights?.growthRate !== undefined ? `${insights.growthRate.toFixed(1)}%` : "0.0%"}
            </div>
            <Progress value={Math.min(insights?.growthRate || 0, 100)} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              Annual projected expansion rate
            </p>
          </CardContent>
        </Card>

        {/* Demand Level */}
        <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Demand Level
            </span>
            <div className={`p-2 rounded-lg bg-background/80 border border-border/60 ${demandConfig.colorClass}`}>
              <Zap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {insights?.demandLevel || "Medium"}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${demandConfig.badgeClass}`}>
                Level
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${demandConfig.barColor}`}
                style={{ width: `${demandConfig.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Hiring velocity & role creation
            </p>
          </CardContent>
        </Card>

        {/* Top In-Demand Skills */}
        <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Top Skills
            </span>
            <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-primary">
              <Brain className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {insights?.topSkills?.length || 0} Key Skills
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(insights?.topSkills || []).slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/50"
                >
                  {skill}
                </span>
              ))}
              {(insights?.topSkills?.length || 0) > 3 && (
                <span className="text-[11px] text-muted-foreground px-1 py-0.5">
                  +{(insights.topSkills.length - 3)} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Job Openings */}
        <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Job Openings
            </span>
            <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {(insights?.jobOpenings || 0).toLocaleString("en-US")}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {Number(insights?.jobOpeningsChange) >= 0 ? (
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{insights?.jobOpeningsChange}%
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-semibold gap-0.5">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  {insights?.jobOpeningsChange}%
                </span>
              )}
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. SALARY INTELLIGENCE (BAR CHART)                                        */}
      {/* ========================================================================= */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Salary Ranges by Role</span>
                <span className="text-xs font-normal text-muted-foreground">(USD in Thousands)</span>
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground mt-1">
                Comparative minimum, median, and maximum compensation packages across core roles.
              </CardDescription>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: chartColors.salaryMin }} />
                <span className="text-muted-foreground">Min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: chartColors.salaryMedian }} />
                <span className="text-muted-foreground">Median</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: chartColors.salaryMax }} />
                <span className="text-muted-foreground">Max</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {salaryData.length > 0 ? (
            <div className="h-[360px] sm:h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <XAxis
                    dataKey="name"
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}k`}
                  />
                  <Tooltip content={<CustomSalaryTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }} />
                  <Bar dataKey="min" fill={chartColors.salaryMin} radius={[4, 4, 0, 0]} name="Min Salary" maxBarSize={36} />
                  <Bar dataKey="median" fill={chartColors.salaryMedian} radius={[4, 4, 0, 0]} name="Median Salary" maxBarSize={36} />
                  <Bar dataKey="max" fill={chartColors.salaryMax} radius={[4, 4, 0, 0]} name="Max Salary" maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              No role salary data available for this sector.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 4. INDUSTRY TRENDS & RECOMMENDED SKILLS                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Industry Trends */}
        <Card className="hover:border-primary/30 transition-all duration-200">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Key Industry Trends</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Transformative shifts and operational dynamics defining this sector.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {(insights?.keyTrends || []).length} Trends
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <ul className="space-y-3">
              {(insights?.keyTrends || []).map((trend, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-foreground/90 leading-relaxed pt-0.5">
                    {trend}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Skills */}
        <Card className="hover:border-primary/30 transition-all duration-200">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Recommended Skills</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  High-leverage competencies to build competitive advantage.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Target Gap
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-2">
              {(insights?.recommendedSkills || []).map((skill, idx) => (
                <div
                  key={idx}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-xs text-foreground cursor-default"
                >
                  <Sparkles className="h-3 w-3 text-primary/70 group-hover:text-primary transition-colors" />
                  <span className="font-medium">{skill}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
              💡 Acquiring these skills increases interview invitation rates by up to 34% in this industry.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 5. HIRING REGIONS & CAREER PATH                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hiring Regions */}
        <Card className="hover:border-primary/30 transition-all duration-200">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Top Hiring Regions</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Geographic hubs with concentrated hiring activity and openings.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {(insights?.topRegions || []).length} Hubs
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              {(insights?.topRegions || []).map((region, idx) => {
                const percent = Math.round(((region.jobs || 0) / maxRegionJobs) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {region.name}
                      </span>
                      <span className="font-mono font-semibold text-xs text-muted-foreground">
                        {(region.jobs || 0).toLocaleString("en-US")} jobs
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Career Path */}
        <Card className="hover:border-primary/30 transition-all duration-200">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary" />
                  <span>Career Path Progression</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Typical hierarchical advancement trajectory and salary scale.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Trajectory
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              {(insights?.careerPath || []).map((role, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary transition-transform group-hover:scale-125" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {role.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stage {idx + 1}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                        ${role.salary}K Avg
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 6. RECOMMENDED CERTIFICATIONS                                             */}
      {/* ========================================================================= */}
      <Card className="hover:border-primary/30 transition-all duration-200">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span>Recommended Certifications</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Industry-accredited credentials that accelerate screening and credibility.
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              Boost Employability
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(insights?.certifications || []).map((cert, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-xs transition-all"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate" title={cert}>
                    {cert}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Accredited Benchmark
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 7. INDUSTRY GROWTH FORECAST (AREA / LINE CHART)                           */}
      {/* ========================================================================= */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Industry Growth Forecast</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Projected industry trajectory and annual compound expansion rate over the next 5 years.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              5-Year Horizon
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {forecastData.length > 0 ? (
            <div className="h-[280px] sm:h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="forecastAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.forecastAreaStart} />
                      <stop offset="95%" stopColor={chartColors.forecastAreaEnd} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <XAxis
                    dataKey="year"
                    stroke={chartColors.axis}
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomForecastTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="growth"
                    stroke={chartColors.forecastLine}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#forecastAreaGradient)"
                    dot={{ r: 4, fill: chartColors.forecastLine, strokeWidth: 1 }}
                    activeDot={{ r: 6, stroke: chartColors.forecastLine, strokeWidth: 2 }}
                    name="Growth Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              No projected growth forecast available for this segment.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
