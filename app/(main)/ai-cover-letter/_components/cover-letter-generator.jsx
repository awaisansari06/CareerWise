"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  Building2,
  Briefcase,
  FileText,
  AlertCircle,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema";
import { useRouter } from "next/navigation";

export default function CoverLetterGenerator() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      companyName: "",
      jobTitle: "",
      jobDescription: "",
    },
  });

  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  // Redirect when letter is generated
  useEffect(() => {
    if (generatedLetter) {
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset();
    }
  }, [generatedLetter, router, reset]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  return (
    <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
      <CardHeader className="border-b border-border/60 pb-5 bg-card/50">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="neutral" className="gap-1.5 text-xs font-semibold px-2.5 py-0.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Document Engine</span>
          </Badge>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Target Position Information
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
          Provide the employer and role requirements. CareerWise AI will cross-reference your verified resume background to synthesize a persuasive, tailored cover letter.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 sm:p-8">
        <form id="cover-letter-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company & Job Title Grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Company Name</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="e.g., Google, Stripe, Microsoft"
                aria-invalid={!!errors.companyName}
                className={`h-10 text-sm ${
                  errors.companyName ? "border-destructive focus-visible:ring-destructive/30" : ""
                }`}
                {...register("companyName")}
              />
              {errors.companyName ? (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.companyName.message}</span>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  The hiring organization you are applying to
                </p>
              )}
            </div>

            {/* Target Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <span>Target Job Title</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Senior Software Engineer"
                aria-invalid={!!errors.jobTitle}
                className={`h-10 text-sm ${
                  errors.jobTitle ? "border-destructive focus-visible:ring-destructive/30" : ""
                }`}
                {...register("jobTitle")}
              />
              {errors.jobTitle ? (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.jobTitle.message}</span>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  The exact title as listed on the vacancy
                </p>
              )}
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="jobDescription" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Job Description & Requirements</span>
                <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                Paste posting text
              </span>
            </div>

            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description, core responsibilities, and required qualifications here..."
              rows={8}
              className={`min-h-[180px] text-sm leading-relaxed ${
                errors.jobDescription ? "border-destructive focus-visible:ring-destructive/30" : ""
              }`}
              aria-invalid={!!errors.jobDescription}
              {...register("jobDescription")}
            />

            {errors.jobDescription ? (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.jobDescription.message}</span>
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Tip: The more detailed the requirements, the more specifically the AI maps your resume achievements.
              </p>
            )}
          </div>

          {/* Context Explainer Banner */}
          <div className="flex items-start gap-3 rounded-xl bg-muted/30 p-3.5 text-xs text-muted-foreground border border-border/60">
            <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              CareerWise AI extracts key accomplishments, quantifiable impact metrics, and tech stack proficiencies from your profile to write compelling paragraphs with zero generic filler.
            </p>
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t border-border/60 bg-muted/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          Outputs an ATS-tailored, editable Markdown document
        </p>

        <Button
          type="submit"
          form="cover-letter-form"
          disabled={generating}
          size="lg"
          className="w-full sm:w-auto gap-2 px-8 py-6 font-bold shadow-md hover:shadow-lg transition-all"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
              <span>Synthesizing Cover Letter...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Generate AI Cover Letter</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}