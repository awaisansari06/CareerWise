"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { queueForCurrentUser } from "@/lib/jobs/queue";
export async function generateQuiz(input={}){return queueForCurrentUser("INTERVIEW_QUIZ",input);}

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

  if(quizId && (typeof quizId!=="string" || quizId.length>120))throw new Error("Invalid practice session.");
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

  if (!draft && !quizId) {
    // Fallback to active draft for this user if quizId was omitted
    draft = await db.assessment.findFirst({
      where: {
        userId: user.id,
        category: "draft",
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!draft && quizId) {const completed=await db.assessment.findFirst({where:{id:quizId,userId:user.id,category:{not:"draft"}}});if(completed && Array.isArray(answers) && completed.questions.length===answers.length && completed.questions.every((q,i)=>q.userAnswer===answers[i]))return completed;}
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
    if(!isValidOption) throw new Error("Choose one of the listed options for every question.");
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

  const missed=questionResults.find(q=>!q.isCorrect);
  const improvementTip=missed ? "Review the explanation for your first missed question, then explain the answer in your own words before trying another set." : "Try a new set to practice different situations.";

  try {
    // Transition draft to completed assessment with server-verified score
    const completedAssessment = await db.$transaction(async (tx) => {
      const transition = await tx.assessment.updateMany({
        where: { id: draft.id, userId: user.id, category: "draft" },
        data: {
          quizScore: serverCalculatedScore,
          questions: questionResults,
          category: "Technical",
          improvementTip,
          selectedAnswers: answers,
        },
      });
      if (transition.count !== 1) throw new Error("This quiz has already been submitted.");
      return tx.assessment.findUnique({ where: { id: draft.id } });
    });
    revalidatePath("/interview");
    revalidatePath("/dashboard");
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
