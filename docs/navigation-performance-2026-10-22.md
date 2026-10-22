# Navigation and interaction performance

## Confirmed causes and changes

- The background task effect depended on the `jobs` array. Each response replaced that array, reran the effect and immediately fetched again. It now uses a single-request polling controller with one timer scheduled after a response:4 seconds for active tasks,60 seconds when idle,30 seconds after an error. Hidden tabs pause; unmount ignores late responses and aborts the request.
- Completed jobs were tracked per pathname, so navigating to a new page treated old completions as new and refreshed the route. Initial results now establish a baseline; only a new completion triggers a refresh.
- Status reads used Server Actions and returned full generated results. Polling now uses an authenticated private/no-store GET endpoint with summary-only responses. This avoids the action queue and reduces transferred data. Individual result reads retain their existing ownership checks.
- Every header render called the remote Clerk profile API before checking the local account. The header now uses session auth only, so navigation never waits for database/profile requests. Workspace requests use the local account; the remote profile is fetched only for first-time provisioning or a legacy name repair. React request-scoped memoization shares account/resume reads across onboarding checks, resume views and generators. No cross-request user cache is introduced.
- Route content initially hid behind a450ms Framer Motion entrance. It now appears immediately with a160ms CSS entrance, with reduced-motion support. Dashboard first-load JS fell from approximately161KB to125KB in the production build.
- Navigation and theme dropdowns no longer take a modal body lock. Career tools is controlled, closes on selection and route changes, and no longer competes with the removed global body-lock workaround. Mobile navigation retains its proper dialog behavior.
- Navigation links preserve Next Link semantics, prefetching, keyboard access and modified clicks, while showing an immediate pending indicator. A shared workspace loading boundary lets dynamic routes show feedback while saved data loads.

## Verification

-45 tests pass, including initial completion baseline, exact-once completion refresh, one request under concurrent events, hidden-tab pause/resume, unmount cleanup, and error recovery/backoff.
- Lint and optimized production build pass.
- Browser: theme dropdown opens on one click; body pointer-events remains auto and no scroll lock is taken. Career-tools dropdown opens, closes with Escape, reopens on one click, and selecting Resume review closes it and immediately announces “Opening page…”. The authenticated-style menu was tested in a temporary presentation-only fixture; private data and routes remain protected.
- Production HTTP: unauthenticated task-status request returns401 with Cache-Control private,no-store; dashboard and roadmap redirect to sign-in.

Authenticated end-to-end page timings were not measured because the test browser was signed out. Provider/database cold starts and local development compilation can still affect a first request. The confirmed request loop and extra refreshes have been removed rather than masked with longer loading animations.
