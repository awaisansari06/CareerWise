"use server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { validateResumeFile } from "@/lib/resume-validator";
import { parseResumeDocument } from "@/lib/resume-review";
import { careerGoalSchema, careerProfileSchema, profileToResume } from "@/lib/career-profile";
import { currentCareerUser, enqueueCareerJob } from "@/lib/jobs/queue";
export async function uploadResume(formData){
 const user=await currentCareerUser();
 if(!formData || typeof formData.get!=="function")throw new Error("Invalid upload.");
 const file=formData.get("resume"); const {filename}=await validateResumeFile(file);
 const goal=formData.get("careerGoal")||"explore";
 if(!careerGoalSchema.safeParse(goal).success)throw new Error("Choose a valid career goal.");
 return enqueueCareerJob(user,"RESUME_PARSE",{filename,careerGoal:goal,pdf:Buffer.from(await file.arrayBuffer()).toString("base64")});
}
/**
 * Returns metadata and extracted personal skills for the authenticated user's current active resume.
 */
export async function getResume() {
  const user = await currentCareerUser();
  const resume = user.resume;

  if (!resume) return null;

  let skills = [];
  try {
    const parsed = typeof resume.content === "string" ? JSON.parse(resume.content) : resume.content;
    if (Array.isArray(parsed?.skills)) {
      skills = parsed.skills.map((s) =>
        typeof s === "string" ? s : s?.name || s?.skill || s?.title || String(s)
      );
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

/** A private reconstructed document for the signed-in user's review workspace. */
export async function getResumeDocument() {
  const user = await currentCareerUser();
  if (!user.resume) return null;
  const { id,filename,updatedAt,content } = user.resume;
  const metadata={id,filename,updatedAt};
  return { ...metadata, document: parseResumeDocument(content) };
}

export async function createCareerProfile(input) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const result = careerProfileSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");
  const content = JSON.stringify(profileToResume(result.data, user.email), null, 2);
  await db.$transaction(async tx => {
    await tx.resume.upsert({ where: { userId: user.id }, update: { filename: "Career profile", content, fileUrl: null }, create: { id: uuidv4(), userId: user.id, filename: "Career profile", content, fileUrl: null } });
    await tx.resumeAnalysis.deleteMany({ where: { userId: user.id } });
    await tx.resumeWorkspace.deleteMany({ where: { userId: user.id } });
    await tx.user.update({ where: { id: user.id }, data: { isUploaded: true, industry: null } });
  }, { isolationLevel: "Serializable" });
  for (const path of ["/dashboard", "/resume", "/interview", "/roadmap", "/career-paths"]) revalidatePath(path);
  return { success: true };
}
