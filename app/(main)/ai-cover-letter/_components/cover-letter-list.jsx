"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Eye,
  Trash2,
  Building2,
  Calendar,
  Sparkles,
  FileText,
  ArrowRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCoverLetter } from "@/actions/cover-letter";

export default function CoverLetterList({ coverLetters }) {
  const router = useRouter();

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteCoverLetter(id);
      toast.success("Cover letter deleted successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to delete cover letter");
    }
  };

  if (!coverLetters?.length) {
    return (
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1.5">
            No Cover Letters Yet
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            Generate your first role-tailored, ATS-aligned cover letter customized to any employer and job description using your resume data.
          </p>
          <Button asChild className="gap-2 shadow-xs font-medium">
            <Link href="/ai-cover-letter/new">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Create Your First Cover Letter</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {coverLetters.map((letter) => (
        <Card
          key={letter.id}
          className="group relative flex flex-col justify-between border-border/80 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:bg-card hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
          onClick={() => router.push(`/ai-cover-letter/${letter.id}`)}
        >
          {/* Subtle top accent gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/70 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <CardHeader className="pb-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs gap-1.5 px-2.5 py-0.5 font-semibold bg-muted/40">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="truncate max-w-[140px]">{letter.companyName}</span>
              </Badge>
              <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 shrink-0">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(letter.createdAt), "MMM d, yyyy")}</span>
              </span>
            </div>

            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {letter.jobTitle}
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-4">
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {letter.jobDescription || "Customized AI cover letter matching candidate qualifications to company position."}
            </p>
          </CardContent>

          <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 bg-muted/20">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-primary hover:text-primary pl-2 font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/ai-cover-letter/${letter.id}`}>
                <Eye className="h-3.5 w-3.5" />
                <span>View & Edit</span>
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => e.stopPropagation()}
                  title="Delete cover letter"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your cover letter for{" "}
                    <strong>{letter.jobTitle}</strong> at <strong>{letter.companyName}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => handleDelete(e, letter.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}