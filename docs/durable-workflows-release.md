# Durable workflows release — 20 October 2026

## Database migration applied
Migration: `prisma/migrations/20261020000100_durable_career_workflows/migration.sql`.
Adds CareerJob, ResumeWorkspace and CareerExploration; adds selectedAnswers and progressVersion to Assessment. Existing rows, resumes, letters, roadmap nodes and completion flags are retained. User deletion cascades to the three new tables. No reset, seed, table drop, column drop, or backfill that overwrites user content.

Applied to the operator-identified Neon database on 20 October 2026 using Prisma migrate deploy after baselining. Prisma reports migration history up to date. Counts of every existing application table were unchanged before/after deployment. Release evidence: `output/product-audit/database-release.json`. This confirms the database rollout, not deployment of the Next.js app or registration of its Inngest functions.

Offline Prisma schema diff generated successfully; the migration matches the additive schema changes with additional SQL checks for valid task kinds/statuses. The operator identified the existing Neon target on 20 October. A live Prisma diff confirmed that its schema exactly matched the pre-change schema. It had all eight existing application tables but no `_prisma_migrations` table. The release therefore records the 18 existing migrations with Prisma's official `migrate resolve --applied` workflow before applying the new migration. Older destructive intermediate migrations must never be replayed against this database.

## Access findings
The local environment has development Clerk credentials, no public production app origin, no configured Gemini model, no Inngest event/signing keys, no Clerk webhook secret, and no linked Vercel project or deployment token. The identified Neon database is reachable. Connectivity and schema were checked without reading user content. Database target fingerprint: `754cdee36d8c` (hostname/database hash, not a credential). The deployed app's target cannot be confirmed until hosting access is available.

## Exact release order
Run from a trusted release environment with provider-managed secrets. Confirm the application project and PostgreSQL hostname/database with the operator; do not paste connection strings into logs or chat. Take a provider snapshot and review current migration history first.

```powershell
npm ci
npm run preflight
npm run deploy:inspect
npm run db:status
# Review every pending migration, including any older migrations reported by status.
npm run db:deploy
npm run db:status
npm run db:generate
npm run lint
npm test
npm run build
```

The release wrapper uses `DIRECT_URL` when supplied and derives the matching direct endpoint for Neon. Runtime keeps its pooled `DATABASE_URL`. `db:deploy` runs Prisma migrate deploy; it never resets or seeds. Do not use migrate dev, db push, migrate reset, or manually insert rows into _prisma_migrations. The former sync-db script no longer fabricates history. The target-specific baseline script validates the exact old schema, recorded checksums and known migration names before recording any remaining baseline entries. It refuses unrelated targets or history requiring review. See [Prisma baselining](https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/baselining) and [Neon connections](https://www.prisma.io/docs/orm/v6/overview/databases/neon).

Deploy this existing project through its hosting provider after gates pass; no hosting project is linked in this checkout. Configure the production Clerk instance and redirect origins; DATABASE_URL, GEMINI_API_KEY, GEMINI_MODEL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY, CLERK_WEBHOOK_SIGNING_SECRET. Keep secret values on the host, never NEXT_PUBLIC_* or Git.

Sync `https://<your-production-origin>/api/inngest` in the production Inngest dashboard after deploying. Verify these registered function IDs:
- process-career-job (careerwise/job.requested, 2 retries)
- recover-career-jobs (every 2 minutes; outbox redelivery, timeout handling, 30-day finished-task cleanup)
- generate-industry-insights (weekly; full insights refresh with retryable failures)

Configure the signed Clerk user.deleted webhook at `/api/webhooks/clerk`. Verify its delivery; database cascades also remove new workspace/job data. Inngest events contain identifiers only. Private PDF bytes are held in CareerJob input while processing or retryable failure, cleared on success, and removed with failed jobs by the cleanup schedule after 30 days. Connect the schedule before enabling uploads. Generated checkpoint data also follows Inngest retention settings: configure these with the provider.

## Safe deployment verification (still required)
Completed local gates: ESLint; 33 automated tests; optimized Next.js build with lint/type validation and 23 routes. PostgreSQL integration verification passed seven checks covering replay-safe publication, atomic completion/private-input clearing, owned reads, persisted drafts with stale-version rejection, saved comparisons, saved interview answers/private answer key, and stale-profile rejection. All synthetic records were rolled back. Evidence: `output/product-audit/database-verification.json`.

Use a dedicated test account and a synthetic resume with no personal information. Do not seed over existing records.
1. Sign in, create a profile or upload the synthetic PDF. See queued → running → completed. Refresh while pending; leave and return. Confirm one active resume.
2. Open resume review, wait for analysis, edit a draft and mark one suggestion reviewed. Save, refresh, sign out/in; verify both restore.
3. Choose two career roles, save directions, refresh and sign back in; compare and selected role should restore.
4. Generate interview questions. Select an answer and wait for saving; refresh and sign back in to resume. Complete the set; verify feedback evidence matches the scored answer key. Repeated submit must not duplicate the assessment. Check responses contain no answer key before submission.
5. Generate a cover letter, navigate away while pending, open the completed result from Background tasks. Edit/save/refresh/sign back in. Double-click or redeliver the same job event; only one letter should exist.
6. Generate a roadmap, complete a milestone, refresh/sign back in. Replace the resume: existing plan/progress stays. Explicitly replace the plan only after the confirmation checkbox.
7. With a staging-only provider failure, verify task failure is visible, retry increments attempt, and one final result persists. Redeliver an old attempt; it must not overwrite the new result. Change profile during generation: stale work must fail without overwriting the profile's current results.
8. Use a second dedicated account: task IDs, letters, assessments, drafts, milestones and saved directions belonging to the first account must not be accessible or writable.
9. Verify both themes and mobile layouts, Inngest run history, and the weekly/cleanup schedules. Delete the synthetic account through the normal account UI when finished.

Until hosting and production service credentials are available, deployed queue execution, refresh/sign-in persistence and cross-account end-to-end checks remain pending. Unit and PostgreSQL transaction checks do not substitute for those checks. Visual verification uses the actual components with clearly illustrative fixture data; the temporary verification route is removed from the production build. See `output/product-audit/index.html` for captures and `verified-layouts.json` for settled overflow observations.
