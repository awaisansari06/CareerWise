/** Choose a useful action from persisted activity, without inventing readiness scores. */
export function getDashboardNextStep({ hasResume, hasAnalysis, assessmentCount = 0, hasRoadmap }) {
  if (!hasResume) return { title: "Start with your experience.", description: "Upload your resume to bring your skills, background, and career possibilities into focus.", label: "Upload my resume", href: null };
  if (!hasAnalysis) return { title: "Make your experience stand out.", description: "Your resume is ready. Find specific ways to strengthen your story with a personalized review.", label: "Review my resume", href: "/resume" };
  if (!assessmentCount) return { title: "Put your story into practice.", description: "Prepare for your next opportunity with questions grounded in your professional background.", label: "Start interview practice", href: "/interview" };
  if (!hasRoadmap) return { title: "Give your next move a direction.", description: "Connect your experience and goals with a practical roadmap for what to learn and do next.", label: "Build my roadmap", href: "/roadmap" };
  return { title: "Keep your momentum going.", description: "Build on what you’ve learned. Practice again, review your feedback, and take your next step with confidence.", label: "Continue practicing", href: "/interview" };
}

export function getSkillComparison(skills = [], recommended = []) {
  const normalize = (value) => String(value).trim().toLowerCase();
  const existing = new Set(skills.map(normalize));
  return [...new Set(recommended.filter((skill) => typeof skill === "string" && skill.trim()))].filter((skill) => !existing.has(normalize(skill)));
}
