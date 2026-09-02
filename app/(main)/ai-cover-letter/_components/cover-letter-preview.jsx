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
  Share2,
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

export default function CoverLetterPreview({ letter }) {
  const router = useRouter();
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
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 pl-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <Link href="/ai-cover-letter">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cover Letters</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="text-[11px] gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{stats.words} words</span>
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              {stats.minutes} min read
            </Badge>
          </div>
        </div>

        {/* Title and Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs font-medium">
                <Building2 className="h-3 w-3 text-primary" />
                <span>{letter.companyName}</span>
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(letter.createdAt), "MMMM d, yyyy")}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {letter.jobTitle}
            </h1>
          </div>

          {/* Action Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View / Edit Mode Switcher */}
            <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  mode === "preview"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Document</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  mode === "edit"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Markdown</span>
              </button>
            </div>

            {/* Copy Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => handleDownload("txt")}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Download Text (.txt)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload("md")}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Download Markdown (.md)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handlePrint}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Print to PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Regenerate Action */}
            <Button
              variant="default"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="gap-1.5 text-xs shadow-xs"
              title="Regenerate with Gemini AI"
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Regenerate</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Document Paper Surface */}
      <div className="w-full flex justify-center py-2">
        {mode === "preview" ? (
          /* High-Contrast Document Paper View */
          <div
            id="printable-cover-letter"
            className={`w-full max-w-3xl rounded-xl p-6 sm:p-12 md:p-16 transition-all duration-200 ${
              isDark
                ? "bg-[#0b1329] text-slate-100 border border-slate-800/80 shadow-2xl"
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
                  color: isDark ? "#f1f5f9" : "#0f172a",
                  fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontSize: "15px",
                  lineHeight: "1.8",
                }}
              />
            </div>
          </div>
        ) : (
          /* Interactive Markdown Editor */
          <div
            className="w-full max-w-3xl rounded-xl overflow-hidden border border-border/80 shadow-xl"
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
      </div>

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