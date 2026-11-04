import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ClubNav } from "@/components/club-nav";
import { RsvpCard } from "@/components/rsvp-card";
import { Scrap, Tape, Stamp, Sticker } from "@/components/collage/paper";
import { stickerFor } from "@/lib/collage";
import { getClub, getClubs, getNextEvent } from "@/lib/clubs";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getClubs().map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = getClub(slug);
  if (!club) return { title: "Club" };
  const title = `${club.name} — Founders, Inc. Clubs`;
  const description = `${club.tagline} ${club.cadence}, ${club.location}.`;
  return {
    title,
    description,
    alternates: { canonical: `/clubs/${club.slug}` },
    openGraph: { title, description, url: `/clubs/${club.slug}` },
    twitter: { title, description, card: "summary_large_image" },
  };
}

const itinerary = [
  {
    time: "07:00",
    title: "Convoy departs Pier 2",
    body: "Group roll-out over the Golden Gate and up 101/37 to Sonoma, radios on channel 4.",
  },
  {
    time: "08:00",
    title: "Paddock check-in",
    body: "Torque check, tyre pressure baselines, transponders handed out, espresso in the garage.",
  },
  {
    time: "08:30",
    title: "Driver briefing",
    body: "Flags, passing zones, point-bys and the elevation notes for turns 2 through 4.",
  },
  {
    time: "09:00",
    title: "Green flag",
    body: "Three rotating run groups, 20 minutes each, coaches riding with novice drivers.",
  },
  {
    time: "17:00",
    title: "Checkered flag",
    body: "Cool-down laps, telemetry review, then the dinner convoy back to San Francisco.",
  },
];

const specs = [
  ["Track length", "2.52 miles · 12 turns"],
  ["Elevation", "160 ft (T2 to T4)"],
  ["Safety spec", "Snell SA2015+ helmet"],
  ["Run groups", "Novice / Solo / Open"],
  ["Convoy", "Pier 2, Fort Mason"],
  ["Cost", "Subsidised by f.inc"],
];

const checklist = [
  "Valid licence and signed waiver",
  "Snell or DOT helmet (loaners available)",
  "Brake pads over 50%, fresh fluid",
  "Closed-toe shoes and long trousers",
];

export default async function ClubPage({ params }: Props) {
  const { slug } = await params;
  const club = getClub(slug);
  if (!club) notFound();

  const now = new Date();
  const next = getNextEvent(club.slug, now);
  const isCars = club.slug === "cars";
  const sticker = stickerFor(club.slug);

  return (
    <main className="min-h-screen">
      {/* breadcrumb */}
      <div className="mx-auto max-w-[1360px] px-5 pt-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          <Link href="/clubs/overview" className="inline-flex min-h-[32px] items-center hover:text-ink">
            The wall
          </Link>
          <span>/</span>
          <span className="text-ink">{club.name}</span>
          <span>/</span>
          <span>{club.status === "active" ? "Running" : "Chartering"}</span>
        </div>
      </div>

      {/* club header: sticker, torn title, pin */}
      <section className="mx-auto max-w-[1360px] px-5 pb-12 pt-6 sm:px-8">
        <div className="relative">
          <Scrap tone="cream" rotate={-0.6} className="relative px-6 py-9 sm:px-10 sm:py-12">
            <Tape className="-left-6 -top-4 z-20" rotate={-26} width={140} height={38} />
            <Tape className="-right-4 -top-3 z-20" rotate={18} width={104} height={30} />

            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-ink/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">
                    {club.theme?.tag ?? "Campus club"}
                  </span>
                  <Stamp>{club.status === "active" ? "season running" : "chartering"}</Stamp>
                </div>
                <h1 className="mt-5 font-serif text-[3.4rem] leading-[0.84] sm:text-[5rem]">
                  {club.name}
                </h1>
                <p className="scrawl mt-4 max-w-[26ch] text-[1.5rem] leading-tight text-ink">
                  {club.tagline}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  {next ? (
                    <a href={next.rsvpUrl} target="_blank" rel="noreferrer" className="pill-btn">
                      RSVP on Luma ↗
                    </a>
                  ) : (
                    <Link href="/clubs/apply" className="pill-btn">
                      Join the next session
                    </Link>
                  )}
                  {isCars ? (
                    <a href="#circuit" className="pill-btn-secondary">
                      Circuit specs ↓
                    </a>
                  ) : (
                    <Link href="/clubs/calendar" className="pill-btn-secondary">
                      Calendar
                    </Link>
                  )}
                </div>
              </div>

              {sticker ? (
                <div className="justify-self-start md:justify-self-end">
                  <Sticker
                    src={sticker}
                    alt={`${club.name} sticker`}
                    size={240}
                    rotate={-6}
                    priority
                  />
                </div>
              ) : null}
            </div>
          </Scrap>
        </div>
      </section>

      <div className="mx-auto max-w-[1360px] px-5 pb-20 sm:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-3">
            <ClubNav currentSlug={club.slug} />
          </div>

          <div className="space-y-12 md:col-span-9">
            {/* about + photo */}
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="label">About this club</span>
                <h2 className="mt-3 font-serif text-[2.2rem] leading-[0.95] sm:text-[2.8rem]">
                  {isCars ? "Built for founders who take driving seriously." : "What happens here."}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink">{club.description}</p>

                <dl className="mt-7 grid grid-cols-2 gap-6 border-t border-ink/15 pt-5">
                  <div>
                    <dt className="label">Cadence</dt>
                    <dd className="mt-1.5 font-serif text-[1.5rem] leading-tight">{club.cadence}</dd>
                  </div>
                  <div>
                    <dt className="label">Location</dt>
                    <dd className="mt-1.5 font-serif text-[1.5rem] leading-tight">{club.location}</dd>
                  </div>
                </dl>
              </div>

              <div className="lg:col-span-5">
                <div className="relative bg-white/60 p-3 shadow-[var(--shadow-scrap)]" style={{ transform: "rotate(1.6deg)" }}>
                  <Tape className="-top-4 left-1/2 -translate-x-1/2" rotate={-6} width={92} height={28} />
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-paperdeep">
                    <Image
                      src={club.heroImage}
                      alt={club.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 90vw, 34vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                    Pier 2 field archive · {club.slug}
                  </p>
                </div>
              </div>
            </div>

            {/* itinerary, typewritten */}
            {isCars ? (
              <Scrap tone="news" rotate={-0.8} className="relative px-6 py-8 sm:px-9">
                <Tape className="-left-5 -top-3" rotate={-24} width={104} height={30} />
                <span className="label">Schedule of the day</span>
                <h2 className="mt-3 font-serif text-[2rem] leading-none">Sonoma track day.</h2>
                <ol className="mt-7 space-y-5">
                  {itinerary.map((item) => (
                    <li key={item.time} className="flex items-start gap-5 border-t border-ink/12 pt-4">
                      <span className="w-16 shrink-0 font-mono text-[12px] tnum text-ink-2">
                        {item.time}
                      </span>
                      <div>
                        <h3 className="text-[14px] font-medium text-ink">{item.title}</h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Scrap>
            ) : null}

            {/* RSVP + specs */}
            <div className="grid gap-8 lg:grid-cols-2">
              <RsvpCard club={club} event={next} />

              {isCars ? (
                <div id="circuit" className="scroll-mt-24">
                  <Scrap tone="kraft" rotate={0.9} className="relative h-full px-6 py-7">
                    <Tape className="-right-4 -top-3" rotate={22} width={90} height={26} />
                    <span className="label">Circuit specs</span>
                    <h2 className="mt-2 font-serif text-[1.8rem] leading-none">Sonoma Raceway.</h2>
                    <dl className="mt-5 space-y-2.5 font-mono text-[11.5px]">
                      {specs.map(([term, value]) => (
                        <div
                          key={term}
                          className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-2 last:border-0"
                        >
                          <dt className="text-ink-2">{term}</dt>
                          <dd className="text-right font-medium text-ink">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </Scrap>
                </div>
              ) : (
                <Scrap tone="kraft" rotate={0.9} className="relative h-full px-6 py-7">
                  <Tape className="-right-4 -top-3" rotate={22} width={90} height={26} />
                  <span className="label">Bring</span>
                  <h2 className="mt-2 font-serif text-[1.8rem] leading-none">What you need.</h2>
                  <ul className="mt-4 space-y-2 text-[13px] leading-relaxed text-ink">
                    {checklist.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden>—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Scrap>
              )}
            </div>

            {isCars ? (
              <Scrap tone="cream" rotate={-0.5} className="relative px-6 py-7">
                <span className="label">Driver checklist</span>
                <ul className="mt-4 grid gap-2.5 text-[13px] text-ink sm:grid-cols-2">
                  {checklist.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Scrap>
            ) : null}

            {/* gallery as pinned prints */}
            {club.galleryImages.length > 0 ? (
              <section>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <span className="label">Field archive</span>
                    <h2 className="mt-2 font-serif text-[2.2rem] leading-none sm:text-[2.8rem]">
                      Prints from the last one.
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                    Founders, Inc. media team
                  </span>
                </div>
                <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
                  {club.galleryImages.slice(0, 9).map((image, index) => (
                    <li
                      key={image.src}
                      className="relative bg-white/70 p-2 shadow-[var(--shadow-scrap)]"
                      style={{ transform: `rotate(${index % 2 === 0 ? -1.6 : 1.4}deg)` }}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paperdeep">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(max-width: 640px) 45vw, 30vw"
                          className="object-cover"
                        />
                      </div>
                      {image.caption ? (
                        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
                          {image.caption}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-6">
              <Link
                href="/clubs/overview"
                className="inline-flex min-h-[36px] items-center font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 underline decoration-ink/30 underline-offset-4 hover:text-ink"
              >
                ← Back to the wall
              </Link>
              <Link href="/clubs/apply" className="pill-btn">
                Start another club
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
