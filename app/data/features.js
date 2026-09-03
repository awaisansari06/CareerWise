import { BrainCircuit, Briefcase, LineChart, ScrollText } from "lucide-react";

export const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 mb-4 text-primary" />,
    title: "Career Direction",
    description:
      "Understand where your current skills can take you and discover realistic paths worth pursuing.",
  },
  {
    icon: <Briefcase className="w-10 h-10 mb-4 text-primary" />,
    title: "Interview Lab",
    description:
      "Practice with role-focused questions, sharpen your answers, and learn where your interview performance needs work.",
  },
  {
    icon: <LineChart className="w-10 h-10 mb-4 text-primary" />,
    title: "Market Intelligence",
    description:
      "Explore hiring trends, in-demand skills, and salary benchmarks to make better career decisions.",
  },
  {
    icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
    title: "Resume Intelligence",
    description:
      "Go beyond a basic resume score with actionable feedback on skills, structure, and job-readiness.",
  },
];
