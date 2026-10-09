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
      <section className="border-b border-[#D8D2C3] bg-[#F5F2EA] px-4 py-16 sm:px-6 md:py-20 lg:px-8 dark:border-[#2E2B22] dark:bg-[#12110C]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
            <span className="text-[#12110C] dark:text-[#F5F2EA]">Founders, Inc. Clubs</span>
            <span>/</span>
            <span>Live Schedule</span>
          </div>

          <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] text-[#12110C] dark:text-[#F5F2EA]">
                Schedule.
              </h1>
              <p className="mt-4 max-w-xl text-base md:text-lg text-[#3A3830] dark:text-[#9B978A] leading-relaxed">
                Dates for track sessions, workshop machine hours, pickup runs, and tactical matches. Space is strictly capped per event.
              </p>
            </div>

            <a
              href={subscribeUrl}
              className="border border-[#12110C] bg-[#12110C] px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[#F5F2EA] hover:bg-[#E8452B] hover:border-[#E8452B] dark:border-[#F5F2EA] dark:bg-[#F5F2EA] dark:text-[#12110C] dark:hover:bg-[#E8452B] dark:hover:text-[#F5F2EA] transition-colors"
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
