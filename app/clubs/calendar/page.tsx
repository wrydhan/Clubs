import type { Metadata } from "next";
import { CalendarView, type CalendarEvent } from "@/components/calendar-view";
import { getClubs, getEvents } from "@/lib/clubs";
import { subscribeUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Calendar — Founders, Inc. Clubs",
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
      <section className="border-b border-[#e5e2da] bg-[#f9f8f5] px-4 py-16 sm:px-6 md:py-20 lg:px-8 dark:border-[#262626] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#737373]">
            <span className="text-[#0a0a0a] dark:text-[#f9f8f5]">Founders, Inc. Clubs</span>
            <span>/</span>
            <span>Live Schedule</span>
          </div>

          <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] text-[#0a0a0a] dark:text-[#f9f8f5]">
                Schedule.
              </h1>
              <p className="mt-4 max-w-xl text-base md:text-lg text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
                Dates for track sessions, workshop machine hours, pickup runs, and tactical matches. Space is strictly capped per event.
              </p>
            </div>

            <a
              href={subscribeUrl}
              className="border border-[#0a0a0a] bg-[#0a0a0a] px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[#f9f8f5] hover:bg-[#1900ff] hover:border-[#1900ff] dark:border-[#f9f8f5] dark:bg-[#f9f8f5] dark:text-[#0a0a0a] dark:hover:bg-[#1900ff] dark:hover:text-[#f9f8f5] transition-colors"
            >
              Subscribe (iCal) ↗
            </a>
          </div>
        </div>
      </section>

      {/* Main Calendar View */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CalendarView
          events={events}
          clubs={clubs.filter((club) => club.status === "active").map((club) => ({ slug: club.slug, name: club.name }))}
          todayIso={now.toISOString()}
        />
      </div>
    </main>
  );
}
