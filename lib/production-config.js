/** Returns configuration diagnostics without exposing credential values. */
export function getProductionConfigurationIssues(env) {
  const required = ['DATABASE_URL', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'NEXT_PUBLIC_APP_URL', 'INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY', 'CLERK_WEBHOOK_SIGNING_SECRET'];
  const issues = required.filter(key => !env[key]?.trim() || /REPLACE|YOUR-PRODUCTION/.test(env[key])).map(key => `${key} is missing or still a placeholder`);
  if (env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_live_')) issues.push('Clerk publishable key must use a production instance');
  if (env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.startsWith('sk_live_')) issues.push('Clerk secret key must use a production instance');
  if (env.NEXT_PUBLIC_APP_URL) {
    try {
      const url = new URL(env.NEXT_PUBLIC_APP_URL);
      if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password) issues.push('NEXT_PUBLIC_APP_URL must be a public HTTPS origin');
    } catch { issues.push('NEXT_PUBLIC_APP_URL must be a valid URL'); }
  }
  return issues;
}
