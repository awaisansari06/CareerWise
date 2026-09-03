"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  getGeminiModel,
  safeGenerateContent,
  safeParseAiResponse,
  RoadmapResponseSchema,
  formatUntrustedData,
  PROMPT_SAFETY_DIRECTIVE,
} from "@/lib/gemini";

async function generateCareerRoadmap(resumeJson) {
  const model = getGeminiModel();

  let resumeData = resumeJson;
  if (typeof resumeJson === "string") {
    try {
      resumeData = JSON.parse(resumeJson);
    } catch {
      resumeData = resumeJson;
    }
  }

  const prompt = `
You are an expert career mentor and curriculum designer.

${PROMPT_SAFETY_DIRECTIVE}

Analyze the following resume reference data and infer the most likely career field/industry 
(e.g., Software Development, Medicine, Civil Engineering, Teaching, Law, Business, etc.).

UNTRUSTED RESUME REFERENCE DATA:
${formatUntrustedData("resume_data", resumeData)}

Now generate a career learning and growth roadmap SPECIFICALLY for this field.

Guidelines:
- First, identify the industry from the resume (doctor, teacher, civil engineer, web developer, etc.).
- Then create a roadmap with 20–25 nodes that reflect realistic skills, milestones, or knowledge progression in that industry.
- The roadmap must follow a progression: Fundamentals → Core → Advanced → Specialization.
- Nodes format:
  {id, type:"turbo", data:{title, description, link, level}}
- Edges format:
  {id, source, target, type:"smoothstep"}

Output ONLY valid JSON with the following structure:
{
  "industry": "Inferred industry from resume",
  "roadmapTitle": "Custom roadmap title",
  "description": "Brief description of roadmap",
  "duration": "Suggested time frame",
  "initialNodes": [...],
  "initialEdges": [...]
}
`;

  try {
    const result = await safeGenerateContent(model, prompt);
    const text = result.response.text();
    return safeParseAiResponse(text, RoadmapResponseSchema);
  } catch (err) {
    console.error("[Roadmap Generation Error]:", err.message);
    throw new Error(err.message || "Failed to generate valid roadmap structure");
  }
}

export async function saveRoadMap({ forceRegenerate = false } = {}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId },
    include: { resume: true },
  });
  if (!user || !user.resume) throw new Error("User or resume not found");

  if (!forceRegenerate) {
    const existing = await db.roadmap.findUnique({
      where: { userId: user.id },
    });
    if (existing) return existing;
  }

  const roadmap = await generateCareerRoadmap(user.resume.content);
  if (!roadmap) throw new Error("AI did not return valid roadmap JSON");

  const safeRoadmap = {
    roadmapTitle: roadmap.roadmapTitle || "Untitled Roadmap",
    description: roadmap.description || "No description provided.",
    duration: roadmap.duration || "Flexible",
    industry: roadmap.industry || "General",
    initialNodes: Array.isArray(roadmap.initialNodes)
      ? roadmap.initialNodes.map((n, i) => ({
        id: n.id?.toString() || `node-${i}`,
        type: "default",
        data: {
          label: n.data?.title || n.data?.label || `Node ${i + 1}`,
          description: n.data?.description || "",
          link: n.data?.link || null,
          level: n.data?.level || "Fundamentals",
        },
        position: n.position || { x: i * 250, y: 100 },
      }))
      : [],
    initialEdges: Array.isArray(roadmap.initialEdges)
      ? roadmap.initialEdges.map((e, i) => ({
        id: e.id?.toString() || `edge-${i}`,
        source: e.source?.toString(),
        target: e.target?.toString(),
        type: e.type || "smoothstep",
        animated: e.animated ?? false,
      }))
      : [],
  };

  return db.roadmap.upsert({
    where: { userId: user.id },
    update: safeRoadmap,
    create: {
      userId: user.id,
      ...safeRoadmap,
    },
  });
}
