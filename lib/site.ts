export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://f.inc";

/** Placeholder until the real calendar feed exists. */
export const subscribeUrl = "https://lu.ma/finc-clubs";

export function clubSubscribeUrl(slug: string): string {
  return `https://lu.ma/finc-${slug}`;
}
