import type { MetadataRoute } from "next";
import { AI_CRAWLERS, PORTAL_DISALLOW } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

/**
 * Built once at build time so every hit returns the same body (Next caches it
 * and Vercel serves it from the edge).
 *
 * `*` and the named answer-engine crawlers share one policy: the public calendar
 * is open, everything under /portal is closed. Naming the AI crawlers
 * explicitly keeps that true if the wildcard rule is ever tightened, and the
 * portal's own noindex metadata plus its X-Robots-Tag header hold the gate even
 * if a crawler ignores robots.txt.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const rule = { allow: "/", disallow: [...PORTAL_DISALLOW] };

  return {
    rules: [
      { userAgent: "*", ...rule },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, ...rule })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
