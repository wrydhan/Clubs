import type { Metadata } from "next";
import { CalendarView, type CalendarEvent } from "@/components/calendar-view";
import { getClubs, getEvents } from "@/lib/clubs";
import { subscribeUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Club Calendar — Founders, Inc. Fort Mason",
  description:
    "Upcoming schedule for Founders, Inc. clubs in San Francisco. Track days at Sonoma Raceway, workshop build days, pickup basketball, and paintball.",
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
      {/* Editorial Calendar Hero */}
      <section className="relative border-b border-line bg-paper px-6 py-14 md:px-10 md:py-20 finc-grid">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="flex items-center gap-1.5 text-accent font-semibold">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              Founders, Inc. Clubs
            </span>
            <span>·</span>
            <span>Live Schedule</span>
          </div>
          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-[3.6rem] leading-[0.92] text-ink sm:text-6xl md:text-7xl">
                Calendar.
              </h1>
              <p className="mt-4 max-w-xl text-base md:text-lg text-ink-secondary leading-relaxed font-sans">
                Official dates for track days, workshops, and games. RSVP early as capacity is capped per session to preserve quality.
              </p>
            </div>
            <a
              href={subscribeUrl}
              className="inline-flex h-12 items-center justify-center bg-ink px-6 text-xs font-mono font-medium uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm shadow-sm"
            >
              Subscribe to Feed →
            </a>
          </div>
        </div>
      </section>

      {/* Main Interactive Calendar View */}
      <CalendarView
        events={events}
        clubs={clubs.filter((club) => club.status === "active").map((club) => ({ slug: club.slug, name: club.name }))}
        todayIso={now.toISOString()}
      />
    </main>
  );
}
