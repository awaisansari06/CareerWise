"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uploadResume } from "@/actions/resume";
import { toast } from "sonner";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle file selection with size limit
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const MAX_SIZE_MB = 4;

    if (selectedFile && selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large! Max ${MAX_SIZE_MB}MB allowed.`);
      return;
    }

    if (selectedFile && selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }

    setFile(selectedFile);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select a file first!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      let attempts = 0;
      let result;

      while (attempts < 3) {
        attempts++;
        result = await uploadResume(formData);

        if (result.success) break;

        if (result.error.includes("Too Many Requests")) {
          toast.info(`Server busy, retrying... (${attempts}/3)`);
          await new Promise((r) => setTimeout(r, attempts * 1000));
          continue;
        }

        throw new Error(result.error);
      }

      if (!result?.success) throw new Error(result.error);

      toast.success("Resume uploaded & analyzed successfully!");
      setIsOpen(false);

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border/80 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-6 sm:p-8 relative space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-xl bg-primary/10 text-primary mb-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Complete Your Career Onboarding
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Upload your existing resume to unlock personalized career insights, ATS scoring, and custom interview prep.
          </p>
        </div>

        {/* Upload Dropzone */}
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 text-center select-none ${
          file
            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
            : "border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-muted/10"
        }`}>
          {file ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground break-all max-w-[280px]">
                {file.name}
              </p>
              <Badge variant="neutral" className="text-[11px]">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Click to browse or drop your resume
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span>PDF format</span>
                <span>•</span>
                <span>Max 4 MB</span>
              </p>
            </div>
          )}

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-muted-foreground text-center sm:text-left">
            Your document data is encrypted & processed securely
          </p>
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            size="lg"
            className="w-full sm:w-auto gap-2 px-6 shadow-xs font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload & Begin</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
