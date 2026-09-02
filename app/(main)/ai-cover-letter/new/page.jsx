import Link from "next/link";
import { ArrowLeft, PenBox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";

export default function NewCoverLetterPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-6 py-6 px-4">
      {/* Navigation & Header */}
      <div className="space-y-3">
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

        <div className="border-b border-border/60 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-primary/10 text-primary">
              <PenBox className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Create AI Cover Letter
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Provide the target company, role, and job description to craft a personalized letter aligned with your resume
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <CoverLetterGenerator />
    </div>
  );
}