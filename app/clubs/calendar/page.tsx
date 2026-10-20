import type { Metadata } from "next";
import Link from "next/link";
import { CalendarView, type CalendarEvent } from "@/components/calendar-view";
import { Scrap, Tape } from "@/components/collage/paper";
import { getClubs, getEvents } from "@/lib/clubs";
import { subscribeUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Calendar — Founders, Inc. Clubs",
  description:
    "Upcoming schedule for Founders, Inc. clubs in San Francisco. Track days at Sonoma Raceway, workshop build days, pickup basketball, and tactical paintball.",
  alternates: { canonical: "/clubs/calendar" },
};

export default function CalendarPage() {
  const now = new Date();
  const clubs = getClubs();
  const events: CalendarEvent[] = getEvents(now).map((event) => ({
    ...event,
    clubName: clubs.find((club) => club.slug === event.clubSlug)?.name ?? event.clubSlug,
  }));

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1360px] px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
          <Link href="/clubs" className="hover:text-ink">
            Founders, Inc. Clubs
          </Link>
          <span>/</span>
          <span className="text-ink">Campus calendar</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h1 className="font-serif text-[3rem] leading-[0.86] sm:text-[4.4rem]">
              What&apos;s pinned this month.
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-ink/70">
              Confirmed sessions: Sonoma track days, machine hours at the workshop, gym runs and
              field days. Every date links to its Luma RSVP.
            </p>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end">
            <Scrap tone="news" rotate={1.6} className="relative px-6 py-5">
              <Tape className="-left-5 -top-3" rotate={-24} width={92} height={28} />
              <p className="label">Keep it in your calendar</p>
              <p className="scrawl mt-2 text-[1.4rem] leading-tight">
                dates move — subscribe, don&apos;t screenshot.
              </p>
              <a href={subscribeUrl} className="pill-btn mt-4">
                Subscribe to iCal ↗
              </a>
            </Scrap>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8">
        <CalendarView
          events={events}
          clubs={clubs
            .filter((club) => club.status === "active")
            .map((club) => ({ slug: club.slug, name: club.name }))}
          todayIso={now.toISOString()}
        />
      </div>
    </main>
  );
}
