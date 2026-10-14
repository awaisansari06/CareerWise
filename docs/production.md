# Production deployment

The application build can run without contacting the database or downloading fonts. Authentication and AI features require the production services below.

## Configure the host

Use `.env.example` as the variable list. Store secrets in the host's secret manager, never in Git. Configure a public HTTPS origin in `NEXT_PUBLIC_APP_URL`, a Clerk production instance and its allowed redirect origins, a supported `GEMINI_MODEL` for your Google project, and production Inngest event/signing keys, and `CLERK_WEBHOOK_SIGNING_SECRET`. Use a pooled TLS PostgreSQL connection suitable for your deployment.

Run `npm run preflight` against the production environment. This validates configuration names and key modes without printing credentials; it does not verify connectivity or the validity of the supplied keys.

## Release sequence

1. Use Node 22.18+ (Node 22 or 24 LTS) and install the lockfile with `npm ci`.
2. Run `npm run lint` and `npm test`.
3. Run `npm run db:deploy` against the intended production database. This applies all committed migrations, including the additive `AiUsage` table. Back up the database before applying migrations and inspect migration status first. Do not use `prisma migrate reset` in production.
4. Run `npm run build` with the public production Clerk key and application URL available at build time.
5. Run `npm start` (or use your host's Next.js runtime). Startup refuses incomplete production configuration.
6. Register `/api/webhooks/clerk` in Clerk for `user.deleted` events and verify signed delivery and retries. This removes application data when an account is deleted.
7. Register `/api/inngest` with production Inngest. Its weekly task refreshes insights and removes expired AI budget records.

Do not build and run the development server against the same `.next` directory concurrently. On Windows, stop processes loading Prisma before generating its client; otherwise the query engine DLL can remain locked.

## Release checks requiring real services

- Create a user through production Clerk; verify sign-in, sign-out, redirects, and unauthorized access to private routes.
- Upload a valid PDF, reject an invalid/oversized upload, replace a resume, and confirm the analysis and roadmap refresh.
- Generate a quiz; verify server scoring and that a stale quiz ID is rejected.
- Generate, download, and delete a cover letter. Confirm another user cannot access it.
- Generate a roadmap and verify its resource links. Only HTTPS links without embedded credentials are rendered.
- Confirm AI quota behavior (30 generation actions per user per UTC hour by default; configurable through `AI_HOURLY_LIMIT`). Cached reads do not consume the quota. Apply the migration before enabling these actions.
- Confirm the weekly job runs and reports failures in Inngest.
- Check light/dark mode, phone layouts, security headers, `robots.txt`, and `sitemap.xml` on the deployed domain.

AI-generated market and salary information is an estimate and is not a live job-market feed. Configure logging and alerts at the host and Google service, with spending limits and appropriate retention for resumes and profile data.

The `/hero-options` design preview returns 404 in production. Image-generation drafts under `public/logo-concepts` are design references and do not replace the SVG production mark.
