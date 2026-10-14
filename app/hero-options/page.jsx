import { notFound } from "next/navigation";
import HeroBackgroundOptions from "@/components/hero-background-options";
import "./hero-options.css";

export const metadata = {
  title: "Hero background options | CareerWise",
  robots: { index: false, follow: false },
};

export default function HeroOptionsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <HeroBackgroundOptions />;
}
