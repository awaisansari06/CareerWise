import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * Pure simulation of the server-authoritative quiz evaluation and answer protection logic
 * implemented in actions/interview.js.
 */
function sanitizeQuizPayload(draftRecord) {
  // Returns client payload matching generateQuiz() output
  return {
    quizId: draftRecord.id,
    questions: draftRecord.questions.map((q, idx) => ({
      id: idx + 1,
      question: q.question,
      options: q.options,
    })),
  };
}

function evaluateAndScoreSubmission({
  authenticatedUserId,
  draftAssessment,
  submissionPayload,
  answersArg,
  clientScore,
}) {
  if (!authenticatedUserId) {
    throw new Error("Unauthorized");
  }

  // Extract quizId and answers from payload
  let quizId = null;
  let answers = answersArg;

  if (submissionPayload && typeof submissionPayload === "object") {
    if (submissionPayload.quizId) {
      quizId = submissionPayload.quizId;
    } else if (submissionPayload.id) {
      quizId = submissionPayload.id;
    }
    if (submissionPayload.answers && !answersArg) {
      answers = submissionPayload.answers;
    }
  } else if (typeof submissionPayload === "string") {
    quizId = submissionPayload;
  }

  // Verify ownership: draft must belong to the authenticated user and be active ("draft")
  if (!draftAssessment || draftAssessment.id !== quizId || draftAssessment.userId !== authenticatedUserId || draftAssessment.category !== "draft") {
    throw new Error("No active quiz session found. Please start a new interview.");
  }

  const authoritativeQuestions = Array.isArray(draftAssessment.questions) ? draftAssessment.questions : [];
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

  // Calculate score exclusively on the server (clientScore is completely ignored)
  const serverCalculatedScore = Number(
    ((correctCount / authoritativeQuestions.length) * 100).toFixed(1)
  );

  return {
    id: draftAssessment.id,
    userId: authenticatedUserId,
    quizScore: serverCalculatedScore,
    questions: questionResults,
    category: "Technical",
    improvementTip: correctCount < authoritativeQuestions.length ? "Review the specific topics missed." : null,
  };
}

describe("Interview Security & Quiz Integrity Test Suite", () => {
  const sampleAuthoritativeQuestions = [
    {
      id: 1,
      question: "What is the primary function of an index in PostgreSQL?",
      options: [
        "To encrypt table data at rest",
        "To accelerate query lookups and search performance",
        "To enforce foreign key constraints exclusively",
        "To store transaction logs",
      ],
      answer: "To accelerate query lookups and search performance",
      explanation: "Indexes speed up data retrieval operations on a database table at the cost of additional writes.",
    },
    {
      id: 2,
      question: "What does the 'S' in SOLID object-oriented design stand for?",
      options: [
        "Single Responsibility Principle",
        "Structured Object Language",
        "System Output Limit",
        "Secure Open Architecture",
      ],
      answer: "Single Responsibility Principle",
      explanation: "A class should have only one reason to change, meaning it should have only one job.",
    },
    {
      id: 3,
      question: "Which HTTP status code corresponds to 'Unauthorized'?",
      options: ["400", "401", "403", "404"],
      answer: "401",
      explanation: "HTTP 401 Unauthorized indicates that the client request has not been completed because it lacks valid authentication credentials.",
    },
    {
      id: 4,
      question: "What is a major advantage of React Server Components?",
      options: [
        "They execute on the client browser and increase bundle size",
        "They reduce client bundle size by running exclusively on the server",
        "They require useEffect for initial data fetching",
        "They replace database drivers",
      ],
      answer: "They reduce client bundle size by running exclusively on the server",
      explanation: "RSCs run only on the server, resulting in zero client bundle overhead for server dependencies.",
    },
    {
      id: 5,
      question: "What is the default isolation level in PostgreSQL?",
      options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
      answer: "Read Committed",
      explanation: "PostgreSQL defaults to Read Committed transaction isolation.",
    },
  ];

  const mockDraft = {
    id: "draft-assessment-123",
    userId: "user-alice",
    quizScore: 0,
    category: "draft",
    questions: sampleAuthoritativeQuestions,
  };

  // Test 11: Initial generateQuiz() response does NOT contain correctAnswer
  test("11. Initial generateQuiz() response does NOT contain correctAnswer", () => {
    const clientPayload = sanitizeQuizPayload(mockDraft);
    for (const q of clientPayload.questions) {
      assert.strictEqual("correctAnswer" in q, false, "correctAnswer must not exist in client question");
      assert.strictEqual("answer" in q, false, "answer must not exist in client question");
    }
  });

  // Test 12: Initial generateQuiz() response does NOT contain explanation
  test("12. Initial generateQuiz() response does NOT contain explanation", () => {
    const clientPayload = sanitizeQuizPayload(mockDraft);
    for (const q of clientPayload.questions) {
      assert.strictEqual("explanation" in q, false, "explanation must not exist in client question");
    }
  });

  // Test 13: Correct answers remain available to the server after generation
  test("13. Correct answers remain available to the server in draft record", () => {
    assert.strictEqual(mockDraft.questions.length, 5);
    assert.strictEqual(mockDraft.questions[0].answer, "To accelerate query lookups and search performance");
    assert.ok(mockDraft.questions[0].explanation.length > 0);
  });

  // Test 1: Normal quiz submission
  test("1. Normal quiz submission evaluates properly", () => {
    const answers = [
      "To accelerate query lookups and search performance",
      "Single Responsibility Principle",
      "401",
      "They reduce client bundle size by running exclusively on the server",
      "Read Committed",
    ];

    const result = evaluateAndScoreSubmission({
      authenticatedUserId: "user-alice",
      draftAssessment: mockDraft,
      submissionPayload: { quizId: "draft-assessment-123", answers },
    });

    assert.strictEqual(result.id, "draft-assessment-123");
    assert.strictEqual(result.category, "Technical");
    assert.strictEqual(result.quizScore, 100);
    assert.strictEqual(result.questions.length, 5);
  });

  // Test 2: All answers correct
  test("2. All answers correct produces 100% score", () => {
    const answers = [
      "To accelerate query lookups and search performance",
      "Single Responsibility Principle",
      "401",
      "They reduce client bundle size by running exclusively on the server",
      "Read Committed",
    ];

    const result = evaluateAndScoreSubmission({
      authenticatedUserId: "user-alice",
      draftAssessment: mockDraft,
      submissionPayload: { quizId: "draft-assessment-123", answers },
    });

    assert.strictEqual(result.quizScore, 100);
    assert.strictEqual(result.questions.filter((q) => q.isCorrect).length, 5);
  });

  // Test 3: All answers incorrect
  test("3. All answers incorrect produces 0% score", () => {
    const answers = [
      "To encrypt table data at rest",
      "Structured Object Language",
      "404",
      "They replace database drivers",
      "Serializable",
    ];

    const result = evaluateAndScoreSubmission({
      authenticatedUserId: "user-alice",
      draftAssessment: mockDraft,
      submissionPayload: { quizId: "draft-assessment-123", answers },
    });

    assert.strictEqual(result.quizScore, 0);
    assert.strictEqual(result.questions.filter((q) => q.isCorrect).length, 0);
  });

  // Test 4: Mixed answers
  test("4. Mixed answers produces exact proportional score (3/5 = 60%)", () => {
    const answers = [
      "To accelerate query lookups and search performance", // Correct
      "Single Responsibility Principle",                   // Correct
      "401",                                               // Correct
      "They replace database drivers",                     // Incorrect
      "Serializable",                                      // Incorrect
    ];

    const result = evaluateAndScoreSubmission({
      authenticatedUserId: "user-alice",
      draftAssessment: mockDraft,
      submissionPayload: { quizId: "draft-assessment-123", answers },
    });

    assert.strictEqual(result.quizScore, 60);
    assert.strictEqual(result.questions.filter((q) => q.isCorrect).length, 3);
  });

  // Test 5: Client sends score = 100 but actual score is lower
  test("5. Client sends score = 100 but actual score is 20% -> stored score MUST be 20%", () => {
    const answers = [
      "To accelerate query lookups and search performance", // Correct
      "Structured Object Language",                        // Incorrect
      "404",                                               // Incorrect
      "They replace database drivers",                     // Incorrect
      "Serializable",                                      // Incorrect
    ];

    const result = evaluateAndScoreSubmission({
      authenticatedUserId: "user-alice",
      draftAssessment: mockDraft,
      submissionPayload: { quizId: "draft-assessment-123", answers },
      clientScore: 100, // Malicious forged score
    });

    assert.strictEqual(result.quizScore, 20, "Server must ignore client score of 100 and record 20");
  });

  // Test 6: Client sends score = 0 but actual score is higher
  test("6. Client sends score = 0 but actual score is 80% -> stored score MUST be 80%", () => {
    const answers = [
      "To accelerate query lookups and search performance", // Correct
      "Single Responsibility Principle",                   // Correct
      "401",                                               // Correct
      "They reduce client bundle size by running exclusively on the server", // Correct
      "Serializable",                                      // Incorrect
    ];

    const result = evaluateAndScoreSubmission({
      authenticatedUserId: "user-alice",
      draftAssessment: mockDraft,
      submissionPayload: { quizId: "draft-assessment-123", answers },
      clientScore: 0, // Inadvertent or manipulated zero score
    });

    assert.strictEqual(result.quizScore, 80, "Server must ignore client score of 0 and record 80");
  });

  // Test 7: Unauthorized submission
  test("7. Unauthorized submission without userId is rejected", () => {
    const answers = ["401", "401", "401", "401", "401"];
    assert.throws(
      () => {
        evaluateAndScoreSubmission({
          authenticatedUserId: null, // Unauthenticated
          draftAssessment: mockDraft,
          submissionPayload: { quizId: "draft-assessment-123", answers },
        });
      },
      { message: "Unauthorized" }
    );
  });

  // Test 8: Another user's assessment/quiz ID
  test("8. Submitting against another user's assessment ID is rejected", () => {
    const answers = ["401", "401", "401", "401", "401"];
    assert.throws(
      () => {
        evaluateAndScoreSubmission({
          authenticatedUserId: "user-bob", // Bob attempting to submit Alice's quiz
          draftAssessment: mockDraft, // Alice's draft
          submissionPayload: { quizId: "draft-assessment-123", answers },
        });
      },
      { message: "No active quiz session found. Please start a new interview." }
    );
  });

  // Test 9: Invalid question count / mismatch
  test("9. Submitting incorrect number of answers is rejected", () => {
    const answers = ["401", "401"]; // Only 2 answers instead of 5
    assert.throws(
      () => {
        evaluateAndScoreSubmission({
          authenticatedUserId: "user-alice",
          draftAssessment: mockDraft,
          submissionPayload: { quizId: "draft-assessment-123", answers },
        });
      },
      { message: "Invalid submission: expected 5 answers, received 2." }
    );
  });

  // Test 10: Invalid answer value outside available options is marked incorrect
  test("10. Injected answer value outside option list is marked incorrect", () => {
    const answers = [
      "SQL INJECTION ' OR 1=1 --", // Invalid option
      "Single Responsibility Principle",
      "401",
      "They reduce client bundle size by running exclusively on the server",
      "Read Committed",
    ];

    const result = evaluateAndScoreSubmission({
      authenticatedUserId: "user-alice",
      draftAssessment: mockDraft,
      submissionPayload: { quizId: "draft-assessment-123", answers },
    });

    assert.strictEqual(result.questions[0].isCorrect, false);
    assert.strictEqual(result.quizScore, 80);
  });

  // Test 14: Completed result can still display explanations after submission
  test("14. Completed result contains full explanations for review in QuizResult", () => {
    const answers = [
      "To accelerate query lookups and search performance",
      "Single Responsibility Principle",
      "401",
      "They reduce client bundle size by running exclusively on the server",
      "Read Committed",
    ];

    const result = evaluateAndScoreSubmission({
      authenticatedUserId: "user-alice",
      draftAssessment: mockDraft,
      submissionPayload: { quizId: "draft-assessment-123", answers },
    });

    for (const q of result.questions) {
      assert.ok(q.explanation, "Each question in the completed result must have its explanation");
      assert.ok(q.answer, "Each question in the completed result must have its correct answer");
      assert.ok(q.userAnswer, "Each question must record what the user answered");
      assert.strictEqual(typeof q.isCorrect, "boolean");
    }
  });
});
