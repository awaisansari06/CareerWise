"use server";

import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import {
  getGeminiModel,
  safeGenerateContent,
  safeParseAiResponse,
  ResumeParserResponseSchema,
  generateAIInsights,
  classifyCareerIndustry,
} from "@/lib/gemini";
import { validateResumeFile } from "@/lib/resume-validator";
import { hasValidInrSalaryData } from "@/lib/salary-utils";

export async function uploadResume(formData) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) throw new Error("User not found");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission");
    }

    const file = formData.get("resume");

    // 2. Validate file (size, extension, MIME, magic bytes) BEFORE memory allocation or Gemini
    const { filename } = await validateResumeFile(file);

    // 3. Buffer validated file bytes for AI synthesis
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const model = getGeminiModel();

    // 4. Invoke Gemini with verified PDF payload
    const result = await safeGenerateContent(model, {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: buffer.toString("base64"),
              },
            },
            {
              text: `You are a professional resume parser and career analyst.
1. If not a resume → return {"error":"Not a resume"}.
2. Extract the candidate's resume information and CLASSIFY their primary career industry/field based on their skills, experience, and education.
You MUST provide the "industry" field in the output JSON (e.g., "Software Development", "Office Administration", "Business Administration", "Healthcare", "Finance & Accounting", "Marketing", "Education", etc.).
JSON format:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "education": ["string"],
  "experience": ["string"],
  "skills": ["string"],
  "projects": ["string"],
  "languages": ["string"],
  "hobbies": ["string"],
  "industry": "string"
}
Return only valid JSON.`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    const text = result.response.text();
    const extractedData = safeParseAiResponse(text, ResumeParserResponseSchema);

    if (extractedData.error) {
      throw new Error("The uploaded file does not look like a professional resume");
    }

    // 5. Ensure industry is classified; infer from structured profile if not present
    let targetIndustry = extractedData.industry?.trim();
    if (!targetIndustry) {
      targetIndustry = await classifyCareerIndustry(extractedData);
      extractedData.industry = targetIndustry;
    }

    const fileUrl = "uploaded-file-url-here";

    // 6. Update/upsert resume and clean up stale analysis for data consistency
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: {
        filename,
        fileUrl,
        content: JSON.stringify(extractedData, null, 2),
      },
      create: {
        id: uuidv4(),
        filename,
        fileUrl,
        content: JSON.stringify(extractedData, null, 2),
        user: { connect: { id: user.id } },
      },
    });

    // Invalidate old resume analysis so fresh analysis is generated for the new resume
    await db.resumeAnalysis.deleteMany({
      where: { userId: user.id },
    });

    // 7. Re-evaluate career industry if the new resume indicates a meaningful career direction
    function isSameIndustryDomain(a, b) {
      if (!a || !b) return false;
      const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanB = b.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanA === cleanB) return true;

      const domains = [
        { name: "tech", keys: ["software", "programming", "web development", "computer science", "data science", "devops", "cloud", "it & software", "cybersecurity", "frontend", "backend", "full stack"] },
        { name: "business", keys: ["business administration", "management", "operations", "consulting", "strategy", "project management"] },
        { name: "office", keys: ["office administration", "administrative", "clerical", "secretarial", "office management", "data entry"] },
        { name: "finance", keys: ["finance", "accounting", "banking", "audit", "investment", "tax"] },
        { name: "health", keys: ["healthcare", "nursing", "medicine", "medical", "clinical", "pharmacy"] },
        { name: "marketing", keys: ["marketing", "seo", "content strategy", "advertising", "public relations", "branding", "social media"] },
        { name: "education", keys: ["education", "teaching", "academic", "instruction", "pedagogy"] },
        { name: "legal", keys: ["legal", "law", "attorney", "paralegal", "compliance"] },
        { name: "sales", keys: ["sales", "account executive", "business development"] },
      ];

      const lowerA = a.toLowerCase();
      const lowerB = b.toLowerCase();

      const domainA = domains.find((d) => d.keys.some((k) => lowerA.includes(k)))?.name;
      const domainB = domains.find((d) => d.keys.some((k) => lowerB.includes(k)))?.name;

      if (domainA && domainB) {
        return domainA === domainB;
      }

      return cleanA.includes(cleanB) || cleanB.includes(cleanA);
    }

    if (targetIndustry && (!user.industry || !isSameIndustryDomain(user.industry, targetIndustry))) {
      // Meaningful career direction change: Resolve or generate IndustryInsight for the new industry
      let existingInsight = await db.industryInsight.findUnique({
        where: { industry: targetIndustry },
      });

      let insightToConnect = existingInsight && hasValidInrSalaryData(existingInsight) ? existingInsight : null;

      if (!insightToConnect) {
        try {
          const newInsights = await generateAIInsights(targetIndustry);
          insightToConnect = await db.industryInsight.upsert({
            where: { industry: targetIndustry },
            update: {
              ...newInsights,
              industry: targetIndustry,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              lastUpdated: new Date(),
            },
            create: {
              industry: targetIndustry,
              ...newInsights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              lastUpdated: new Date(),
            },
          });
        } catch (e) {
          console.error("[Industry Insight on Resume Replacement Error]:", e.message);
        }
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          industry: targetIndustry,
          isUploaded: true,
        },
      });
    } else {
      await db.user.update({
        where: { id: user.id },
        data: { isUploaded: true },
      });
    }

    // Revalidate affected cache paths so Dashboard and Resume analysis reflect the update
    revalidatePath("/resume");
    revalidatePath("/dashboard");

    return {
      success: true,
      resume: {
        id: resume.id,
        filename: resume.filename,
        skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
        updatedAt: resume.updatedAt,
      },
    };
  } catch (error) {
    console.error("[Resume Upload Error]:", error.message);
    return { success: false, error: error.message || "Upload failed" };
  }
}

/**
 * Returns metadata and extracted personal skills for the authenticated user's current active resume.
 */
export async function getResume() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  const resume = await db.resume.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      filename: true,
      content: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  if (!resume) return null;

  let skills = [];
  try {
    const parsed = typeof resume.content === "string" ? JSON.parse(resume.content) : resume.content;
    if (Array.isArray(parsed?.skills)) {
      skills = parsed.skills;
    }
  } catch (e) {
    skills = [];
  }

  return {
    id: resume.id,
    filename: resume.filename,
    skills,
    updatedAt: resume.updatedAt,
    createdAt: resume.createdAt,
  };
}
