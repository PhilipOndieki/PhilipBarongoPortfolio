/**
 * The site's public origin, for absolute Open Graph URLs. Set
 * NEXT_PUBLIC_SITE_URL in production; Vercel and Netlify build variables are
 * used when it is not set.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.URL) return process.env.URL;
  return "http://localhost:3000";
}

export const siteUrl = new URL(resolveSiteUrl());
