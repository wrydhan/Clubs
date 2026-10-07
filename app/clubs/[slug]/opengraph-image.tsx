import { getClub, getClubs } from "@/lib/clubs";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "A Founders, Inc. club in San Francisco";
export const size = ogSize;
export const contentType = "image/png";
export const runtime = "nodejs";

export function generateStaticParams() {
  return getClubs().map((club) => ({ slug: club.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = getClub(slug);
  return ogImage({
    kicker: "Founders, Inc.",
    title: club?.name ?? "Clubs",
    subtitle: club?.tagline ?? "We fund the club. You show up.",
    footer: club ? `${club.cadence} · ${club.location}` : "San Francisco",
  });
}
