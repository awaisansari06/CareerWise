# Product audit — 20 October 2026

## Findings and remediation checklist
- [x] AI work runs inside server/page requests: move parsing, analysis, insights, quiz and letter/roadmap generation to persisted Inngest jobs.
- [x] No user-visible durable pending/failure state, event dispatch recovery or duplicate protection.
- [x] Resume draft and addressed suggestions exist only in React state.
- [x] Interview draft questions are saved, but selected answers are not; refresh cannot resume practice.
- [x] Career path selection/comparison is transient; persist the chosen exploration state.
- [x] Quiz submission accepts invalid option strings as wrong answers; validate before scoring.
- [x] Feedback is an unstructured AI paragraph; use evidence from scored questions and a focused practice action.
- [x] Weekly insights catches errors and marks job successful; retry failures and share the full insights generator.
- [x] scripts/sync-db.mjs writes fabricated migration history; replace with the Prisma production workflow.
- [ ] Production host linkage and service credentials need verification before any production migration.
- [x] Flat surfaces and tiny metadata need page-specific hierarchy and depth.

Checked items above mean remediation is implemented in code. The additive database migration is applied and Prisma history is up to date; existing table row counts were unchanged. Hosting rollout and live sign-in/job verification remain pending; see durable-workflows-release.md.

## Route → implementation → persistence → background work
| Route / action | UI | Server boundary | Prisma | Job |
|---|---|---|---|---|
| `/` | HeroSection, CareerJourney, LandingPage | links to protected actions | none; example labeled illustrative | none |
| `/sign-in`, `/sign-up` | Clerk | Clerk | User provisioned by checkUser | none |
| `/onboarding` PDF/profile | onboarding-form | uploadResume / createCareerProfile | User, Resume | RESUME_PARSE for PDF |
| `/dashboard` | dashboard-view | getResume, getDashboardProgress, getIndustryInsights | Resume, ResumeAnalysis, Assessment, Roadmap, CoverLetter, IndustryInsight | INSIGHTS |
| `/career-paths` | CareerPaths | getIndustryInsights, saveCareerExploration | IndustryInsight, CareerExploration | INSIGHTS |
| `/resume` | ResumeReview | getResumeDocument, getResumeAnalysis, saveResumeWorkspace | Resume, ResumeAnalysis, ResumeWorkspace | RESUME_ANALYSIS |
| `/interview` | InterviewLab / QuizResult | getAssessments | Assessment | none (read completed results) |
| `/interview/mock` | Quiz | generateQuiz, savePracticeProgress, saveQuizResult, getActivePractice | Assessment | INTERVIEW_QUIZ |
| `/ai-cover-letter` | CoverLetterList | getCoverLetters, deleteCoverLetter | CoverLetter | none (library) |
| `/ai-cover-letter/new`, `/ai-cover-letter/[id]` | LetterStudio | generateCoverLetter, getCoverLetter, updateCoverLetter | CoverLetter | COVER_LETTER |
| `/roadmap` | CareerRoadmap | saveRoadMap, getRoadMap, setMilestoneCompletion | Roadmap | ROADMAP |
| Private job status/retry | CareerJobCenter | listCareerJobs, getCareerJob, retryCareerJob | CareerJob | careerwise/job.requested + reconciliation cron |
| `/api/profile` | integration health probe | authenticated GET; POST rejected (405) | no personal data | none |
| `/api/inngest` | Inngest signed endpoint | serve | CareerJob, IndustryInsight | registered workers + cron |
| `/api/webhooks/clerk` | Clerk signed webhook | verifyWebhook / removeUserData | owned records removed | none |
| `/privacy`, `/terms`, `/security` | policy content | static | none | none |
| `/hero-options` | development-only design preview | production notFound | none | none |

Search, tabs, open accordions, hover effects and example-journey choices are intentionally presentational state. They do not claim saved results. Download/copy/print act on saved or explicitly unsaved text. No live content is replaced with sample data.
