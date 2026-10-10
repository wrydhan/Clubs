import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ClubNav } from "@/components/club-nav";
import { RsvpCard } from "@/components/rsvp-card";
import { getClub, getClubs, getNextEvent } from "@/lib/clubs";
import { formatMonthDay, formatTime } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getClubs().map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = getClub(slug);
  if (!club) return { title: "Club" };
  const title = `${club.name} — Founders, Inc. Clubs`;
  const description = `${club.tagline} Private track sessions at Sonoma Raceway and Fort Mason facilities. ${club.cadence}, ${club.location}.`;
  return {
    title,
    description,
    alternates: { canonical: `/clubs/${club.slug}` },
    openGraph: { title, description, url: `/clubs/${club.slug}` },
    twitter: { title, description, card: "summary_large_image" },
  };
}

export default async function ClubPage({ params }: Props) {
  const { slug } = await params;
  const club = getClub(slug);
  if (!club) notFound();

  const now = new Date();
  const next = getNextEvent(club.slug, now);
  const isCars = club.slug === "cars";

  return (
    <main className="min-h-screen bg-white">
      {/* Top Breadcrumb Bar */}
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-black/40">
          <Link href="/clubs" className="hover:text-black transition-colors">
            Campus Clubs
          </Link>
          <span>/</span>
          <span className="text-black font-medium">{club.name}</span>
          <span>/</span>
          <span className="uppercase text-[11px]">
            {club.status === "active" ? "Active Season" : "Chartering"}
          </span>
        </div>
      </div>

      {isCars ? (
        /* ========================================================
           FLAGSHIP AUTOMOTIVE EDITORIAL SHOWCASE (CAR CLUB)
           ======================================================== */
        <article className="mx-auto max-w-7xl px-6 sm:px-8 pb-20">
          {/* Hero Banner Header */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-10">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium badge-car mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                FOUNDERS MOTORSPORT DIVISION · PIER 2 FORT MASON
              </div>
              <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-black leading-none tracking-tight">
                Car Club.
              </h1>
              <p className="mt-6 text-xl sm:text-2xl text-black/70 leading-relaxed font-sans max-w-2xl">
                Private track days, morning convoys, and paddock telemetry for founders who drive.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="finc-card p-6">
                <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">
                  Confirmed Session
                </span>
                <h3 className="mt-1 font-serif text-2xl text-black">
                  Sonoma Raceway Track Day
                </h3>
                <p className="mt-1 font-mono text-xs text-black/60">
                  Monday, Oct 26 · 7:00 AM Convoy Departure
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <a
                    href="https://luma.com/founderstrackday"
                    target="_blank"
                    rel="noreferrer"
                    className="pill-btn text-xs py-2.5 px-5"
                  >
                    RSVP on Luma ↗
                  </a>
                  <a
                    href="#circuit"
                    className="pill-btn-secondary text-xs py-2.5 px-4"
                  >
                    Circuit Specs ↓
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Cinematic Full-Bleed Photography Hero */}
          <div className="finc-card overflow-hidden relative aspect-[16/9] md:aspect-[21/9] w-full bg-black/5 mb-16">
            <Image
              src="/images/clubs/cars/cover.jpg"
              alt="Sonoma Raceway paddock staging line"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 sm:p-12 text-white">
              <span className="font-mono text-xs text-white/60 uppercase tracking-widest mb-1">
                Field Report · Sonoma, California
              </span>
              <p className="font-serif text-2xl sm:text-4xl text-white max-w-2xl">
                "No pitch decks, no business cards. Just clean apexes, tire pressures, and morning fog over the circuit."
              </p>
            </div>
          </div>

          {/* Asymmetric Editorial Columns: Overview & Logistics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
            {/* Left 7 cols: Editorial Story & Format */}
            <div className="lg:col-span-7 space-y-12">
              <section>
                <span className="font-mono text-xs uppercase tracking-wider text-black/40">
                  01 / Track Discipline
                </span>
                <h2 className="mt-2 font-serif text-4xl text-black">
                  Built for founders who take driving seriously.
                </h2>
                <div className="mt-6 text-base sm:text-lg leading-relaxed text-black/75 space-y-4 font-sans">
                  <p>
                    Full-day private track takeovers at Sonoma Raceway and Thunderhill Park. We subsidize circuit fees, staging facilities, timing transponders, and full technical paddock hospitality so founders can test machinery and driver craft.
                  </p>
                  <p>
                    Every session features three distinct run groups ranging from novice drivers accompanied by seasoned coaches to open-passing advanced groups. Passenger ride-alongs are welcome for founders seeking circuit experience before bringing their own cars.
                  </p>
                </div>
              </section>

              {/* Day-of Itinerary / Format */}
              <section className="finc-card p-8 sm:p-10">
                <span className="font-mono text-xs uppercase tracking-wider text-black/40">
                  Schedule of Run
                </span>
                <h3 className="mt-2 font-serif text-3xl text-black">
                  Sonoma Track Day Itinerary
                </h3>

                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-black text-white shrink-0">
                      07:00 AM
                    </span>
                    <div>
                      <h4 className="font-medium text-black text-sm">Convoy Departure · Pier 2 Fort Mason</h4>
                      <p className="text-xs text-black/60 font-sans mt-0.5">
                        Group roll-out through Marin Headlands up Highway 101/37 to Sonoma.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-black text-white shrink-0">
                      08:00 AM
                    </span>
                    <div>
                      <h4 className="font-medium text-black text-sm">Paddock Check-in & Technical Inspection</h4>
                      <p className="text-xs text-black/60 font-sans mt-0.5">
                        Torque checks, tire pressure baselines, transponder distribution, and espresso in the garage.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-black text-white shrink-0">
                      08:30 AM
                    </span>
                    <div>
                      <h4 className="font-medium text-black text-sm">Mandatory Driver Safety Briefing</h4>
                      <p className="text-xs text-black/60 font-sans mt-0.5">
                        Circuit flags, passing zones, point-bys, and elevation transition analysis.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-black text-white shrink-0">
                      09:00 AM
                    </span>
                    <div>
                      <h4 className="font-medium text-black text-sm">Green Flag · First Run Groups On Track</h4>
                      <p className="text-xs text-black/60 font-sans mt-0.5">
                        20-minute rotating run group sessions throughout the morning and afternoon.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-black text-white shrink-0">
                      05:00 PM
                    </span>
                    <div>
                      <h4 className="font-medium text-black text-sm">Checkered Flag & Paddock Debrief</h4>
                      <p className="text-xs text-black/60 font-sans mt-0.5">
                        Cooldown laps, telemetry review, and evening dinner convoy back to San Francisco.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right 5 cols: Specs Ledger & RSVP */}
            <div className="lg:col-span-5 space-y-6">
              <RsvpCard club={club} event={next} />

              <div id="circuit" className="finc-card p-8">
                <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">
                  Circuit Specs
                </span>
                <h3 className="mt-2 font-serif text-3xl text-black">
                  Sonoma Raceway
                </h3>

                <dl className="mt-6 space-y-4 font-mono text-xs">
                  <div className="flex justify-between py-2 border-b border-black/5">
                    <dt className="text-black/50">Track Length</dt>
                    <dd className="font-semibold text-black">2.52 Miles (12 Turns)</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black/5">
                    <dt className="text-black/50">Elevation Delta</dt>
                    <dd className="font-semibold text-black">160 ft (Turn 2 to Turn 4)</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black/5">
                    <dt className="text-black/50">Safety Spec</dt>
                    <dd className="font-semibold text-black">Snell SA2015+ Helmet</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black/5">
                    <dt className="text-black/50">Run Groups</dt>
                    <dd className="font-semibold text-black">Novice / Solo / Open</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black/5">
                    <dt className="text-black/50">Host Convoy</dt>
                    <dd className="font-semibold text-black">Pier 2 Fort Mason, SF</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-black/50">Cost & Subsidies</dt>
                    <dd className="font-semibold text-black">100% Subsidized by f.inc</dd>
                  </div>
                </dl>
              </div>

              {/* Requirements & Checklist */}
              <div className="bg-[#F1F1F1] p-8 rounded-[15px]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">
                  Driver Checklist
                </span>
                <h3 className="mt-2 font-serif text-2xl text-black">
                  What You Need
                </h3>

                <ul className="mt-4 space-y-2.5 text-xs text-black/70 font-sans">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                    Valid driver&apos;s license and signed waiver
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                    Snell or DOT certified motorsport helmet (loaners available)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                    Inspected vehicle: brake pads &gt;50%, fresh brake fluid
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                    Closed-toe driving shoes and long pants
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Documentary Photo Archive */}
          <section className="mt-20">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-black/40">
                  Media Production Archive
                </span>
                <h2 className="mt-2 font-serif text-4xl sm:text-5xl text-black">
                  Documented on Circuit
                </h2>
              </div>
              <span className="font-mono text-xs text-black/50">
                Founders, Inc. In-House Media Team
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {club.galleryImages.map((image) => (
                <div
                  key={image.src}
                  className="finc-card overflow-hidden group"
                >
                  <div className="relative aspect-[4/3] w-full bg-black/5">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  {image.caption ? (
                    <div className="p-4">
                      <p className="font-mono text-xs text-black/70 uppercase tracking-wider">
                        {image.caption}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* Back to All Clubs Nav */}
          <div className="mt-24 pt-8 border-t border-black/10 flex items-center justify-between">
            <Link
              href="/clubs"
              className="font-mono text-xs text-black/60 hover:text-black transition-colors"
            >
              ← Back to Campus Roster
            </Link>
            <Link
              href="/clubs/apply"
              className="pill-btn text-xs py-2 px-4"
            >
              Start Another Club →
            </Link>
          </div>
        </article>
      ) : (
        /* ========================================================
           STANDARD CLUB DETAIL TEMPLATE (HARDWARE, HOOPS, ETC.)
           ======================================================== */
        <div className="mx-auto max-w-7xl px-6 sm:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-3">
              <ClubNav currentSlug={club.slug} />
            </div>

            <div className="md:col-span-9 space-y-12">
              <header className="finc-card p-8 sm:p-12">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/5 text-black mb-4">
                  {club.theme?.tag ?? "Campus Club"}
                </span>
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-black leading-none">
                  {club.name}
                </h1>
                <p className="mt-4 text-xl text-black/70 font-sans max-w-2xl">
                  {club.tagline}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/clubs/apply" className="pill-btn text-xs py-2.5 px-5">
                    Join this Club Session →
                  </Link>
                  <Link href="/clubs/calendar" className="pill-btn-secondary text-xs py-2.5 px-5">
                    View Calendar
                  </Link>
                </div>
              </header>

              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[15px] bg-black/5">
                <Image
                  src={club.heroImage}
                  alt={club.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 70vw"
                />
              </div>

              <div className="finc-card p-8 sm:p-12 space-y-8">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-black/40">
                    About this Club
                  </span>
                  <p className="mt-4 text-base sm:text-lg leading-relaxed text-black/80 font-sans">
                    {club.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-black/5">
                  <div className="bg-white p-6 rounded-[12px]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">Cadence</span>
                    <span className="mt-1 block font-serif text-2xl text-black">{club.cadence}</span>
                  </div>
                  <div className="bg-white p-6 rounded-[12px]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">Location</span>
                    <span className="mt-1 block font-serif text-2xl text-black">{club.location}</span>
                  </div>
                </div>
              </div>

              <RsvpCard club={club} event={next} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
