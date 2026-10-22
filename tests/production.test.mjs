import test from 'node:test';
import assert from 'node:assert/strict';
import { getSafeResourceUrl } from '../lib/resource-url.js';
import { validateResumeFile, MAX_RESUME_SIZE } from '../lib/resume-validator.js';
import { QuizResponseSchema, extractJsonFromText, safeGenerateContent } from '../lib/gemini.js';

test('resource links reject executable schemes, credentials, and malformed values', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'http://example.com', 'https://user:secret@example.com', '/relative', null]) {
    assert.equal(getSafeResourceUrl(url), null);
  }
  assert.equal(getSafeResourceUrl('https://example.com/course?q=1'), 'https://example.com/course?q=1');
});

test('resume upload checks PDF headers and the serverless-safe size boundary', async () => {
  const file = (contents, name = 'resume.pdf') => Object.assign(new Blob([contents], {type:'application/pdf'}), {name});
  await assert.rejects(validateResumeFile(file('<script>not a PDF</script>')), /signature/);
  await assert.rejects(validateResumeFile(file('%PDF-test', 'resume.exe')), /Unsupported/);
  assert.equal(MAX_RESUME_SIZE,4*1024*1024);
  const maximumFile=Object.assign(new Blob(['%PDF-',new Uint8Array(MAX_RESUME_SIZE-5)],{type:'application/pdf'}),{name:'maximum.pdf'});
  assert.equal((await validateResumeFile(maximumFile)).size,MAX_RESUME_SIZE);
  await assert.rejects(validateResumeFile({name:'resume.pdf',size:MAX_RESUME_SIZE+1,type:'application/pdf'}), /4 MB/);
  assert.equal((await validateResumeFile(file('%PDF-1.7\nvalid header'))).filename, 'resume.pdf');
});

test('AI quizzes cannot use an answer that is absent from the options', () => {
  const question = {question:'Choose a language',options:['JavaScript','Python'],correctAnswer:'Ruby'};
  assert.equal(QuizResponseSchema.safeParse({questions:[question]}).success, false);
  assert.equal(QuizResponseSchema.safeParse({questions:[{...question,correctAnswer:'Python'}]}).success, true);
});

test('AI parsing handles fenced JSON and rejects empty or malformed output', () => {
  assert.deepEqual(extractJsonFromText('```json\n{"ok":true}\n```'), {ok:true});
  assert.throws(()=>extractJsonFromText(''), /empty/);
  assert.throws(()=>extractJsonFromText('not JSON'), /malformed/);
});

test('AI errors are sanitized and slow calls time out without retries', async () => {
  let calls = 0;
  await assert.rejects(safeGenerateContent({generateContent(){calls++;return new Promise(()=>{});}}, 'test', {timeoutMs:10}), /timed out/);
  assert.equal(calls,1);
  await assert.rejects(safeGenerateContent({generateContent:async()=>{throw new Error('private credential and stack');}}, 'test'), error => !error.message.includes('credential'));
});

import { getProductionConfigurationIssues } from '../lib/production-config.js';
import { parseDatabaseUrl } from '../lib/database-url.js';
test('database configuration rejects copied shell commands without exposing credentials', () => {
  const url = 'postgresql://user:PRIVATE_PASSWORD@example.invalid/careerwise?sslmode=require';
  assert.equal(parseDatabaseUrl(url).hostname, 'example.invalid');
  for (const value of [`psql '${url}'`, `'${url}'`, 'https://example.invalid/db', 'postgresql://example.invalid', undefined]) {
    assert.throws(() => parseDatabaseUrl(value), error => !error.message.includes('PRIVATE_PASSWORD') && /PostgreSQL URL/.test(error.message));
  }
  assert.ok(getProductionConfigurationIssues({ DATABASE_URL: `psql '${url}'` }).some(issue => issue.startsWith('DATABASE_URL')));
});
test('production preflight rejects development authentication and reports names without secrets', () => {
  const issues = getProductionConfigurationIssues({NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'pk_test_PRIVATE_VALUE',CLERK_SECRET_KEY:'sk_test_PRIVATE_VALUE',NEXT_PUBLIC_APP_URL:'http://localhost:3000'});
  assert.ok(issues.some(issue => issue.includes('production instance')));
  assert.ok(issues.some(issue => issue.includes('public HTTPS')));
  assert.equal(issues.join('\n').includes('PRIVATE_VALUE'), false);
});

import { RoadmapResponseSchema } from '../lib/gemini.js';
test('malformed roadmap nodes fail validation before they reach the renderer', () => {
  assert.equal(RoadmapResponseSchema.safeParse({initialNodes:[null]}).success,false);
  assert.equal(RoadmapResponseSchema.safeParse({initialNodes:[{id:'1',data:{title:'Learn'},position:{x:Infinity,y:0}}]}).success,false);
  assert.equal(RoadmapResponseSchema.safeParse({initialNodes:[{id:'1',data:{title:'Learn'}}]}).success,true);
});

import { removeUserData } from '../lib/remove-user-data.js';
test('account deletion scopes every record operation to the verified user', async () => {
  const calls=[];
  const tables=['assessment','coverLetter','resumeAnalysis','roadmap','resume','aiUsage','user'];
  const tx=Object.fromEntries(tables.map(name=>[name,{deleteMany:async args=>calls.push([name,args])}]));
  tx.user.findUnique=async args=>{assert.equal(args.where.clerkUserId,'clerk_1');return {id:'user_1'};};
  await removeUserData({$transaction:async callback=>callback(tx)},'clerk_1');
  assert.equal(calls.length,7);
  for(const [name,args] of calls){
    if(name==='aiUsage') assert.equal(args.where.id.startsWith,'user_1:');
    else if(name==='user') assert.deepEqual(args.where,{id:'user_1',clerkUserId:'clerk_1'});
    else assert.deepEqual(args.where,{userId:'user_1'});
  }
});

test('repeated account deletion is harmless when the user is already absent',async()=>{
  await removeUserData({$transaction:async callback=>callback({user:{findUnique:async()=>null}})},'already_deleted');
});
