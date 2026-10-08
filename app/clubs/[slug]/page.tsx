import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClubCollage } from "@/components/club-collage";
import { ClubImage } from "@/components/club-image";
import { ClubNav } from "@/components/club-nav";
import { RsvpCard } from "@/components/rsvp-card";
import { getClub, getClubs, getNextEvent } from "@/lib/clubs";
import { subscribeUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getClubs().map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = getClub(slug);
  if (!club) return { title: "Club" };
  const title = `${club.name} — Founders, Inc. Clubs`;
  const description = `${club.tagline} ${club.name} is a member-run club at Founders, Inc. Fort Mason, San Francisco — ${club.cadence}, ${club.location}.`;
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
  const collage =
    club.galleryImages.length >= 4
      ? [
          { src: club.heroImage, alt: `${club.name} in San Francisco` },
          ...club.galleryImages
            .filter((image) => image.src !== club.heroImage)
            .map((image) => ({ src: image.src, alt: image.alt })),
        ].slice(0, 6)
      : null;

  const jsonLd = next
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${club.name}: ${next.title}`,
        description: next.description,
        startDate: next.datetime,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: next.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: next.location.includes("Sonoma")
              ? "Sonoma"
              : next.location.includes("Thunderhill")
                ? "Willows"
                : "San Francisco",
            addressRegion: "CA",
            addressCountry: "US",
          },
        },
        organizer: {
          "@type": "Organization",
          name: "Founders, Inc.",
          url: "https://f.inc",
        },
        url: next.rsvpUrl,
      }
    : null;

  return (
    <main className="min-h-screen">
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}

      <div className="md:grid md:grid-cols-[16rem_minmax(0,1fr)] md:items-start">
        <ClubNav currentSlug={club.slug} />

        <div className="min-w-0">
          {/* Hero Banner with f.inc Editorial Header */}
          <div className="relative">
            <header className="relative h-[320px] sm:h-[400px] md:h-[68vh] min-h-[380px] overflow-hidden bg-paper-subtle">
              {collage ? (
                <ClubCollage images={collage} tone={club.slug} />
              ) : (
                <ClubImage
                  src={club.heroImage}
                  alt={`${club.name} in San Francisco`}
                  label={club.name}
                  tone={club.slug}
                  mark="corner"
                  priority
                  sizes="100vw"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12 md:pr-[25rem]">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">
                  <span>Founders, Inc.</span>
                  <span>·</span>
                  <span>Fort Mason</span>
                  {club.status === "coming-soon" ? (
                    <span className="ml-2 rounded-sm bg-chip px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="ml-2 flex items-center gap-1.5 rounded-sm bg-white/20 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  )}
                </div>
                <h1 className="mt-3 font-serif text-[3.2rem] leading-[0.92] text-white sm:text-6xl md:text-7xl">
                  {club.name}
                </h1>
                <p className="mt-3 max-w-xl font-serif text-xl italic leading-snug text-white/90 md:text-2xl">
                  {club.tagline}
                </p>
              </div>
            </header>

            {/* RSVP Floating Card */}
            <div className="relative z-10 px-6 pt-6 md:absolute md:bottom-8 md:right-8 md:w-[23rem] md:px-0 md:pt-0">
              <RsvpCard club={club} event={next} />
            </div>
          </div>

          {/* Details Body */}
          <div className="mx-auto flex max-w-[1000px] flex-col gap-14 px-6 py-12 md:px-12 md:py-16">
            <section className="border-b border-line pb-10">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">01 / The Concept</h2>
              <p className="mt-4 max-w-3xl font-sans text-xl leading-relaxed text-ink-secondary">
                {club.description}
              </p>
            </section>

            <section className="border-b border-line pb-10">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">02 / Logistics</h2>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="border border-line bg-card p-5 rounded-sm">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Cadence</dt>
                  <dd className="mt-2 font-serif text-3xl text-ink leading-tight">{club.cadence}</dd>
                </div>
                <div className="border border-line bg-card p-5 rounded-sm">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">Location</dt>
                  <dd className="mt-2 font-serif text-2xl text-ink leading-tight">{club.location}</dd>
                </div>
              </dl>
            </section>

            {club.lead ? (
              <section className="border-b border-line pb-10">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">03 / Club Lead</h2>
                <div className="mt-6 flex items-center gap-5 border border-line bg-card p-5 rounded-sm max-w-md">
                  <ClubImage
                    src={club.lead.photo}
                    alt={club.lead.name}
                    label={club.lead.name}
                    tone="lead"
                    mark="initials"
                    sizes="64px"
                    className="h-16 w-16 shrink-0 rounded-full"
                  />
                  <div>
                    <p className="font-serif text-2xl leading-none text-ink">{club.lead.name}</p>
                    <p className="mt-1 font-mono text-xs text-muted uppercase tracking-wider">{club.lead.role}</p>
                    <a
                      href={`mailto:${club.lead.contact}`}
                      className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      {club.lead.contact} ↗
                    </a>
                  </div>
                </div>
              </section>
            ) : null}

            {club.status === "active" ? (
              <section className="border-b border-line pb-10">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">04 / Past Sessions</h2>
                  {club.galleryImages.length > 0 ? (
                    <span className="font-mono text-xs text-muted">Documented by f.inc Media</span>
                  ) : null}
                </div>
                {club.galleryImages.length === 0 ? (
                  <p className="mt-6 border border-line bg-card px-6 py-10 text-sm text-muted text-center rounded-sm">
                    No session photos uploaded yet. Upcoming track day will be documented on site.
                  </p>
                ) : (
                  <ul className="-mx-6 mt-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
                    {club.galleryImages.map((image) => (
                      <li key={image.src} className="w-[78%] shrink-0 snap-start md:w-auto">
                        <div className="overflow-hidden border border-line bg-paper-subtle rounded-sm">
                          <ClubImage
                            src={image.src}
                            alt={image.alt}
                            label={image.caption ?? club.name}
                            tone={club.slug}
                            className="aspect-[3/2] w-full object-cover"
                            sizes="(max-width: 768px) 78vw, 30vw"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between font-mono text-xs text-muted">
                          <span>{image.caption ?? club.name}</span>
                          {image.headcount != null ? <span>{image.headcount} drivers</span> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {club.chat === "whatsapp" ? (
              <section className="border border-line bg-card p-6 md:p-8 rounded-sm">
                <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Direct Comms
                </div>
                <h2 className="mt-2 font-serif text-3xl leading-none text-ink">Member WhatsApp Channel</h2>
                <p className="mt-3 max-w-lg text-sm text-ink-secondary leading-relaxed font-sans">
                  Private communication channel for drivers, car prep, and convoy logistics. Maintained by club leads for verified attendees. No public invite link.
                </p>
                {club.lead ? (
                  <a
                    href={`mailto:${club.lead.contact}?subject=Request%20WhatsApp%20Invite%20for%20${encodeURIComponent(club.name)}`}
                    className="mt-6 inline-flex h-11 items-center justify-center bg-ink px-6 text-xs font-mono uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm"
                  >
                    Request WhatsApp Access from {club.lead.name.split(" ")[0]} →
                  </a>
                ) : null}
              </section>
            ) : null}

            {club.status === "coming-soon" ? (
              <section className="border border-line bg-card p-6 md:p-8 rounded-sm">
                <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  In Incubation
                </div>
                <h2 className="mt-2 font-serif text-3xl leading-none text-ink">Schedule Finalizing Soon</h2>
                <p className="mt-3 max-w-lg text-sm text-ink-secondary leading-relaxed font-sans">
                  We are setting up court and facility access at Fort Mason. Subscribe to be notified when registration opens.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/clubs/cars"
                    className="inline-flex h-11 items-center justify-center bg-ink px-6 text-xs font-mono uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm"
                  >
                    Explore Car Club →
                  </Link>
                  <a
                    href={subscribeUrl}
                    className="inline-flex h-11 items-center justify-center border border-line px-6 text-xs font-mono uppercase tracking-wider text-ink hover:border-ink transition-colors rounded-sm"
                  >
                    Subscribe to Updates
                  </a>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
