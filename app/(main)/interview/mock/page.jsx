import Link from "next/link";
import { ArrowLeft, Sparkles, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";

export default function MockInterviewPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6 px-4">
      {/* Navigation & Header */}
      <div className="space-y-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2 pl-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <Link href="/interview">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Interview Preparation</span>
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-md bg-primary/10 text-primary">
                <BrainCircuit className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                AI Mock Interview
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Dynamic role-targeted questions designed to test your knowledge, problem-solving, and communication
            </p>
          </div>
        </div>
      </div>

      {/* Main Quiz Flow */}
      <Quiz />
    </div>
  );
}
