import { z } from "zod";
export const careerGoals = [
  { id: "grow", title: "Grow in my field", description: "Build the skills for my next step." },
  { id: "change", title: "Change direction", description: "Explore a different career path." },
  { id: "first", title: "Find my first role", description: "Turn my learning into opportunity." },
  { id: "explore", title: "Explore my options", description: "Understand where my skills can take me." },
];
export const careerGoalSchema = z.enum(["grow", "change", "first", "explore"]);
export const careerProfileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(150),
  industry: z.string().trim().min(2, "Enter a career field.").max(120),
  skills: z.string().trim().min(2, "Add at least one skill.").max(2000),
  background: z.string().trim().min(20, "Describe your experience, studies, or projects in at least 20 characters.").max(10000),
  careerGoal: careerGoalSchema,
});
export function profileToResume(profile, email = "") {
  const data = careerProfileSchema.parse(profile);
  return { name: data.name, email, industry: data.industry, skills: data.skills.split(/[,\n]/).map(s => s.trim()).filter(Boolean), experience: [data.background], education: [], projects: [], languages: [], careerGoal: data.careerGoal };
}
