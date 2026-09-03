"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  getGeminiModel,
  safeGenerateContent,
  safeParseAiResponse,
  QuizResponseSchema,
  formatUntrustedData,
  PROMPT_SAFETY_DIRECTIVE,
} from "@/lib/gemini";

/**
 * Generates an interview quiz personalized to candidate's resume.
 * Security: NEVER returns `correctAnswer`, `answer`, or `explanation` to client.
 * The authoritative answer key is preserved exclusively on the server in a draft Assessment.
 */
export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, resume: true },
  });

  if (!user) throw new Error("User not found");

  const resumeContent = user.resume?.content || "No resume available";
  const model = getGeminiModel();

  const prompt = `
You are an expert interviewer and professional curriculum assessor.

${PROMPT_SAFETY_DIRECTIVE}

Your task is to generate **10 multiple-choice interview questions** personalized to this candidate’s resume and industry.

UNTRUSTED RESUME REFERENCE DATA:
${formatUntrustedData("resume_data", resumeContent)}

Intelligent Behavior Rules:
1. Analyze the resume to detect:
   - Primary domain or profession (e.g., Software Engineering, Medicine, Teaching, Marketing, Finance, etc.)
   - Technical and non-technical skills listed.
   - Education background (degree, specialization, academic focus).
   - Experience (roles, years, responsibilities, projects, achievements).

2. Generate interview questions reflecting these aspects:
   - Skill-based questions related to tools, technologies, or techniques mentioned.
   - Conceptual or theoretical questions based on their education.
   - Experience-based situational questions (“How would you handle...”, “In your previous role...”).
   - 1–2 questions testing general reasoning, ethics, or communication in that field.

3. If the resume lacks enough data, infer the likely field from what is given.
   If nothing can be inferred, ask general professional or problem-solving questions.

Each question must include:
  • Question text  
  • 4 options (A, B, C, D)  
  • Correct answer (the exact text matching one of the options)  
  • A short explanation (1–2 sentences)

Output Format:
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
    const result = await safeGenerateContent(model, prompt);
    const text = result.response.text();

    // Validate structured output with Zod schema
    const quiz = safeParseAiResponse(text, QuizResponseSchema);

    // Clean up any existing uncompleted draft sessions for this user
    await db.assessment.deleteMany({
      where: {
        userId: user.id,
        category: "draft",
      },
    });

    // Store the authoritative answer key on the server in a draft Assessment record
    const draft = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: 0,
        category: "draft",
        questions: quiz.questions.map((q, idx) => ({
          id: idx + 1,
          question: q.question,
          options: q.options,
          answer: q.correctAnswer, // Stored server-side only
          explanation: q.explanation || "", // Stored server-side only
        })),
      },
    });

    // Return sanitized payload to client: NO correctAnswer and NO explanation
    return {
      quizId: draft.id,
      questions: quiz.questions.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
      })),
    };
  } catch (error) {
    console.error("[Quiz Generation Error]:", error.message);
    throw new Error(error.message || "Failed to generate quiz questions");
  }
}

/**
 * Evaluates candidate answers and records assessment results.
 * Security: Server is the sole authority for scoring. Client-submitted scores are ignored.
 * Validates session ownership, question count, and option legality.
 */
export async function saveQuizResult(quizDataOrPayload, answersArg, _clientScore) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // Extract quizId and answers from payload
  let quizId = null;
  let answers = answersArg;

  if (quizDataOrPayload && typeof quizDataOrPayload === "object") {
    if (quizDataOrPayload.quizId) {
      quizId = quizDataOrPayload.quizId;
    } else if (quizDataOrPayload.id) {
      quizId = quizDataOrPayload.id;
    }
    if (quizDataOrPayload.answers && !answersArg) {
      answers = quizDataOrPayload.answers;
    }
  } else if (typeof quizDataOrPayload === "string") {
    quizId = quizDataOrPayload;
  }

  // Authoritative check: locate draft assessment owned by the authenticated user
  let draft = null;
  if (quizId) {
    draft = await db.assessment.findFirst({
      where: {
        id: quizId,
        userId: user.id,
        category: "draft",
      },
    });
  }

  if (!draft) {
    // Fallback to active draft for this user if quizId was omitted
    draft = await db.assessment.findFirst({
      where: {
        userId: user.id,
        category: "draft",
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!draft) {
    throw new Error("No active quiz session found. Please start a new interview.");
  }

  const authoritativeQuestions = Array.isArray(draft.questions) ? draft.questions : [];
  if (authoritativeQuestions.length === 0) {
    throw new Error("Invalid quiz data: no questions found for this session.");
  }

  if (!Array.isArray(answers)) {
    throw new Error("Invalid submission: answers must be an array.");
  }

  if (answers.length !== authoritativeQuestions.length) {
    throw new Error(
      `Invalid submission: expected ${authoritativeQuestions.length} answers, received ${answers.length}.`
    );
  }

  // Server evaluates every answer against authoritative server key
  let correctCount = 0;
  const questionResults = authoritativeQuestions.map((q, index) => {
    const userAnswer = answers[index];
    const isValidOption = Array.isArray(q.options) && q.options.includes(userAnswer);
    const isCorrect = Boolean(
      isValidOption &&
      typeof userAnswer === "string" &&
      typeof q.answer === "string" &&
      userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()
    );

    if (isCorrect) {
      correctCount++;
    }

    return {
      question: q.question,
      answer: q.answer,
      userAnswer: userAnswer || "No answer provided",
      isCorrect,
      explanation: q.explanation || "",
    };
  });

  // Calculate score on the server: 0.0 to 100.0 (client-supplied score is completely ignored)
  const serverCalculatedScore = Number(
    ((correctCount / authoritativeQuestions.length) * 100).toFixed(1)
  );

  // Generate improvement tips for incorrect answers via Gemini
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .slice(0, 5)
      .map(
        (q) =>
          `Q: "${q.question}"\nCorrect: "${q.answer}"\nUser: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The candidate got the following questions wrong in an interview assessment:

      ${wrongQuestionsText}

      Based on these mistakes, provide 1-2 concise, actionable improvement tips.
      Keep them short, professional, and encouraging.
    `;

    try {
      const model = getGeminiModel();
      const tipResult = await safeGenerateContent(model, improvementPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (error) {
      console.error("[Improvement Tip Generation Error]:", error.message);
    }
  }

  try {
    // Transition draft to completed assessment with server-verified score
    const completedAssessment = await db.assessment.update({
      where: { id: draft.id },
      data: {
        quizScore: serverCalculatedScore,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return completedAssessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

/**
 * Returns completed assessments for the authenticated user.
 * Filters out in-progress draft sessions.
 */
export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
        category: { not: "draft" },
      },
      orderBy: { createdAt: "asc" },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
