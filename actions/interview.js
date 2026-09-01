"use server";

import { industries } from "@/app/data/industries";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // ✅ Fetch resume data
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { resume: true },
  });

  if (!user) throw new Error("User not found");

  const { resume } = user;

  // 📝 Prompt tuned to use resume context
  const prompt = `
You are an expert interviewer and professional trainer.

Your task is to generate **10 multiple-choice interview questions** personalized to this candidate’s resume and industry.

Resume Content:
"""
${resume || "No resume available"},
"""

✅ Intelligent Behavior Rules:
1. **Analyze the resume** to detect:
   - Primary domain or profession (e.g., Medicine, Engineering, Teaching, Marketing, etc.)
   - Technical and non-technical **skills** listed.
   - **Education background** (degree, specialization, academic focus).
   - **Experience** (roles, years, responsibilities, projects, achievements).

2. Generate interview questions that reflect these aspects:
   - Skill-based questions related to tools, technologies, or techniques mentioned.
   - Conceptual or theoretical questions based on their education.
   - Experience-based situational questions (“How would you handle...”, “In your previous role...”).
   - 1–2 questions testing general reasoning, ethics, or communication in that field.

3. If the resume lacks enough data, intelligently infer the likely field from what is given.
   If nothing can be inferred, ask general professional or problem-solving questions.

Each question must include:
  • Question text  
  • 4 options (A, B, C, D)  
  • Correct answer (the text itself, not just the letter)  
  • A short explanation (1–2 sentences)

✅ Output Format:
Return only valid JSON:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
`;




  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Q: "${q.question}"\nCorrect: "${q.answer}"\nUser: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide 1-2 very specific improvement tips.
      Keep them short, actionable, and encouraging.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
