import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnosticScore, parseResumeDocument, resumeDocumentToText } from '../lib/resume-review.js';
import { getInterviewSummary, isPracticeComplete, practiceDate } from '../lib/interview-state.js';

test('resume preview preserves actual extracted experience, including nested entries', () => {
  const document = parseResumeDocument(JSON.stringify({
    name: 'Example Candidate', email: 'candidate@example.test', industry: 'Operations',
    experience: [{ role: 'Coordinator', achievements: ['Organized schedules', 'Supported team reporting'] }],
    skills: ['Planning', { name: 'Analysis' }], education: [],
  }));
  const text = resumeDocumentToText(document);
  assert.match(text, /Coordinator/);
  assert.match(text, /Organized schedules/);
  assert.match(text, /Analysis/);
  assert.doesNotMatch(text, /\[object Object\]/);
  assert.doesNotMatch(text, /SUMMARY|EDUCATION|increased revenue/i);
});

test('legacy resume text remains available without inventing structured fields', () => {
  const text = '# Experience\nA real achievement';
  assert.equal(resumeDocumentToText(parseResumeDocument(text)), text);
  assert.deepEqual(parseResumeDocument(null).sections, []);
  assert.equal(diagnosticScore(undefined), null);
  assert.equal(diagnosticScore(NaN), null);
  assert.equal(diagnosticScore(109), 100);
});

test('draft interview sessions are excluded from history and summary calculations', () => {
  const data = [
    { id: 'later', category: 'Technical', quizScore: 80, createdAt: '2026-10-19T00:00:00Z' },
    { id: 'draft', category: 'draft', quizScore: 0, createdAt: '2026-10-20T00:00:00Z' },
    { id: 'earlier', category: 'Technical', quizScore: 60, createdAt: '2026-10-18T00:00:00Z' },
  ];
  const summary = getInterviewSummary(data);
  assert.equal(summary.completed.length, 2);
  assert.equal(summary.latest.id, 'later');
  assert.equal(summary.average, 70);
  assert.equal(summary.best, 80);
  assert.equal(data[0].id, 'later');
  assert.equal(getInterviewSummary().average, null);
});

test('practice submission requires one legal option for every question', () => {
  const questions = [{ options: ['A', 'B'] }, { options: ['C', 'D'] }];
  assert.equal(isPracticeComplete(questions, ['A', 'D']), true);
  assert.equal(isPracticeComplete(questions, ['A', null]), false);
  assert.equal(isPracticeComplete(questions, ['A', 'not an option']), false);
  assert.equal(isPracticeComplete(questions, ['A']), false);
  assert.equal(isPracticeComplete([], []), false);
  assert.equal(practiceDate('not a date'), 'Date unavailable');
});
