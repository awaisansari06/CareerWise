"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadResume } from "@/actions/resume";
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
  ChevronRight,
  Activity,
  Layers,
  Compass,
  Target,
  FileText,
  Upload,
  Loader2,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatInrSalary, formatInrLakhs } from "@/lib/salary-utils";

// Helper to format trend strings into { title, description }
function parseTrend(trend) {
  if (!trend) return { title: "Industry Shift", desc: "" };
  if (trend.includes(":")) {
    const parts = trend.split(":");
    return {
      title: parts[0].trim(),
      desc: parts.slice(1).join(":").trim(),
    };
  }
  if (trend.includes(" - ")) {
    const parts = trend.split(" - ");
    return {
      title: parts[0].trim(),
      desc: parts.slice(1).join(" - ").trim(),
    };
  }
  // If no delimiter, take first 5 words as title
  const words = trend.split(" ");
  if (words.length > 5) {
    return {
      title: words.slice(0, 5).join(" ") + "...",
      desc: trend,
    };
  }
  return { title: trend, desc: "" };
}

export default function DashboardView({ insights, initialResume }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentResume, setCurrentResume] = useState(initialResume);
  const [isUploading, setIsUploading] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialResume) {
      setCurrentResume(initialResume);
    }
  }, [initialResume]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow selecting same file if desired
    e.target.value = "";

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit. Please upload a smaller PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setIsUploading(true);
    const toastId = toast.loading("Analyzing and updating resume with Gemini AI...");

    try {
      const response = await uploadResume(formData);

      if (response?.success && response?.resume) {
        setCurrentResume({
          id: response.resume.id,
          filename: response.resume.filename || file.name,
          skills: response.resume.skills || [],
          updatedAt: response.resume.updatedAt || new Date().toISOString(),
        });
        toast.success("Resume updated successfully! Career profile refreshed.", { id: toastId });
        router.refresh();
      } else {
        toast.error(response?.error || "Failed to update resume. Please try again.", { id: toastId });
      }
    } catch (err) {
      toast.error(err.message || "Failed to update resume. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Memoized salary chart data in Indian Rupees
  const salaryData = useMemo(() => {
    if (!insights?.salaryRanges || !Array.isArray(insights.salaryRanges)) return [];
    return insights.salaryRanges.map((range) => {
      const minVal = Number(range.min) || 0;
      const maxVal = Number(range.max) || 0;
      const medianVal = Number(range.median) || 0;

      return {
        name: range.role,
        rawMin: minVal,
        rawMax: maxVal,
        rawMedian: medianVal,
        // Values in Lakhs for clean chart scaling (e.g. 7.5L, 12L)
        min: Number((minVal / 100000).toFixed(2)),
        max: Number((maxVal / 100000).toFixed(2)),
        median: Number((medianVal / 100000).toFixed(2)),
        spread: Number(((maxVal - minVal) / 100000).toFixed(2)),
      };
    });
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
          cardBorder: "border-emerald-500/30 hover:border-emerald-500/60",
        };
      case "neutral":
        return {
          icon: Minus,
          badgeVariant: "warning",
          badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          iconColor: "text-amber-500",
          dotColor: "bg-amber-500",
          description: "Stable market equilibrium",
          cardBorder: "border-amber-500/30 hover:border-amber-500/60",
        };
      case "negative":
        return {
          icon: TrendingDown,
          badgeVariant: "danger",
          badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          iconColor: "text-rose-500",
          dotColor: "bg-rose-500",
          description: "Cautious hiring cycle",
          cardBorder: "border-rose-500/30 hover:border-rose-500/60",
        };
      default:
        return {
          icon: TrendingUp,
          badgeVariant: "secondary",
          badgeClass: "bg-secondary text-secondary-foreground",
          iconColor: "text-primary",
          dotColor: "bg-primary",
          description: "Market in transition",
          cardBorder: "border-border/80 hover:border-primary/50",
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

  // Custom Tooltip for Salary Bar Chart in Indian Rupees
  const CustomSalaryTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-4 shadow-2xl backdrop-blur-md text-popover-foreground transition-all max-w-xs">
        <p className="font-bold text-sm tracking-tight text-foreground mb-2 pb-1.5 border-b border-border/60">
          {label}
        </p>
        <div className="space-y-2 text-xs">
          {payload.map((item) => {
            const rawVal =
              item.dataKey === "min"
                ? item.payload?.rawMin
                : item.dataKey === "median"
                ? item.payload?.rawMedian
                : item.payload?.rawMax;
            const displayVal = typeof rawVal === "number" ? formatInrSalary(rawVal) : `₹${item.value}L`;

            return (
              <div key={item.name} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color || item.fill }}
                  />
                  <span>{item.name}:</span>
                </span>
                <span className="font-bold text-foreground font-mono">
                  {displayVal} / yr
                </span>
              </div>
            );
          })}
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
        <p className="font-bold text-base text-foreground mb-2">{label}</p>
        <div className="flex items-center justify-between gap-4 text-xs">
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
      {/* 1. COMMAND CENTER HEADER & INTELLIGENCE TELEMETRY                         */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-card/50 p-6 md:p-8 shadow-xs backdrop-blur-xs overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Career Intelligence Command Center</span>
              </span>
              {insights?.industry && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/60">
                  <Briefcase className="h-3 w-3 text-primary" />
                  <span>{insights.industry}</span>
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Industry Insights & Market Intelligence
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed">
              Real-time workforce intelligence synthesized from market demand signals, hiring velocity, and compensation benchmarks to give you an unfair career advantage.
            </p>
          </div>

          {/* Telemetry Status Bar */}
          <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/50">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/90 border border-border/80 text-xs font-medium text-foreground shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Market Telemetry</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>
                Next refresh:{" "}
                <strong className="text-foreground font-semibold">
                  {nextUpdateDistance}
                </strong>
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground hidden sm:block">
              Refreshed on {lastUpdatedDate}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1B. ACTIVE RESUME STATUS & UPDATE BAR                                     */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-4 shadow-2xs backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Active Resume
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-semibold"
              >
                Current
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
              <span className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {currentResume?.filename || "Uploaded Resume.pdf"}
              </span>
              <span>•</span>
              <span>
                Last updated{" "}
                {format(
                  new Date(currentResume?.updatedAt || Date.now()),
                  "MMM d, yyyy"
                )}
              </span>
            </div>

            {/* Personal Skills from Current Resume */}
            {Array.isArray(currentResume?.skills) && currentResume.skills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Skills:
                </span>
                {currentResume.skills.slice(0, 8).map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
                {currentResume.skills.length > 8 && (
                  <span className="text-[11px] text-muted-foreground font-medium px-1">
                    +{currentResume.skills.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2 text-xs font-semibold cursor-pointer border-border/80 hover:border-primary/50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Updating Resume...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 text-primary" />
                <span>Update Resume</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP METRICS (COMMAND CENTER HIERARCHY)                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
        {/* Market Outlook (Featured Focal Metric) */}
        <Card className={`transition-all duration-200 shadow-xs hover:shadow-md ${outlookConfig.cardBorder}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Market Outlook
            </span>
            <div className={`p-2 rounded-lg bg-background/80 border border-border/60 ${outlookConfig.iconColor}`}>
              <OutlookIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {insights?.marketOutlook || "Neutral"}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${outlookConfig.badgeClass}`}>
                Cycle
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {outlookConfig.description}
            </p>
          </CardContent>
        </Card>

        {/* Industry Growth */}
        <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Industry Growth
            </span>
            <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
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
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Demand Level
            </span>
            <div className={`p-2 rounded-lg bg-background/80 border border-border/60 ${demandConfig.colorClass}`}>
              <Zap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {insights?.demandLevel || "Medium"}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${demandConfig.badgeClass}`}>
                Velocity
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

        {/* Active Job Openings */}
        <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Job Openings
            </span>
            <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {(insights?.jobOpenings || 0).toLocaleString("en-US")}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {Number(insights?.jobOpeningsChange) >= 0 ? (
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{insights?.jobOpeningsChange}%
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-bold gap-0.5 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  {insights?.jobOpeningsChange}%
                </span>
              )}
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Top In-Demand Skills */}
        <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Top Industry Skills
            </span>
            <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-primary">
              <Brain className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {insights?.topSkills?.length || 0} In-Demand
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {(insights?.topSkills || []).slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/60"
                >
                  {skill}
                </span>
              ))}
              {(insights?.topSkills?.length || 0) > 3 && (
                <span className="text-[11px] text-muted-foreground font-medium px-1 py-0.5">
                  +{(insights.topSkills.length - 3)} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. SALARY INTELLIGENCE (PRIMARY ANALYTICAL VISUALIZATION)                  */}
      {/* ========================================================================= */}
      <Card className="border border-border/80 shadow-md">
        <CardHeader className="border-b border-border/60 pb-4 bg-card/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Salary Ranges by Role</span>
                <Badge variant="outline" className="text-xs font-mono font-normal">
                  INR (₹ Lakhs)
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                Comparative minimum, median, and maximum compensation packages benchmarked across industry roles.
              </CardDescription>
            </div>

            {/* Custom Interactive Legend */}
            <div className="flex items-center gap-3 text-xs bg-muted/30 p-1.5 rounded-lg border border-border/60">
              <div className="flex items-center gap-1.5 px-2 py-1">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: chartColors.salaryMin }}
                />
                <span className="text-muted-foreground font-medium">Min Base</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: chartColors.salaryMedian }}
                />
                <span className="text-foreground font-semibold">Median</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: chartColors.salaryMax }}
                />
                <span className="text-muted-foreground font-medium">Top Tier (Max)</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {salaryData.length > 0 ? (
            <div className="h-[400px] sm:h-[460px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salaryData}
                  margin={{ top: 15, right: 15, left: -5, bottom: 45 }}
                  barGap={6}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={chartColors.grid}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={chartColors.axis}
                    fontSize={12}
                    tickLine={false}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={55}
                    fontWeight={500}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}L`}
                    fontWeight={500}
                  />
                  <Tooltip
                    content={<CustomSalaryTooltip />}
                    cursor={{
                      fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
                    }}
                  />
                  <Bar
                    dataKey="min"
                    fill={chartColors.salaryMin}
                    radius={[4, 4, 0, 0]}
                    name="Min Base"
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="median"
                    fill={chartColors.salaryMedian}
                    radius={[4, 4, 0, 0]}
                    name="Median"
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="max"
                    fill={chartColors.salaryMax}
                    radius={[4, 4, 0, 0]}
                    name="Top Tier (Max)"
                    maxBarSize={38}
                  />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Key Industry Trends (Structured Number -> Title -> Description) */}
        <Card className="hover:border-primary/30 transition-all duration-200">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Key Industry Trends</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Transformative shifts and operational dynamics shaping this discipline.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {(insights?.keyTrends || []).length} Trends
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <ul className="space-y-3.5">
              {(insights?.keyTrends || []).map((trend, idx) => {
                const { title, desc } = parseTrend(trend);
                return (
                  <li
                    key={idx}
                    className="flex items-start gap-3.5 p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 transition-all"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <h4 className="font-bold text-foreground leading-snug">
                        {title}
                      </h4>
                      {desc && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {desc}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Skills & Target Gap */}
        <Card className="hover:border-primary/30 transition-all duration-200">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>Recommended Skills</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  High-leverage competencies to build immediate competitive advantage.
                </CardDescription>
              </div>
              <Badge variant="info" className="text-xs gap-1 font-semibold">
                <Target className="h-3 w-3" />
                <span>Target Gap</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(insights?.recommendedSkills || []).map((skill, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 group-hover:rotate-12 transition-transform" />
                    <span className="font-semibold text-foreground truncate">
                      {skill}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 bg-muted/40 px-1.5 py-0.5 rounded">
                    High Impact
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">💡 Market Advantage: </span>
              Mastering these competencies increases interview invitation rates by up to 34% in this industry.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 5. CAREER PATH & HIRING REGIONS                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Career Path Progression Pipeline */}
        <Card className="hover:border-primary/30 transition-all duration-200">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary" />
                  <span>Career Path Progression</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Typical hierarchical promotion trajectory and benchmarked salary progression.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                5 Stages
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-border/80">
              {(insights?.careerPath || []).map((role, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline connector marker */}
                  <div className="absolute -left-[27px] top-1.5 h-4 w-4 rounded-full border-2 border-background bg-primary transition-transform group-hover:scale-125 shadow-xs" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                          Stage {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">
                          {role.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Hierarchical Milestone
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {typeof role.salary === "number"
                          ? role.salary >= 100000
                            ? `${formatInrSalary(role.salary)} Avg`
                            : formatInrLakhs(role.salary * 1000) + " Avg"
                          : `${role.salary} Avg`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Hiring Regions */}
        <Card className="hover:border-primary/30 transition-all duration-200">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Top Hiring Regions</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Geographic hubs with concentrated hiring activity and active vacancies.
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
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border/50 bg-card/60 space-y-2 hover:border-border transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {region.name}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {(region.jobs || 0).toLocaleString("en-US")}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          openings
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
      </div>

      {/* ========================================================================= */}
      {/* 6. RECOMMENDED CERTIFICATIONS                                             */}
      {/* ========================================================================= */}
      <Card className="hover:border-primary/30 transition-all duration-200">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span>Recommended Certifications</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Industry-accredited credentials that accelerate recruiter screening and salary negotiation.
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              Screening Accelerators
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(insights?.certifications || []).map((cert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-xs transition-all"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className="text-sm font-bold text-foreground leading-snug line-clamp-2"
                    title={cert}
                  >
                    {cert}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Industry Accredited Standard
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 7. INDUSTRY GROWTH FORECAST (AREA CHART)                                  */}
      {/* ========================================================================= */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4 bg-card/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Industry Growth Forecast</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Projected trajectory and annual compound expansion rate over the upcoming 5-year cycle.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs w-fit font-mono font-medium">
              5-Year Horizon
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {forecastData.length > 0 ? (
            <div className="h-[300px] sm:h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={forecastData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="forecastAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.forecastAreaStart} />
                      <stop offset="95%" stopColor={chartColors.forecastAreaEnd} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={chartColors.grid}
                  />
                  <XAxis
                    dataKey="year"
                    stroke={chartColors.axis}
                    fontSize={12}
                    tickLine={false}
                    fontWeight={500}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                    fontWeight={500}
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
