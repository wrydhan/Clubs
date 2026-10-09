import type { Metadata } from "next";
import Link from "next/link";
import { ClubCard } from "@/components/club-card";
import { EventCard } from "@/components/event-card";
import { getEvents, sortClubs } from "@/lib/clubs";

export const metadata: Metadata = {
  title: "Clubs — Founders, Inc. Fort Mason",
  description:
    "Member-run clubs at Founders, Inc. in Fort Mason, San Francisco. Car Club, Basketball, Hardware Workshop, and Paintball. Track days, pickup games, and workshop builds.",
  alternates: { canonical: "/clubs" },
};

export default function ClubsPage() {
  const now = new Date();
  const ordered = sortClubs(now);
  const upcomingEvents = getEvents(now);
  const nextEvent = upcomingEvents[0];

  return (
    <main className="min-h-screen">
      {/* Editorial Header / Index Strip */}
      <section className="border-b border-[#e5e2da] bg-[#f9f8f5] px-4 py-16 sm:px-6 md:py-24 lg:px-8 dark:border-[#262626] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[#737373]">
            <span>Pier 2, Fort Mason</span>
            <span>/</span>
            <span>San Francisco, CA</span>
            <span>/</span>
            <span className="text-[#0a0a0a] dark:text-[#f9f8f5]">Founders, Inc. Campus</span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.92] text-[#0a0a0a] dark:text-[#f9f8f5] tracking-tight">
                Campus Clubs.
              </h1>
              <p className="mt-8 max-w-2xl text-lg md:text-xl text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
                Founders don&apos;t just work together. We run track sessions at Sonoma, play weekly pickup, build custom machines in the workshop, and run tactical paintball. Subsidized spaces, track bookings, and resources for what you do outside of work.
              </p>
            </div>

            <div className="lg:col-span-4 border border-[#e5e2da] bg-white p-6 dark:border-[#262626] dark:bg-[#121212]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                Club Backing
              </span>
              <p className="mt-3 text-sm text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
                Founders, Inc. sponsors venue rentals, track time, court bookings, material supplies, and hospitality for resident-led clubs.
              </p>
              <div className="mt-6 border-t border-[#e5e2da] pt-4 dark:border-[#262626]">
                <Link
                  href="/clubs/apply"
                  className="inline-block border border-[#0a0a0a] bg-[#0a0a0a] px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[#f9f8f5] hover:bg-[#1900ff] hover:border-[#1900ff] dark:border-[#f9f8f5] dark:bg-[#f9f8f5] dark:text-[#0a0a0a] dark:hover:bg-[#1900ff] dark:hover:text-[#f9f8f5] transition-colors"
                >
                  Start a Club →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Next Event */}
      {nextEvent ? (
        <section className="border-b border-[#e5e2da] bg-[#f2efe9] px-4 py-8 sm:px-6 lg:px-8 dark:border-[#262626] dark:bg-[#141414]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#737373]">
              <span>Next Upcoming Session</span>
              <Link
                href="/clubs/calendar"
                className="text-[#0a0a0a] hover:text-[#1900ff] dark:text-[#f9f8f5] dark:hover:text-[#3b82f6] transition-colors"
              >
                Full Calendar →
              </Link>
            </div>
            <EventCard event={nextEvent} />
          </div>
        </section>
      ) : null}

      {/* Clubs Roster Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#e5e2da] pb-6 dark:border-[#262626]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
              Directory
            </span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[#0a0a0a] dark:text-[#f9f8f5]">
              Active Roster
            </h2>
          </div>
          <span className="font-mono text-xs text-[#737373]">
            {ordered.length} Member Clubs
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {ordered.map((club, idx) => (
            <ClubCard key={club.slug} club={club} now={now} index={idx} />
          ))}
        </div>
      </section>

      {/* Campus Tenets / Principles */}
      <section className="border-t border-[#e5e2da] bg-[#f2efe9] px-4 py-16 sm:px-6 md:py-20 lg:px-8 dark:border-[#262626] dark:bg-[#141414]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border-t border-[#0a0a0a] pt-6 dark:border-[#f9f8f5]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                01 / Discipline
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#0a0a0a] dark:text-[#f9f8f5]">
                Zero Pitch Decks
              </h3>
              <p className="mt-3 text-sm text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
                Clubs exist strictly outside of work. No networking pitches or intros. Focus entirely on the craft, sport, or track.
              </p>
            </div>

            <div className="border-t border-[#0a0a0a] pt-6 dark:border-[#f9f8f5]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                02 / Resource
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#0a0a0a] dark:text-[#f9f8f5]">
                Subsidized Spaces
              </h3>
              <p className="mt-3 text-sm text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
                Founders, Inc. provides real budget for track rental fees, gymnasium slots, raw workshop stock, and gear.
              </p>
            </div>

            <div className="border-t border-[#0a0a0a] pt-6 dark:border-[#f9f8f5]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                03 / Media
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#0a0a0a] dark:text-[#f9f8f5]">
                Documented Sessions
              </h3>
              <p className="mt-3 text-sm text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
                Our in-house media crew documents club meets and track days with photography and film archives.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
