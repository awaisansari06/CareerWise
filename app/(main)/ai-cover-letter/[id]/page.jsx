import dynamic from "next/dynamic";
import { getCoverLetter } from "@/actions/cover-letter";
import { notFound } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";

export const metadata = {
  title: "Cover Letter Document",
  description: "View and edit your tailored cover letter document.",
  robots: privatePageRobots,
};

const CoverLetterPreview = dynamic(
  () => import("../_components/cover-letter-preview"),
  {
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  }
);

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  if (!coverLetter) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl py-6 px-4">
      <CoverLetterPreview letter={coverLetter} />
    </div>
  );
}