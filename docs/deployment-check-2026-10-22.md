# Deployment check — 22 October 2026

## Passed

- Optimized production build, including Next.js lint/type validation and static page generation.
- Repository ESLint check, with no errors or warnings.
- All 34 automated tests.
- Production server smoke check of 21 URLs: public pages/assets return 200; protected routes return 307 sign-in redirects.
- No streamed server-rendering error markers were found in those responses. An unknown page and a missing static image both return the expected 404 without Clerk middleware errors.
- 15 internal route targets exist; no missing static asset references or fragment targets were found.
- Neon connection succeeds outside the local network sandbox. All 19 migration-history entries are applied, with none rolled back. No application records were read or changed during the connectivity check.
- Landing portrait, generated texture, favicon, app icon, robots and sitemap endpoints respond successfully.

The detailed local HTTP results are saved in `output/deployment-links-report.json` (ignored development output).

## Fixed during this check

- Corrected the local DATABASE_URL: it contained a copied `psql` shell command instead of a raw PostgreSQL connection URL. Credentials were preserved; no database schema or application data was changed.
- Added credential-safe URL validation to runtime configuration, production preflight, deployment inspection and migration commands. Invalid values now produce a controlled message without echoing the connection string.
- Added a regression test for shell-command connection strings and secret-safe diagnostics.
- Replaced the advertised 5 MB resume limit with a shared 4 MB client/server limit, leaving transport headroom under Vercel's 4.5 MB request cap. Updated all upload controls and the public product policies, and tested the exact accepted/rejected boundary. See https://vercel.com/docs/functions/limitations.
- Consolidated the app icon at `public/icon.svg`, matching the new logo and favicon, and removed the conflicting automatic icon route. Preserved the auth helper's fallback for static/404 requests that bypass Clerk middleware while keeping error logs credential-safe.
- Preserved Next.js rendering/redirect signals in the auth helper so production rendering does not swallow framework control flow or log expected build-time signals as application errors.
- Ignored the isolated production build directory used by this check.

## Confirm in Vercel before deployment

This checkout has no linked Vercel project or Vercel token, so Vercel's environment values have not been inspected. The following findings apply to the local environment:

- DATABASE_URL must be the raw PostgreSQL URL, without `psql` or shell quotation marks. Use current, rotated database credentials.
- NEXT_PUBLIC_APP_URL is missing. Set it to the actual production HTTPS origin for canonical links, sitemap and redirects.
- Clerk keys are development keys. Configure the production NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY and the matching production domain in Clerk.
- GEMINI_MODEL is missing. Configure a model available to the Google project associated with GEMINI_API_KEY.
- INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY are missing. Configure the production keys and sync the deployed `/api/inngest` endpoint with Inngest; resume parsing and other queued AI tasks depend on this service.
- CLERK_WEBHOOK_SIGNING_SECRET is missing. Configure the signed user-deletion webhook at `/api/webhooks/clerk`.

The preflight command deliberately fails until these settings are complete. The production build can pass with incomplete settings, so build success alone does not verify a working production AI/authentication configuration.

## Scope and remaining verification

Authenticated resume upload, AI generation, Inngest delivery/retry and the Clerk deletion webhook have not been exercised end to end against the production deployment. Verify these using a dedicated test account after the host settings and integrations are configured. Protected routes were verified as signed-out redirects, not as authenticated workspace sessions. Mailbox delivery for the legal/privacy/security contact addresses was not tested.

The changes and new CSS/image assets are local; include them in the deployment commit. No deployment, migration, or database mutation was performed by this check.
