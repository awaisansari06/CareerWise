# Production review — 14 October 2026

## Verified locally

- Next.js production build completed with Prisma client generation and page compilation.
- ESLint passed with React hooks and Next.js rules retained.
- All 9 regression tests passed (controlled inputs and mocked services, not live integration tests).
- Final npm audit reported 0 vulnerabilities across runtime and development dependencies.
- Package and lockfile root dependency sets match; Prisma schema validates.
- Desktop hero and 320/390px phone layouts were reviewed after the Tailwind 4 migration. Light and dark themes render correctly.
- Sharp's installed native image processor successfully generated an image.

## Fixes included

Conditional hooks on results pages; production error pages; font build dependency removal; compatible runtime security patches and build tooling updates; HTTPS-only generated resource links; structured quiz/roadmap validation; bounded AI requests with cancellation; durable per-user AI budgets; atomic resume replacement with derived-data invalidation; scoped quiz completion transitions; signed, idempotent account-deletion webhook; production configuration preflight; and deployment instructions.

## Release gates still requiring production configuration

The current local environment uses Clerk test keys and has no configured production origin, Gemini model, Inngest event/signing keys, or Clerk webhook signing secret. `npm start` correctly refuses this configuration. Configure these in the deployment host using `.env.example`; do not send secrets in chat or commit them.

Apply the committed `AiUsage` migration with `npm run db:deploy` to the intended database before exercising AI generation. No database migrations or account deletions were executed during this review. Register both webhook endpoints and complete the live authentication/database/AI checks listed in `docs/production.md` before releasing.

The local home page is available at http://localhost:3000/ for review. This work has not been deployed to an external host.
