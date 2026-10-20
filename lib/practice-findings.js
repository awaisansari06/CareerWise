/** Build coaching from the scored answer key; do not invent claims about proficiency. */
export function practiceFindings(result){
 const questions=Array.isArray(result?.questions)?result.questions:[];
 const missed=questions.filter(q=>!q.isCorrect);
 const first=missed[0];
 return {correct:questions.length-missed.length,total:questions.length,missed:missed.length,
 finding:missed.length?`${missed.length} answer${missed.length===1?" needs":"s need"} another look.`:"Every answer matched this practice set.",
 evidence:first?{question:first.question,selected:first.userAnswer,expected:first.answer,explanation:first.explanation}:null,
 next:first?"Read the explanation below. Without looking at the options, explain why the answer fits and when a different approach might work.":"Try a fresh set to practice different situations. This result reflects this question set, not overall interview readiness."};
}
