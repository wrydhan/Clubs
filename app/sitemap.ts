import type { MetadataRoute } from "next";
import { publicRoutes } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

/**
 * Static: built once, no per-request date churn, so a crawler re-reading the
 * file sees the same bytes until the next deploy.
 *
 * Only public routes are listed. The old stub pointed at `/` alone and left
 * everything else to be discovered; the portal is deliberately absent — it is
 * disallowed in robots.txt, noindexed in metadata and header-gated, and putting
 * it here would be the one place that announces its existence.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: new URL(route.path, `${siteUrl}/`).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
