import { getCoverLetter } from "@/actions/cover-letter";
import { notFound } from "next/navigation";
import { privatePageRobots } from "@/lib/site-config";
import LetterStudio from "../_components/letter-studio";
export const metadata = { title: "Your Cover Letter", robots: privatePageRobots };
export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;
  const letter = await getCoverLetter(id);
  if (!letter) notFound();
  return <LetterStudio key={letter.id} letter={letter}/>;
}
