"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { practiceFindings } from "@/lib/practice-findings";
import { ArrowRight, Check, ChevronDown, Lightbulb, RotateCcw, X } from "lucide-react";

export default function QuizResult({ result, hideStartNew = false, onStartNew, focusOnMount = false }) {
  const [filter, setFilter] = useState("all");
  const resultSection = useRef(null);
  useEffect(() => {
    if (!focusOnMount) return;
    resultSection.current?.focus({ preventScroll: true });
    resultSection.current?.scrollIntoView({ block: "start" });
  }, [focusOnMount, result?.id]);
  if (!result) return null;
  const findings=practiceFindings(result);
  const questions = Array.isArray(result.questions) ? result.questions : [];
  const correct = questions.filter((question) => question.isCorrect).length;
  const score = typeof result.quizScore === "number" && Number.isFinite(result.quizScore) ? Math.round(result.quizScore * 10) / 10 : null;
  const visibleQuestions = questions.map((question, index) => ({ ...question, index })).filter((question) => filter === "all" || !question.isCorrect);
  return (
    <div className="cw-quiz-result">
      <section ref={resultSection} tabIndex={-1} aria-label="Practice results" className="cw-panel cw-result-overview"><div><p className="cw-eyebrow">Every attempt teaches you something</p><h2>Here’s what to build on.</h2><p>{correct} of {questions.length} answers matched this practice set’s answer key. Explore the explanations and bring one insight into your next attempt.</p></div><div className="cw-result-score"><strong>{score ?? "—"}<small>{score === null ? "" : "%"}</small></strong><span>Practice accuracy</span></div></section>
      <section className="cw-feedback-focus" aria-label="Focused practice feedback"><header><Lightbulb size={23}/><div><p className="cw-eyebrow">One finding. One useful next step.</p><h3>{findings.finding}</h3></div></header>{findings.evidence && <div className="cw-feedback-evidence"><span>Evidence from your answers</span><h4>{findings.evidence.question}</h4><dl><div><dt>You chose</dt><dd>{findings.evidence.selected}</dd></div><div><dt>Answer key</dt><dd>{findings.evidence.expected}</dd></div></dl>{findings.evidence.explanation && <details><summary>Why this answer fits</summary><p>{findings.evidence.explanation}</p></details>}</div>}<div className="cw-feedback-next"><strong>Your next practice action</strong><p>{findings.next}</p><Link className="cw-text-link" href="/interview/mock">Practice another set <ArrowRight size={16}/></Link></div></section>
      <div className="cw-answer-review-heading"><h3>Review your answers</h3><div className="cw-result-filters" role="group" aria-label="Filter answer review"><button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All ({questions.length})</button><button type="button" aria-pressed={filter === "missed"} onClick={() => setFilter("missed")}>To review ({questions.length - correct})</button></div></div>
      <div className="cw-answer-reviews">{visibleQuestions.map((question) => <details key={question.index} open={question.index === 0}><summary><span className={question.isCorrect ? "cw-answer-status is-correct" : "cw-answer-status"}>{question.isCorrect ? <Check size={14} /> : <X size={14} />}</span><span><small>QUESTION {question.index + 1} · {question.isCorrect ? "CORRECT" : "TO REVIEW"}</small><strong>{question.question}</strong></span><ChevronDown size={17} /></summary><div className="cw-answer-detail"><div><span>Your answer</span><p>{question.userAnswer || "No answer provided"}</p></div>{!question.isCorrect && <div className="cw-correct-answer"><span>Answer key</span><p>{question.answer || "No answer key available"}</p></div>}{question.explanation && <div className="cw-answer-explanation"><span><Lightbulb size={14} />Why this answer</span><p>{question.explanation}</p></div>}</div></details>)}</div>
      {!visibleQuestions.length && <p className="cw-review-no-items">There are no missed questions to review in this session.</p>}
      {!hideStartNew && <div className="cw-result-actions"><Link href="/interview" className="cw-button cw-button-secondary">Back to interview lab</Link><button type="button" className="cw-button" onClick={onStartNew}><RotateCcw size={16} />Try a new session <ArrowRight size={16} /></button></div>}
    </div>
  );
}
