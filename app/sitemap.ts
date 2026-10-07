import type { MetadataRoute } from "next";
import { getClubs } from "@/lib/clubs";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${siteUrl}/clubs`, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/clubs/calendar`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/clubs/apply`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    ...getClubs().map((club) => ({
      url: `${siteUrl}/clubs/${club.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
