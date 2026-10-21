import type { Metadata } from "next";
import Link from "next/link";
import { Hallway, type HallwayClub } from "@/components/hallway/hallway";
import { stickerFor } from "@/lib/collage";
import { getClubs, getNextEvent } from "@/lib/clubs";
import { formatMonthDay, formatTime, formatWeekday } from "@/lib/format";

export const metadata: Metadata = {
  title: "The hallway — Founders, Inc. Clubs",
  description:
    "Walk the Pier 2 hallway to the club pinboard. Four flyers, one per club — unpin one, read it up close, then go through to the club page.",
  alternates: { canonical: "/clubs/hallway" },
  openGraph: {
    title: "The hallway — Founders, Inc. Clubs",
    description:
      "A first-person walk down the Pier 2 hallway to the club pinboard. One flyer per club, pinned at a slight angle.",
    url: "/clubs/hallway",
  },
};

export default function HallwayPage() {
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
      sticker: stickerFor(club.slug),
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

      <section className="border-t border-ink/15 bg-paper px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <span className="label">End of the hallway</span>
            <h2 className="mt-3 font-serif text-[2.4rem] leading-[0.9] sm:text-[3.2rem]">
              Nothing here is a networking event.
            </h2>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">
              Track days, workshop nights, Tuesday runs and field trips, all run out of Pier 2. Read
              the four on one page, or start the fifth one yourself.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
            <Link href="/clubs/roster" className="pill-btn">
              The four clubs →
            </Link>
            <Link href="/clubs/apply" className="pill-btn-secondary">
              Start a club
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
