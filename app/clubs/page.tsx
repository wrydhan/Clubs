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
      <section className="border-b border-[#D8D2C3] bg-[#F5F2EA] px-4 py-16 sm:px-6 md:py-24 lg:px-8 dark:border-[#2E2B22] dark:bg-[#12110C]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
            <span>Pier 2, Fort Mason</span>
            <span>/</span>
            <span>San Francisco, CA</span>
            <span>/</span>
            <span className="text-[#12110C] dark:text-[#F5F2EA]">Founders, Inc. Campus</span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.92] text-[#12110C] dark:text-[#F5F2EA] tracking-tight">
                Campus Clubs.
              </h1>
              <p className="mt-8 max-w-2xl text-lg md:text-xl text-[#3A3830] dark:text-[#9B978A] leading-relaxed">
                Founders don&apos;t just work together. We run track sessions at Sonoma, play weekly pickup, build custom machines in the workshop, and run tactical paintball. Subsidized spaces, track bookings, and resources for what you do outside of work.
              </p>
            </div>

            <div className="lg:col-span-4 border border-[#D8D2C3] bg-[#FCFAF5] p-6 dark:border-[#2E2B22] dark:bg-[#17150F]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
                Club Backing
              </span>
              <p className="mt-3 text-sm text-[#3A3830] dark:text-[#9B978A] leading-relaxed">
                Founders, Inc. sponsors venue rentals, track time, court bookings, material supplies, and hospitality for resident-led clubs.
              </p>
              <div className="mt-6 border-t border-[#D8D2C3] pt-4 dark:border-[#2E2B22]">
                <Link
                  href="/clubs/apply"
                  className="inline-block border border-[#12110C] bg-[#12110C] px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[#F5F2EA] hover:bg-[#E8452B] hover:border-[#E8452B] dark:border-[#F5F2EA] dark:bg-[#F5F2EA] dark:text-[#12110C] dark:hover:bg-[#E8452B] dark:hover:text-[#F5F2EA] transition-colors"
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
        <section className="border-b border-[#D8D2C3] bg-[#EBE6D9] px-4 py-8 sm:px-6 lg:px-8 dark:border-[#2E2B22] dark:bg-[#1C1A13]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
              <span>Next Upcoming Session</span>
              <Link
                href="/clubs/calendar"
                className="text-[#12110C] hover:text-[#E8452B] dark:text-[#F5F2EA] dark:hover:text-[#FF6A3D] transition-colors"
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
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#D8D2C3] pb-6 dark:border-[#2E2B22]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
              Directory
            </span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[#12110C] dark:text-[#F5F2EA]">
              Active Roster
            </h2>
          </div>
          <span className="font-mono text-xs text-[#8A8678]">
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
      <section className="border-t border-[#D8D2C3] bg-[#EBE6D9] px-4 py-16 sm:px-6 md:py-20 lg:px-8 dark:border-[#2E2B22] dark:bg-[#1C1A13]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border-t border-[#12110C] pt-6 dark:border-[#F5F2EA]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
                01 / Discipline
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#12110C] dark:text-[#F5F2EA]">
                Zero Pitch Decks
              </h3>
              <p className="mt-3 text-sm text-[#3A3830] dark:text-[#9B978A] leading-relaxed">
                Clubs exist strictly outside of work. No networking pitches or intros. Focus entirely on the craft, sport, or track.
              </p>
            </div>

            <div className="border-t border-[#12110C] pt-6 dark:border-[#F5F2EA]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
                02 / Resource
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#12110C] dark:text-[#F5F2EA]">
                Subsidized Spaces
              </h3>
              <p className="mt-3 text-sm text-[#3A3830] dark:text-[#9B978A] leading-relaxed">
                Founders, Inc. provides real budget for track rental fees, gymnasium slots, raw workshop stock, and gear.
              </p>
            </div>

            <div className="border-t border-[#12110C] pt-6 dark:border-[#F5F2EA]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8678]">
                03 / Media
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#12110C] dark:text-[#F5F2EA]">
                Documented Sessions
              </h3>
              <p className="mt-3 text-sm text-[#3A3830] dark:text-[#9B978A] leading-relaxed">
                Our in-house media crew documents club meets and track days with photography and film archives.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
