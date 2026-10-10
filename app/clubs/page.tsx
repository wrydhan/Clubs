import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ClubCard } from "@/components/club-card";
import { EventCard } from "@/components/event-card";
import { getEvents, sortClubs, getClub } from "@/lib/clubs";
import { formatMonthDay, formatTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Founders, Inc. — Clubs | Car Club & Campus Roster",
  description:
    "Member-run clubs at Founders, Inc. Fort Mason Pier 2, San Francisco. Flagship Car Club track days at Sonoma Raceway, Hardware Workshop, Basketball, and Paintball.",
  alternates: { canonical: "/clubs" },
};

export default function ClubsPage() {
  const now = new Date();
  const ordered = sortClubs(now);
  const upcomingEvents = getEvents(now);
  const nextEvent = upcomingEvents[0];
  const carClub = getClub("cars");

  return (
    <main className="min-h-screen bg-white">
      {/* Editorial Flagship Hero — Automotive Focus */}
      <section className="relative px-6 pt-10 pb-16 sm:px-8 sm:pt-16 sm:pb-24 max-w-7xl mx-auto">
        {/* Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-black/50 mb-8 pb-4 border-b-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
            <span className="font-semibold text-black tracking-wide">FOUNDERS, INC. CAMPUS</span>
            <span>/</span>
            <span>PIER 2, FORT MASON, SF</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">AUTUMN TRACK SEASON</span>
            <span>SONOMA RACEWAY & CIRCUITS</span>
          </div>
        </div>

        {/* Hero Title & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-8">
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[6.8rem] text-black tracking-tight leading-none">
              Drive fast.
              <br />
              Build things.
            </h1>
            <p className="mt-6 max-w-2xl text-lg sm:text-xl text-black/70 leading-relaxed font-sans">
              Subsidized track days at Sonoma Raceway, precision machining in the hardware workshop, competitive pickup basketball, and tactical woodsball. What founders do when the laptops close.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="finc-card p-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">
                Next Flagship Session
              </span>
              <h3 className="mt-2 font-serif text-2xl text-black">
                Sonoma Track Day
              </h3>
              <p className="mt-1 font-mono text-xs text-black/60">
                Oct 26 · 7:00 AM Convoy from Pier 2
              </p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="https://luma.com/founderstrackday"
                  target="_blank"
                  rel="noreferrer"
                  className="pill-btn text-xs py-2 px-4"
                >
                  Driver RSVP ↗
                </a>
                <Link
                  href="/clubs/cars"
                  className="pill-btn-secondary text-xs py-2 px-4"
                >
                  Car Club Details →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Massive Automotive Showcase Banner */}
        <div className="finc-card overflow-hidden relative group">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-black/5">
            <Image
              src="/images/clubs/cars/cover.jpg"
              alt="Founders, Inc. Car Club paddock staging at Sonoma Raceway"
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12 text-white">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-white/70 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  FLAGSHIP CLUB
                </span>
                <span>SONOMA RACEWAY PADDOCK</span>
                <span>/</span>
                <span>OCTOBER TRACK INVITATIONAL</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white">
                Founders Car Club
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/80 leading-relaxed font-sans">
                Full-day private track sessions at Sonoma Raceway and Thunderhill. High-speed elevation changes, paddock hospitality, timing telemetry, and morning convoys departing Pier 2 at 7:00 AM.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href="/clubs/cars"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black font-medium text-xs tracking-tight hover:bg-white/90 transition-all"
                >
                  Enter Car Club Feature →
                </Link>
                <a
                  href="https://luma.com/founderstrackday"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/20 text-white backdrop-blur-sm font-medium text-xs tracking-tight hover:bg-white/30 transition-all"
                >
                  RSVP for Track Day (Luma) ↗
                </a>
              </div>
            </div>
          </div>

          {/* Documentary Photo Strip under Car Club */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-[#EBEBEB]">
            <div className="relative aspect-[4/3] rounded-[10px] overflow-hidden">
              <Image
                src="/images/clubs/cars/01.jpg"
                alt="Driver prepping helmet and gloves in pit lane"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded">
                Pit Lane Staging
              </span>
            </div>
            <div className="relative aspect-[4/3] rounded-[10px] overflow-hidden">
              <Image
                src="/images/clubs/cars/04.jpg"
                alt="Track car apex on circuit"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded">
                Turn 2 Elevation
              </span>
            </div>
            <div className="relative aspect-[4/3] rounded-[10px] overflow-hidden">
              <Image
                src="/images/clubs/cars/07.jpg"
                alt="Turn 6 Carousel sweep"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded">
                Carousel Apex
              </span>
            </div>
            <div className="relative aspect-[4/3] rounded-[10px] overflow-hidden">
              <Image
                src="/images/clubs/cars/08.jpg"
                alt="Paddock cooldown and driver debrief"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded">
                Paddock Cooldown
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Next Upcoming Track Session Event Banner */}
      {nextEvent ? (
        <section className="px-6 py-12 sm:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-black/40">
                Confirmed Calendar Session
              </span>
            </div>
            <Link
              href="/clubs/calendar"
              className="font-mono text-xs text-black hover:opacity-70 transition-opacity"
            >
              Full Calendar →
            </Link>
          </div>
          <EventCard event={nextEvent} />
        </section>
      ) : null}

      {/* Campus Club Directory / Roster */}
      <section className="px-6 py-16 sm:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-black/40">
              Directory
            </span>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl text-black">
              All Campus Clubs
            </h2>
          </div>
          <span className="font-mono text-xs text-black/50">
            {ordered.length} Active & Chartering Clubs
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {ordered.map((club, idx) => (
            <ClubCard key={club.slug} club={club} now={now} index={idx} />
          ))}
        </div>
      </section>

      {/* Tenets / Campus Support */}
      <section className="px-6 py-16 sm:px-8 max-w-7xl mx-auto">
        <div className="finc-card p-8 sm:p-14">
          <span className="font-mono text-xs uppercase tracking-wider text-black/40">
            Campus Sponsorship & Charter
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-5xl text-black">
            How Founders, Inc. backs your club.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-[12px]">
              <span className="font-mono text-xs text-black/40 uppercase">01 / Culture</span>
              <h3 className="mt-3 font-serif text-2xl text-black">Zero Pitch Decks</h3>
              <p className="mt-3 text-sm text-black/60 leading-relaxed font-sans">
                Clubs exist strictly outside work. No business cards, networking pitches, or investor intros. Focus entirely on the driving line, the sport, or the machine.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[12px]">
              <span className="font-mono text-xs text-black/40 uppercase">02 / Budget</span>
              <h3 className="mt-3 font-serif text-2xl text-black">Subsidized Track Time</h3>
              <p className="mt-3 text-sm text-black/60 leading-relaxed font-sans">
                Founders, Inc. provides real budget for track rental slots at Sonoma, indoor gymnasium court bookings, raw workshop materials, and hospitality.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[12px]">
              <span className="font-mono text-xs text-black/40 uppercase">03 / Production</span>
              <h3 className="mt-3 font-serif text-2xl text-black">In-House Media Crew</h3>
              <p className="mt-3 text-sm text-black/60 leading-relaxed font-sans">
                Our resident media team captures track sessions, garage builds, and games with documentary film and photography archives.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-black/5">
            <div>
              <h4 className="font-serif text-2xl text-black">Have an obsession you want to run?</h4>
              <p className="text-sm text-black/60 font-sans mt-1">
                We back resident-led initiatives. Apply for club charter, budget, and Pier 2 access.
              </p>
            </div>
            <Link
              href="/clubs/apply"
              className="pill-btn text-xs py-3 px-6 shrink-0"
            >
              Start a Club at Pier 2 →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
