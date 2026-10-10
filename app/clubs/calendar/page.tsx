import type { Metadata } from "next";
import { CalendarView, type CalendarEvent } from "@/components/calendar-view";
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
    <main className="min-h-screen bg-white">
      {/* Editorial Calendar Hero */}
      <section className="px-6 pt-12 pb-8 sm:px-8 sm:pt-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-mono text-[11px] text-black/50">
          <span className="font-semibold text-black">FOUNDERS, INC. CLUBS</span>
          <span>/</span>
          <span>CAMPUS CALENDAR</span>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-0">
          <div>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-black leading-none">
              Live Schedule.
            </h1>
            <p className="mt-4 max-w-xl text-base md:text-lg text-black/70 leading-relaxed font-sans">
              Confirmed sessions for Sonoma Raceway track days, hardware machine hours, gym runs, and tactical field days.
            </p>
          </div>

          <a
            href={subscribeUrl}
            className="pill-btn text-xs py-3 px-6 shrink-0"
          >
            Subscribe to iCal ↗
          </a>
        </div>
      </section>

      {/* Main Calendar View */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 pb-16">
        <CalendarView
          events={events}
          clubs={clubs.filter((club) => club.status === "active").map((club) => ({ slug: club.slug, name: club.name }))}
          todayIso={now.toISOString()}
        />
      </div>
    </main>
  );
}
