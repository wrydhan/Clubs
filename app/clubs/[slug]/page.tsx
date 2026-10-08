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
  const title = `${club.name} San Francisco`;
  const description = `${club.tagline} ${club.name} is a Founders, Inc. club in San Francisco — ${club.cadence}, ${club.location}.`;
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
    <main>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}

      <div className="md:grid md:grid-cols-[13.5rem_minmax(0,1fr)] md:items-start">
      <ClubNav currentSlug={club.slug} />
      <div>
      <div className="relative">
        <header className="relative h-[260px] sm:h-[320px] md:h-[68vh]">
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
              className="h-full w-full"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-10 md:pr-[26rem]">
            <div className="flex items-center gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/75">San Francisco</p>
              {club.status === "coming-soon" ? (
                <span className="bg-chip px-1.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                  Coming soon
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 max-w-[12ch] font-serif text-[2.6rem] leading-[0.92] md:text-7xl">{club.name}</h1>
            <p className="mt-2 max-w-md font-serif text-lg italic leading-snug text-white/85 md:text-2xl">
              {club.tagline}
            </p>
          </div>
        </header>
        <div className="relative z-10 px-5 pt-4 md:absolute md:bottom-8 md:right-8 md:w-[22rem] md:px-0 md:pt-0">
          <RsvpCard club={club} event={next} />
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 py-10 md:px-8 md:py-16">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted">What it is</h2>
            <p className="mt-3 max-w-[40rem] text-lg leading-relaxed">{club.description}</p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted">When and where</h2>
            <dl className="mt-4 grid gap-6 border-t border-line pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted">Cadence</dt>
                <dd className="mt-1 font-serif text-2xl leading-tight">{club.cadence}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Where</dt>
                <dd className="mt-1 font-serif text-2xl leading-tight">{club.location}</dd>
              </div>
            </dl>
          </section>

          {club.lead ? (
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted">Who runs it</h2>
              <div className="mt-4 flex items-center gap-4">
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
                  <p className="font-serif text-2xl leading-none">{club.lead.name}</p>
                  <p className="mt-1 text-sm text-muted">{club.lead.role}</p>
                  <a href={`mailto:${club.lead.contact}`} className="mt-1 inline-block text-sm underline underline-offset-4">
                    {club.lead.contact}
                  </a>
                </div>
              </div>
            </section>
          ) : null}

          {club.status === "active" ? (
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted">Past sessions</h2>
            {club.galleryImages.length > 0 ? (
              <p className="mt-3 text-sm text-muted">Last time out, at Thunderhill.</p>
            ) : null}
            {club.galleryImages.length === 0 ? (
              <p className="mt-4 border border-line px-4 py-8 text-sm text-muted">
                No photos yet. This club hasn&apos;t been shot.
              </p>
            ) : (
              <ul className="-mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
                {club.galleryImages.map((image) => (
                  <li key={image.src} className="w-[72%] shrink-0 snap-start md:w-auto">
                    <ClubImage
                      src={image.src}
                      alt={image.alt}
                      label={image.caption ?? club.name}
                      tone={club.slug}
                      className="aspect-[3/2] w-full"
                      sizes="(max-width: 768px) 72vw, 30vw"
                    />
                    <p className="mt-2 text-xs text-muted">
                      {image.caption ? `${image.caption}` : null}
                      {image.caption && image.headcount != null ? " · " : null}
                      {image.headcount != null ? `${image.headcount} people` : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          ) : null}

          {club.chat === "whatsapp" ? (
            <section className="border border-line p-5">
              <h2 className="font-serif text-3xl leading-none">Group chat</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                WhatsApp. Ask the president. They add you if it fits. There is no public link.
              </p>
              {club.lead ? (
                <a href={`mailto:${club.lead.contact}`} className="mt-5 inline-flex h-12 items-center justify-center bg-ink px-5 text-[15px] text-paper">
                  Ask {club.lead.name.split(" ")[0]}
                </a>
              ) : null}
            </section>
          ) : null}

          {club.status === "coming-soon" ? (
          <section className="border border-line p-5">
            <h2 className="font-serif text-3xl leading-none">Not running yet.</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Nothing to join yet. The calendar has Car Club, and this page will get a date when someone is actually running it.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/clubs/cars" className="inline-flex h-12 items-center justify-center bg-ink px-5 text-[15px] text-paper">
                See Car Club
              </Link>
              <a href={subscribeUrl} className="inline-flex h-12 items-center justify-center border border-line px-5 text-[15px]">
                All clubs
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
