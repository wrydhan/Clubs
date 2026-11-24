import type { SiteEvent } from "@/lib/events";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

/**
 * The one place SEO/AIO facts are written down.
 *
 * Anything search engines or AI crawlers read — JSON-LD, sitemap entries,
 * llms.txt copy — is derived from here, and everything here is already visible
 * on the page. Nothing in this file should describe something a visitor cannot
 * see, because structured data that disagrees with the rendered page is a
 * manual-action risk, not a shortcut.
 */

export const ORGANIZATION = {
  /** Legal/parent brand. This site is the clubs programme, not the studio. */
  parent: { name: "Founders, Inc.", url: "https://f.inc" },
  /** The one postal address the site publishes (components/footer.tsx). */
  address: {
    streetAddress: "Pier 2, Fort Mason Center",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94123",
    addressCountry: "US",
  },
  /**
   * Only profiles that are verifiably f.inc's own. No club socials are linked
   * from the site yet, so nothing is guessed at here.
   */
  sameAs: ["https://f.inc", "https://f.inc/campus"],
  logoPath: "/icons/icon-512.png",
} as const;

/** Everything under here is private and must never be offered to a crawler. */
export const PORTAL_DISALLOW = ["/clubs/portal", "/clubs/portal/"];

/**
 * Public, indexable routes. `clubs.f.inc` is a single-page calendar today, so
 * this is a one-line list; add a row here and the sitemap, llms.txt and any
 * breadcrumb follow. Never add a portal route.
 */
export const publicRoutes = [
  {
    path: "/",
    label: "Events calendar",
    description:
      "Every upcoming Founders, Inc. Clubs event with date, time, venue and registration link.",
    changeFrequency: "daily" as const,
    priority: 1,
  },
];

/**
 * Crawlers that feed answer engines. Listing them explicitly is not required
 * (the `*` rule already allows them) but it documents intent and survives a
 * future tightening of the wildcard rule.
 */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@type": ["Organization", "SportsOrganization"],
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: "Founders, Inc.",
    url: `${siteUrl}/`,
    description: siteDescription,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(ORGANIZATION.logoPath),
      width: 512,
      height: 512,
    },
    address: { "@type": "PostalAddress", ...ORGANIZATION.address },
    parentOrganization: {
      "@type": "Organization",
      name: ORGANIZATION.parent.name,
      url: ORGANIZATION.parent.url,
    },
    sameAs: [...ORGANIZATION.sameAs],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: siteName,
    description: siteDescription,
    inLanguage: "en-US",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

/**
 * One Event node per event the calendar is actually rendering right now.
 *
 * Built from the same merged list the page draws, so a portal-confirmed event
 * gets markup the moment it appears and a past event loses it when it drops
 * off. No offers/price node: the site publishes no ticket price, and an invented
 * price is worse than a missing one.
 */
export function eventJsonLd(events: SiteEvent[]): JsonLd[] {
  return events.map((event) => ({
    "@type": "Event",
    "@id": `${siteUrl}/#${event.id}`,
    name: event.title,
    description: event.description,
    startDate: event.datetime,
    ...(event.endDatetime ? { endDate: event.endDatetime } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${siteUrl}/#${event.id}`,
    image: [absoluteUrl("/opengraph-image")],
    location: {
      "@type": "Place",
      name: event.venue?.name ?? event.location,
      address: {
        "@type": "PostalAddress",
        ...(event.venue?.streetAddress ? { streetAddress: event.venue.streetAddress } : {}),
        addressLocality: event.venue?.locality ?? "San Francisco",
        addressRegion: event.venue?.region ?? "CA",
        ...(event.venue?.postalCode ? { postalCode: event.venue.postalCode } : {}),
        addressCountry: "US",
      },
    },
    organizer: { "@id": `${siteUrl}/#organization` },
    ...(event.rsvpUrl ? { sameAs: [event.rsvpUrl] } : {}),
  }));
}

/** Wrap nodes in a single graph script so the page carries one JSON-LD block. */
export function graph(nodes: JsonLd[]): JsonLd {
  return { "@context": "https://schema.org", "@graph": nodes };
}
