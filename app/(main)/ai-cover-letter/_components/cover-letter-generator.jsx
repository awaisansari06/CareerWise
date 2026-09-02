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
    <Card className="border-border/80 bg-card/70 backdrop-blur-sm shadow-md overflow-hidden">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="neutral" className="gap-1 text-[11px]">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>AI Document Engine</span>
          </Badge>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Target Position Information
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          Provide the employer and role information. CareerWise AI will synthesize your resume achievements directly into a persuasive, professional cover letter.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form id="cover-letter-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Company & Job Title Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xs sm:text-sm font-medium flex items-center gap-1.5 text-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Company Name</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="e.g., Google, Stripe, Microsoft"
                aria-invalid={!!errors.companyName}
                className={errors.companyName ? "border-destructive focus-visible:ring-destructive/30" : ""}
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

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-xs sm:text-sm font-medium flex items-center gap-1.5 text-foreground">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <span>Target Job Title</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Senior Software Engineer"
                aria-invalid={!!errors.jobTitle}
                className={errors.jobTitle ? "border-destructive focus-visible:ring-destructive/30" : ""}
                {...register("jobTitle")}
              />
              {errors.jobTitle ? (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.jobTitle.message}</span>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  The exact title as listed in the job posting
                </p>
              )}
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="jobDescription" className="text-xs sm:text-sm font-medium flex items-center gap-1.5 text-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Job Description & Requirements</span>
                <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Paste requirements
              </span>
            </div>

            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description, required skills, and key responsibilities here..."
              rows={7}
              className={`min-h-[160px] text-sm leading-relaxed ${
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
                Tip: Include core responsibilities and technical qualifications for the most targeted letter.
              </p>
            )}
          </div>

          {/* Context Banner */}
          <div className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/50">
            <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              The AI automatically cross-references your uploaded resume achievements and skills to write authentic, evidence-based paragraphs without boilerplate placeholders.
            </p>
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t border-border/60 bg-muted/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          Ready to generate an ATS-tailored draft
        </p>

        <Button
          type="submit"
          form="cover-letter-form"
          disabled={generating}
          size="lg"
          className="w-full sm:w-auto gap-2 px-7 font-medium shadow-xs"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
              <span>Generating Cover Letter...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Generate Cover Letter</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}