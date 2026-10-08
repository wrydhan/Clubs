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
      {/* Hero Section with f.inc Editorial Treatment */}
      <section className="relative border-b border-line bg-paper px-6 pt-16 pb-16 md:px-10 md:pt-24 md:pb-20 finc-grid">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="flex items-center gap-1.5 text-accent font-semibold">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              Founders, Inc. Campus
            </span>
            <span>·</span>
            <span>Pier 2, Fort Mason, San Francisco</span>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
            <div>
              <h1 className="font-serif text-[3.8rem] leading-[0.92] text-ink sm:text-[4.75rem] md:text-[5.5rem] tracking-tight">
                The Clubs.
              </h1>
              <p className="mt-6 max-w-2xl text-lg md:text-xl text-ink-secondary leading-relaxed font-sans">
                Founders don&apos;t just work together. We run track days at Sonoma, play weekly pickup, machine hardware in the workshop, and run tactical paintball. Subsidized space and budgets for the things you actually want to do.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-sm border border-line bg-card/80 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-line/60 pb-3 font-mono text-xs">
                <span className="text-muted uppercase tracking-wider">Campus Clubs Hub</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Season
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="font-serif text-3xl text-ink">4</div>
                  <div className="font-mono text-[11px] text-muted uppercase tracking-wider mt-0.5">
                    Clubs Running
                  </div>
                </div>
                <div>
                  <div className="font-serif text-3xl text-accent">100%</div>
                  <div className="font-mono text-[11px] text-muted uppercase tracking-wider mt-0.5">
                    Funded by f.inc
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href="/clubs/apply"
                  className="flex h-11 w-full items-center justify-center bg-ink text-xs font-mono font-medium uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm"
                >
                  Apply to Run a Club →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Next Event Banner */}
      {nextEvent ? (
        <section className="border-b border-line bg-paper-subtle py-8 px-6 md:px-10">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted font-medium">
                Upcoming on Calendar
              </span>
              <Link
                href="/clubs/calendar"
                className="font-mono text-xs text-accent hover:text-accent-hover font-semibold transition-colors"
              >
                View Full Calendar →
              </Link>
            </div>
            <EventCard event={nextEvent} />
          </div>
        </section>
      ) : null}

      {/* Clubs Grid Section */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted font-medium">
              Directory
            </span>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl text-ink">
              Roster of Clubs
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted">
            Open to all founders, operators, and creators in the Bay Area community. Join an existing session or start your own.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {ordered.map((club) => (
            <ClubCard key={club.slug} club={club} now={now} />
          ))}
        </div>
      </section>

      {/* Philosophy / About Block */}
      <section className="border-t border-line bg-paper-subtle py-20 px-6 md:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="border-t-2 border-ink pt-6">
              <span className="font-mono text-xs text-muted uppercase tracking-wider">01 / Culture</span>
              <h3 className="mt-3 font-serif text-2xl text-ink">Zero Pitch Decks</h3>
              <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                Clubs exist strictly outside work. Nobody pitches their startup, passes around a business card, or asks for intros. Just drive fast, play ball, cut aluminum, and hang out.
              </p>
            </div>
            <div className="border-t-2 border-ink pt-6">
              <span className="font-mono text-xs text-muted uppercase tracking-wider">02 / Sponsorship</span>
              <h3 className="mt-3 font-serif text-2xl text-ink">Real Backing</h3>
              <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                Founders, Inc. provides budgets for track time, court bookings, material supplies, and hospitality, plus access to our facilities at Pier 2 Fort Mason.
              </p>
            </div>
            <div className="border-t-2 border-ink pt-6">
              <span className="font-mono text-xs text-ink pt-6 border-accent">03 / Production</span>
              <h3 className="mt-3 font-serif text-2xl text-ink">Documented by Media</h3>
              <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                Our in-house media team documents sessions with professional photography and video, turning small group chats into legendary institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start A Club CTA - High Impact Inverted Card */}
      <section className="bg-inverse text-inverse-ink py-20 px-6 md:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
                <span>✦</span>
                <span>Founders, Inc. Residency & Community</span>
              </div>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.0] text-inverse-ink">
                Run the thing you wish existed.
              </h2>
              <p className="mt-4 text-base md:text-lg text-inverse-muted leading-relaxed font-sans">
                If you&apos;ve been holding a group chat together or dreaming of a weekly ritual for your craft, this is how it becomes an official Founders, Inc. club.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/clubs/apply"
                className="inline-flex h-13 items-center justify-center bg-inverse-ink px-8 text-sm font-mono uppercase tracking-wider text-inverse font-semibold hover:bg-accent hover:text-white transition-colors rounded-sm"
              >
                Apply to Host a Club →
              </Link>
              <Link
                href="/clubs/calendar"
                className="inline-flex h-13 items-center justify-center border border-inverse-line px-8 text-sm font-mono uppercase tracking-wider text-inverse-ink hover:border-inverse-ink transition-colors rounded-sm"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
