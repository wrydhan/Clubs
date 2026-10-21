import type { Metadata } from "next";
import { Hallway, type HallwayClub } from "@/components/hallway/hallway";
import { getClubs, getNextEvent } from "@/lib/clubs";
import { formatMonthDay, formatTime, formatWeekday } from "@/lib/format";

export const metadata: Metadata = {
  title: "The hallway — Founders, Inc. Clubs",
  description:
    "Walk the Pier 2 hallway to the club pinboard. Four flyers, one per club — unpin one, read it up close, then go through to the club page.",
  alternates: { canonical: "/clubs" },
  openGraph: {
    title: "The hallway — Founders, Inc. Clubs",
    description:
      "A first-person walk down the Pier 2 hallway to the club pinboard. One flyer per club, pinned at a slight angle.",
    url: "/clubs",
  },
};

/** The Clubs entrance: the scroll is the walk down the hallway, the pinboard is
    where it lands, and the same four flyers are the interactive board after it. */
export default function ClubsPage() {
  const now = new Date();
  const clubs: HallwayClub[] = getClubs().map((club) => {
    const next = getNextEvent(club.slug, now);
    return {
      slug: club.slug,
      name: club.name,
      tagline: club.tagline,
      description: club.description,
      cadence: club.cadence,
      location: club.location,
      tag: club.theme?.tag ?? "Campus club",
      status: club.status,
      lead: club.lead ? { name: club.lead.name, role: club.lead.role } : undefined,
      nextEvent: next
        ? {
            title: next.title,
            when: `${formatWeekday(next.datetime)} ${formatMonthDay(next.datetime)} · ${formatTime(next.datetime)}`,
            href: next.rsvpUrl,
          }
        : undefined,
    };
  });

  return (
    <main>
      <Hallway clubs={clubs} />
    </main>
  );
}
