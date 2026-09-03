import { UserPlus, FileEdit, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Build Your Profile",
    description: "Upload your resume and tell CareerWise where you want your career to go.",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Find Your Gaps",
    description: "See which skills, resume signals, and areas of preparation need attention.",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "Practice With Context",
    description: "Train for interviews and career conversations using questions aligned with your background.",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Plan Your Next Move",
    description: "Turn your insights into a practical roadmap for building skills and targeting better opportunities.",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];
