"use client";
import { resolveCareerJob } from "@/lib/jobs/client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, FileQuestion, Lightbulb, Loader2, Pause, Play, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { savePracticeProgress } from "@/actions/workspace-state";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import { isPracticeComplete } from "@/lib/interview-state";
import QuizResult from "./quiz-result";

export function PreparationCues({ industry }) {
  return (
    <aside className="cw-preparation-cues" aria-label="Preparation cues">
      <section className="cw-panel"><span className="cw-icon-tile"><BookOpen size={21} /></span><h2>A little structure helps.</h2><ol><li><span>01</span><div><strong>Notice the context</strong><p>Look for the goal, constraints, and people involved.</p></div></li><li><span>02</span><div><strong>Weigh the options</strong><p>Compare the approaches before choosing your answer.</p></div></li><li><span>03</span><div><strong>Learn from the explanation</strong><p>After submitting, review why each answer fits.</p></div></li></ol></section>
      <section className="cw-cue-note"><Lightbulb size={20} /><div><h3>Practice with perspective</h3><p>{industry ? `Your ${industry} background helps shape this session.` : "Your uploaded resume helps shape this session."} Questions are AI-generated, so use the explanations as a starting point for further learning.</p></div></section>
      <section className="cw-cue-note"><ShieldCheck size={20} /><div><h3>Your own space to prepare</h3><p>Completed sessions are saved to your CareerWise account so you can revisit your answers and feedback.</p></div></section>
    </aside>
  );
}

export function PracticeQuestion({ questions, answers, currentQuestion, onAnswer, onNavigate, onSubmit, submitting = false, error, industry }) {
  const [paused, setPaused] = useState(false);
  const questionHeading = useRef(null);
  const questionPanel = useRef(null);
  const answerGroupId = useId();
  const question = questions[currentQuestion];
  const answeredCount = questions.filter((item, index) => item.options.includes(answers[index])).length;
  const lastQuestion = currentQuestion === questions.length - 1;
  const complete = isPracticeComplete(questions, answers);

  useEffect(() => {
    if (paused) return;
    questionHeading.current?.focus({ preventScroll: true });
    questionPanel.current?.scrollIntoView({ block: "start" });
  }, [currentQuestion, paused]);

  if (!question) return null;
  return (
    <div className="cw-practice-session-grid">
      <section ref={questionPanel} className="cw-panel cw-active-question" aria-label="Current practice question">
        <div className="cw-question-top"><span className="cw-mini-label">QUESTION {currentQuestion + 1} OF {questions.length}</span><span><Clock3 size={14} />Self-paced</span></div>
        <progress className="cw-question-progress" value={answeredCount} max={questions.length} aria-label={`${answeredCount} of ${questions.length} questions answered`} />
        <div className="cw-question-progress-label"><span>{answeredCount} of {questions.length} answered</span><button type="button" className="cw-text-link" disabled={submitting} onClick={() => setPaused(!paused)}>{paused ? <Play size={13} /> : <Pause size={13} />}{paused ? "Resume" : "Take a pause"}</button></div>
        {paused ? <div className="cw-question-paused"><Pause size={32} /><h2>Take a breath. You’ve got time.</h2><p>Your selected answers are still here. Resume when you’re ready.</p><button type="button" className="cw-button" onClick={() => setPaused(false)}><Play size={15} />Resume practice</button></div> : <>
          <h2 ref={questionHeading} tabIndex={-1} id={`${answerGroupId}-question`} className="cw-question-title">{question.question}</h2>
          <p className="cw-question-hint">Choose the approach you think fits best.</p>
          <fieldset className="cw-question-options" disabled={submitting} aria-labelledby={`${answerGroupId}-question`}><legend className="sr-only">Choose one answer</legend>{question.options.map((option, index) => <label key={index} className={answers[currentQuestion] === option ? "is-selected" : ""}><input type="radio" name={`${answerGroupId}-${currentQuestion}`} value={option} checked={answers[currentQuestion] === option} onChange={() => onAnswer(option)} /><span className="cw-option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option}</span><span className="cw-option-check" aria-hidden="true">{answers[currentQuestion] === option && <Check size={12} />}</span></label>)}</fieldset>
        </>}
        {error && <div className="cw-inline-error" role="alert"><strong>Your answers are still here.</strong><p>{error}</p></div>}
        <div className="cw-question-navigation"><button type="button" className="cw-button cw-button-secondary" disabled={currentQuestion === 0 || submitting || paused} onClick={() => onNavigate(currentQuestion - 1)}><ArrowLeft size={15} />Previous</button>{lastQuestion ? <button type="button" className="cw-button" disabled={!complete || submitting || paused} onClick={onSubmit}>{submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}{submitting ? "Saving…" : "Finish and see feedback"}</button> : <button type="button" className="cw-button" disabled={!answers[currentQuestion] || submitting || paused} onClick={() => onNavigate(currentQuestion + 1)}>Next question <ArrowRight size={15} /></button>}</div>
        {lastQuestion && !complete && <p className="cw-question-save-note">Answer every question before submitting. Use the question numbers below to revisit one.</p>}
        <nav className="cw-question-map" aria-label="Jump to a practice question">{questions.map((item, index) => <button type="button" key={item.id || index} disabled={submitting || paused} className={item.options.includes(answers[index]) ? "is-answered" : ""} aria-current={index === currentQuestion ? "step" : undefined} aria-label={`Question ${index + 1}${item.options.includes(answers[index]) ? ", answered" : ", unanswered"}`} onClick={() => onNavigate(index)}>{index + 1}</button>)}</nav>
        <p className="cw-question-save-note">Answers save to your account after each selection. Refresh to resume your saved session. If saving fails, select the answer again to retry.</p>
      </section>
      <PreparationCues industry={industry} />
    </div>
  );
}

export default function Quiz({ industry, initialPractice }) {
  const [phase, setPhase] = useState(initialPractice ? "active" : "ready");
  const [quiz, setQuiz] = useState(initialPractice || null);
  const [currentQuestion, setCurrentQuestion] = useState(()=>{if(!initialPractice)return 0;const next=initialPractice.questions.findIndex((_,i)=>!initialPractice.answers?.[i]);return next<0?Math.max(0,initialPractice.questions.length-1):next;});
  const [answers, setAnswers] = useState(initialPractice?.questions.map((_,i)=>initialPractice.answers?.[i]||null) || []);
  const [answerSaving,setAnswerSaving]=useState(false);
  const progressVersion=useRef(initialPractice?.progressVersion||0);
  async function answerQuestion(answer){if(answerSaving||requestActive.current)return;const next=answers.map((value,index)=>index===currentQuestion?answer:value);setAnswers(next);setAnswerSaving(true);setError("");try{const saved=await savePracticeProgress({quizId:quiz.quizId,answers:next,version:progressVersion.current});progressVersion.current=saved.version;}catch(err){setAnswers(answers);setError(err.message||"Could not save this answer. Select it again to retry.");}finally{setAnswerSaving(false);}}
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const requestActive = useRef(false);
  const generationRequest=useRef(null);

  useEffect(() => {
    if (!answerSaving && phase !== "submitting") return;
    const warnBeforeLeaving = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [phase, answerSaving]);

  async function startSession() {
    if (requestActive.current) return;
    requestActive.current = true;
    setError("");
    setPhase("generating");
    try {
      const response = await resolveCareerJob(await generateQuiz({requestId:generationRequest.current ??= crypto.randomUUID()}));
      if (!response?.quizId || !response.questions?.length) throw new Error("No questions were returned. Please try again.");
      generationRequest.current=null;setQuiz(response);progressVersion.current=response.progressVersion||0;
      setAnswers(response.questions.map((_,i)=>response.answers?.[i]||null));
      const next=response.questions.findIndex((_,i)=>!response.answers?.[i]);setCurrentQuestion(next<0?response.questions.length-1:next);
      setResult(null);
      setPhase("active");
    } catch (failure) { if(failure.code==="RESULT_REMOVED")generationRequest.current=null;setError(failure.message === "Unauthorized" ? "Please sign in again to start your practice session." : failure.message || "Could not prepare your questions. Please try again."); setPhase("ready"); }
    finally { requestActive.current = false; }
  }

  async function submitSession() {
    if (requestActive.current || !quiz || !isPracticeComplete(quiz.questions, answers)) return;
    requestActive.current = true;
    setError("");
    setPhase("submitting");
    try {
      const saved = await saveQuizResult({ quizId: quiz.quizId, answers });
      if (!saved?.id) throw new Error("Your results could not be saved. Please try again.");
      setResult(saved);
      setPhase("result");
      toast.success("Practice completed. Your feedback is saved.");
    } catch (failure) { setError(failure.message === "Unauthorized" ? "Please sign in again, then retry saving your answers." : failure.message || "Could not save your results. Please try again."); setPhase("active"); }
    finally { requestActive.current = false; }
  }

  if (phase === "generating") return <section className="cw-panel cw-tool-empty cw-generating-questions" role="status"><span className="cw-loading-orbit"><Sparkles size={32} /></span><p className="cw-eyebrow">Grounded in your background</p><h2>Preparing your practice questions.</h2><p>We’re using your resume to put together a relevant question set. This can take a moment.</p><span className="cw-loading-label"><Loader2 size={16} className="animate-spin" />Finding the right questions…</span></section>;
  if (phase === "result") return <QuizResult result={result} onStartNew={startSession} focusOnMount />;
  if (phase === "active" || phase === "submitting") return <PracticeQuestion questions={quiz.questions} answers={answers} currentQuestion={currentQuestion} industry={industry} error={error} submitting={phase === "submitting" || answerSaving} onAnswer={answerQuestion} onNavigate={setCurrentQuestion} onSubmit={submitSession} />;
  return (
    <div className="cw-practice-session-grid">
      <section className="cw-panel cw-practice-ready"><span className="cw-icon-tile"><FileQuestion size={24} /></span><p className="cw-eyebrow">Your space to prepare</p><h2>Ready when you are.</h2><p>Practice a set of multiple-choice questions based on your resume. Take your time, compare the options, and review the explanations when you’re done.</p><div className="cw-ready-facts"><div><FileQuestion size={18} /><strong>Resume-based</strong><span>Personalized questions</span></div><div><Clock3 size={18} /><strong>No countdown</strong><span>Go at your own pace</span></div><div><Lightbulb size={18} /><strong>Learn as you go</strong><span>Feedback after submission</span></div></div><div className="cw-ready-note"><Sparkles size={18} /><p>You can go back and change your answers before you submit. Your completed session will appear in your practice history.</p></div>{error && <div className="cw-inline-error" role="alert"><strong>Let’s give that another try.</strong><p>{error}</p></div>}<button type="button" className="cw-button" onClick={startSession}>Prepare my questions <ArrowRight size={17} /></button></section>
      <PreparationCues industry={industry} />
    </div>
  );
}
