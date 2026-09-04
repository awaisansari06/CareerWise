"use client";

import React, { useState, useEffect, useMemo } from "react";
import MDEditor from "@uiw/react-md-editor";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  FileText,
  Edit3,
  Building2,
  Calendar,
  Loader2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { motion, useReducedMotion } from "framer-motion";
import { standardEase } from "@/lib/motion-variants";

export default function CoverLetterPreview({ letter }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState(letter?.content || "");
  const [mode, setMode] = useState("preview"); // "preview" | "edit"
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  // Regeneration hook
  const {
    loading: regenerating,
    fn: regenerateFn,
    data: newLetter,
  } = useFetch(generateCoverLetter);

  useEffect(() => {
    if (newLetter) {
      toast.success("New cover letter generated successfully!");
      router.push(`/ai-cover-letter/${newLetter.id}`);
    }
  }, [newLetter, router]);

  const handleRegenerate = async () => {
    if (!letter) return;
    try {
      await regenerateFn({
        companyName: letter.companyName,
        jobTitle: letter.jobTitle,
        jobDescription: letter.jobDescription || "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to regenerate cover letter");
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Cover letter copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text to clipboard");
    }
  };

  // Download as text or markdown
  const handleDownload = (formatType = "txt") => {
    const filename = `Cover_Letter_${(letter.companyName || "Application").replace(/\s+/g, "_")}.${formatType}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${filename}`);
  };

  // Print to PDF
  const handlePrint = () => {
    window.print();
  };

  // Word count & read time stats
  const stats = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [content]);

  return (
    <div className="space-y-6">
      {/* Workspace Top Bar (Hidden on Print) */}
      <div className="print:hidden space-y-4">
        {/* Action Bar / Navigation */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: standardEase }}
          className="flex items-center justify-between"
        >
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 pl-2 text-muted-foreground hover:text-foreground -ml-2 font-medium"
          >
            <Link href="/ai-cover-letter">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cover Letters</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="text-xs font-mono gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{stats.words} words</span>
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {stats.minutes} min read
            </Badge>
          </div>
        </motion.div>

        {/* Title and Workspace Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : 0.08, ease: standardEase }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-5"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 text-xs font-semibold bg-muted/40">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>{letter.companyName}</span>
              </Badge>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(letter.createdAt), "MMMM d, yyyy")}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {letter.jobTitle}
            </h1>
          </div>

          {/* Action Controls Toolbar (Hierarchical) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 md:pt-0">
            {/* 1. Primary: Mode Switcher */}
            <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  mode === "preview"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Document</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  mode === "edit"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <Edit3 className="h-3.5 w-3.5 text-primary" />
                <span>Edit Markdown</span>
              </button>
            </div>

            {/* 2. Utility Actions: Copy */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs font-semibold"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>

            {/* 3. Utility Actions: Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleDownload("txt")}
                  className="gap-2 cursor-pointer text-xs font-medium"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Download Text (.txt)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload("md")}
                  className="gap-2 cursor-pointer text-xs font-medium"
                >
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Download Markdown (.md)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handlePrint}
                  className="gap-2 cursor-pointer text-xs font-medium"
                >
                  <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Print to PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 4. Secondary Action: Regenerate (Styled as subtle secondary outline, not dominating primary action) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border-border/80"
              title="Regenerate with Gemini AI"
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5 text-primary" />
                  <span>Regenerate</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Elevated Document Surface Canvas */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.15, ease: standardEase }}
        className="w-full flex justify-center py-2 sm:py-4"
      >
        {mode === "preview" ? (
          /* High-Contrast Document Paper View */
          <div
            id="printable-cover-letter"
            className={`w-full max-w-3xl rounded-2xl p-8 sm:p-14 md:p-16 transition-all duration-200 ${
              isDark
                ? "bg-card text-foreground border border-border/80 shadow-2xl"
                : "bg-white text-slate-900 border border-slate-200/90 shadow-xl"
            } print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:bg-white print:text-black`}
          >
            <div
              className={`prose prose-sm sm:prose-base max-w-none ${
                isDark ? "prose-invert" : ""
              }`}
            >
              <MDEditor.Markdown
                source={content}
                style={{
                  backgroundColor: "transparent",
                  color: isDark ? "hsl(var(--foreground))" : "#0f172a",
                  fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: "15px",
                  lineHeight: "1.85",
                }}
              />
            </div>
          </div>
        ) : (
          /* Interactive Markdown Editor */
          <div
            className="w-full max-w-3xl rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-card"
            data-color-mode={isDark ? "dark" : "light"}
          >
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              height={650}
              preview="edit"
              className="!border-none"
            />
          </div>
        )}
      </motion.div>

      {/* Print-specific style helper */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-cover-letter,
          #printable-cover-letter * {
            visibility: visible;
          }
          #printable-cover-letter {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}