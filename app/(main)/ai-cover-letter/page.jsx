import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus, PenBox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function CoverLetterPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }
  const coverLetters = await getCoverLetters();

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-primary/10 text-primary">
              <PenBox className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              My Cover Letters
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Generate and manage role-tailored cover letters crafted from your verified resume qualifications
          </p>
        </div>

        <Button asChild className="gap-2 shadow-xs shrink-0 self-start sm:self-auto">
          <Link href="/ai-cover-letter/new">
            <Plus className="h-4 w-4" />
            <span>Create New Letter</span>
          </Link>
        </Button>
      </div>

      {/* Document List */}
      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}