import { siteConfig } from "@/lib/site";

/**
 * The origin that relative metadata URLs (og:image, canonical) resolve against:
 * the real domain, unless this is a production deployment with no custom domain
 * attached yet. Link previews would otherwise point at a site that is not there.
 *
 * Preview deployments need nothing here: Next.js itself resolves og:image and
 * twitter:image against the preview's own URL when VERCEL_ENV is "preview".
 */
export function metadataBaseUrl(env: Record<string, string | undefined> = process.env): URL {
  const productionHost = env.VERCEL_PROJECT_PRODUCTION_URL;
  const usesVercelHost = env.VERCEL_ENV === "production" && productionHost?.endsWith(".vercel.app");
  return new URL(usesVercelHost ? `https://${productionHost}` : siteConfig.url);
}
