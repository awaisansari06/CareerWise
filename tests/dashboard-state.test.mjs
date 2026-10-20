import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardNextStep, getSkillComparison } from '../lib/dashboard-state.js';

test('dashboard directs users through missing foundations in order', () => {
  assert.equal(getDashboardNextStep({ hasResume: false, hasAnalysis: true, assessmentCount: 3, hasRoadmap: true }).href, null);
  assert.equal(getDashboardNextStep({ hasResume: true }).href, '/resume');
  assert.equal(getDashboardNextStep({ hasResume: true, hasAnalysis: true }).href, '/interview');
  assert.equal(getDashboardNextStep({ hasResume: true, hasAnalysis: true, assessmentCount: 1 }).href, '/roadmap');
  assert.equal(getDashboardNextStep({ hasResume: true, hasAnalysis: true, assessmentCount: 1, hasRoadmap: true }).label, 'Continue practicing');
});

test('industry suggestions distinguish unlisted skills without assuming a proficiency score', () => {
  assert.deepEqual(getSkillComparison([' Data Analysis ', 'Communication'], ['data analysis', 'Communication', 'Strategy', 'Strategy', '']), ['Strategy']);
  assert.deepEqual(getSkillComparison(), []);
});
