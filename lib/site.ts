/**
 * Canonical origin for this site.
 *
 * The Clubs site is clubs.f.inc — f.inc is the main Framer site and must never
 * be claimed as our origin. metadataBase, canonicals, robots.txt, sitemap.xml
 * and llms.txt all read from here, so one wrong default makes every one of them
 * point at the wrong property. Previews set NEXT_PUBLIC_SITE_URL; a trailing
 * slash or a bare host in that value is tolerated rather than trusted.
 */
const DEFAULT_SITE_URL = "https://clubs.f.inc";

function normalizeSiteUrl(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_SITE_URL;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const siteName = "Founders, Inc. Clubs";

export const siteDescription =
  "Events and clubs at Founders, Inc. in San Francisco: 3v3 basketball, track days, hardware workshops and field days at Fort Mason Pier 2.";

/**
 * The one verified Luma URL on the site. Crawled on 2026-10-20: 200 on both
 * luma.com and lu.ma (the short domain redirects). Every RSVP and subscribe
 * control resolves through this constant so the two domains can never drift
 * apart again, and nothing points at a `finc-*` slug that 404s.
 */
export const trackDayRsvpUrl = "https://luma.com/founderstrackday";

/** Placeholder until a real iCal feed exists — the Luma calendar page. */
export const subscribeUrl = trackDayRsvpUrl;

/**
 * Per-club subscribe target. Only Car Club has a live Luma page; the rest
 * point back at the campus calendar rather than a dead RSVP.
 */
export function clubSubscribeUrl(slug: string): string {
  return slug === "cars" ? trackDayRsvpUrl : "/clubs/calendar";
}
