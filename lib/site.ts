export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://f.inc";

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
