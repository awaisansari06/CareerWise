export function getInterviewSummary(assessments = []) {
  const completed = assessments
    .filter((assessment) => assessment.category !== "draft")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const scores = completed.map((assessment) => assessment.quizScore).filter((score) => typeof score === "number" && Number.isFinite(score));
  return {
    completed,
    latest: completed.at(-1) || null,
    average: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    best: scores.length ? Math.max(...scores) : null,
  };
}

export function isPracticeComplete(questions, answers) {
  return questions.length > 0 && questions.length === answers.length &&
    questions.every((question, index) => question.options.includes(answers[index]));
}

export function practiceDate(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date) : "Date unavailable";
}
