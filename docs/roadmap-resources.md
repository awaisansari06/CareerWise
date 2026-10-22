# Roadmap learning resources

Roadmaps use the maintained catalog in `lib/roadmap-resources.js`. The AI supplies milestone topics, never resource addresses. Catalog URLs point to official provider sites. Matching uses the milestone title first and its description second. Unknown topics get labeled Google and YouTube search links.

Existing saved plans resolve catalog alternatives when displayed. **Repair resource links** saves this normalization without changing completion, milestone IDs, descriptions, positions, or edges. A known incorrect `roadmap.dev/computer-science` address maps to `roadmap.sh/computer-science`. Unknown addresses are removed rather than guessed.

**Check links** checks up to three catalog resources for the selected milestone. A 404 or 410 is unavailable. Provider blocks, rate limits, server errors, and timeouts are unverified; these links remain usable. Checks use a six-second budget per resource, bounded redirects to catalog provider hosts, and HEAD with a small GET fallback where necessary. Caller-supplied URLs are never fetched.

**Report broken link** marks a resource on the current user's plan and moves it behind alternatives. Rechecking can restore it if reachable. This does not create a global report or change another user's plan.

All writes authenticate the owner and compare the roadmap's update timestamp to prevent overwriting concurrent progress. No migration or plan regeneration is required. Link checks measure reachability, not course quality, relevance, price, or access rights. Providers can change URLs later; update the catalog and use repair when needed.

Verification: 40 automated tests pass, lint passes, production build passes. Resource regression tests cover legacy repairs, preservation of completed progress, unknown topics and URLs, exact topic matching, provider blocking, redirects, and safe HEAD fallback.
