"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  getGeminiModel,
  safeGenerateContent,
  formatUntrustedData,
  PROMPT_SAFETY_DIRECTIVE,
  CoverLetterInputSchema,
} from "@/lib/gemini";

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Step 1: Strict input validation before any processing or AI calls
  const validation = CoverLetterInputSchema.safeParse(data);
  if (!validation.success) {
    const issue = validation.error.issues[0]?.message || "Invalid cover letter input";
    throw new Error(issue);
  }

  const { jobTitle, companyName, jobDescription } = validation.data;

  // Step 2: Ensure authenticated user and resume exist
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.resume) throw new Error("Resume not uploaded");

  let resume = {};
  try {
    resume = typeof user.resume.content === "string" ? JSON.parse(user.resume.content) : user.resume.content;
  } catch {
    resume = {};
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const candidateInfo = {
    name: resume.name || "",
    email: resume.email || "",
    phone: resume.phone || "",
    education: resume.education || [],
    experience: resume.experience || [],
    skills: resume.skills || [],
    projects: resume.projects || [],
    languages: resume.languages || [],
  };

  const model = getGeminiModel();

  const prompt = `
You are a professional executive career coach.

${PROMPT_SAFETY_DIRECTIVE}

Write a professional cover letter for the specified target role and company based on the candidate's background.

TARGET ROLE & COMPANY:
${formatUntrustedData("target_job_title", jobTitle)}
${formatUntrustedData("target_company_name", companyName)}

TARGET JOB DESCRIPTION:
${formatUntrustedData("job_description", jobDescription)}

CANDIDATE PROFILE DATA:
${formatUntrustedData("candidate_resume", candidateInfo)}

Date:
${currentDate}

Requirements:
1. Use a professional, enthusiastic tone
2. Highlight relevant skills and experience
3. Show understanding of the company's needs
4. Keep it concise (max 400 words)
5. Use proper business letter formatting in markdown with the exact date "${currentDate}" placed below the candidate header
6. Include specific examples of achievements or projects
7. Relate candidate's background to job requirements

Format the letter in markdown. The date of the letter must be "${currentDate}". Do not insert placeholder text like [Your Name] or [Your Address].
`;

  try {
    const result = await safeGenerateContent(model, prompt);
    const content = result.response.text().trim();

    if (!content) {
      throw new Error("AI returned empty cover letter");
    }

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription,
        companyName,
        jobTitle,
        status: "completed",
        userId: user.id, // Ownership strictly bound to authenticated user
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("[Cover Letter Generation Error]:", error.message);
    throw new Error(error.message || "Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      jobTitle: true,
      companyName: true,
      jobDescription: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // Enforce strict ownership and select all fields required by CoverLetterPreview
  return await db.coverLetter.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      content: true,
      jobTitle: true,
      companyName: true,
      jobDescription: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // Enforce strict ownership check prior to deletion
  const existing = await db.coverLetter.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Cover letter not found or unauthorized");
  }

  return await db.coverLetter.delete({
    where: {
      id: existing.id,
    },
  });
}