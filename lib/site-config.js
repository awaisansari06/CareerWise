/**
 * Centralized Site and SEO Configuration for CareerWise
 * Single source of truth for branding, metadata, canonical URLs, and schemas.
 */

export const siteConfig = {
  name: "CareerWise",
  title: "CareerWise — AI-Powered Career Guidance & Career Tools",
  description:
    "CareerWise is an AI-powered career platform that helps you analyze your resume, discover skill gaps, prepare for interviews, create tailored cover letters, and build a personalized career roadmap.",
  tagline: "Your Career. Smarter.",
  descriptor: "AI-Powered Career Intelligence Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://careerwise.dev",
  ogImage: "/banner.png",
  keywords: [
    "CareerWise",
    "CareerWise career platform",
    "CareerWise career guidance",
    "AI career guidance",
    "AI career platform",
    "career development platform",
    "personalized career guidance",
    "career planning platform",
    "career growth tools",
    "AI resume analyzer",
    "resume analysis",
    "resume improvement",
    "resume score",
    "ATS resume checker",
    "ATS resume analysis",
    "resume skill analysis",
    "resume feedback",
    "improve resume",
    "career roadmap",
    "personalized career roadmap",
    "career path planning",
    "skill gap analysis",
    "AI interview preparation",
    "mock interview",
    "AI cover letter generator",
  ],
  author: "CareerWise",
  creator: "CareerWise",
  publisher: "CareerWise",
  links: {
    twitter: "https://twitter.com/careerwise",
    github: "https://github.com/careerwise",
  },
};

/**
 * Standard Robots directive for private authenticated application pages
 */
export const privatePageRobots = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
    "max-video-preview": -1,
    "max-image-preview": "none",
    "max-snippet": -1,
  },
};
