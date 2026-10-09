import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClubCollage } from "@/components/club-collage";
import { ClubImage } from "@/components/club-image";
import { ClubNav } from "@/components/club-nav";
import { RsvpCard } from "@/components/rsvp-card";
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
  const description = `${club.tagline} Member-run club at Founders, Inc. Fort Mason, San Francisco. ${club.cadence}, ${club.location}.`;
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
          { src: club.heroImage, alt: `${club.name} at Fort Mason` },
          ...club.galleryImages
            .filter((image) => image.src !== club.heroImage)
            .map((image) => ({ src: image.src, alt: image.alt })),
        ].slice(0, 6)
      : null;

  return (
    <main className="min-h-screen">
      <div className="md:grid md:grid-cols-[16rem_minmax(0,1fr)] md:items-start divide-y md:divide-y-0 md:divide-x divide-[#e5e2da] dark:divide-[#262626]">
        <ClubNav currentSlug={club.slug} />

        <div className="min-w-0">
          {/* Header Strip */}
          <header className="border-b border-[#e5e2da] bg-[#f9f8f5] px-6 py-12 md:px-12 md:py-16 dark:border-[#262626] dark:bg-[#0a0a0a]">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#737373]">
              <Link href="/clubs" className="hover:text-[#0a0a0a] dark:hover:text-[#f9f8f5] transition-colors">
                Clubs
              </Link>
              <span>/</span>
              <span>{club.theme?.tag ?? "Club"}</span>
              <span>/</span>
              <span className="text-[#0a0a0a] dark:text-[#f9f8f5]">
                {club.status === "active" ? "Active Season" : "Incubating"}
              </span>
            </div>

            <div className="mt-6 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] text-[#0a0a0a] dark:text-[#f9f8f5]">
                  {club.name}
                </h1>
                <p className="mt-3 font-mono text-xs uppercase tracking-wider text-[#737373]">
                  {club.tagline}
                </p>
              </div>

              {next ? (
                <div className="border border-[#e5e2da] bg-white p-4 dark:border-[#262626] dark:bg-[#121212] lg:w-80 shrink-0">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#1900ff] dark:text-[#3b82f6]">
                    Next Session
                  </span>
                  <p className="mt-1 font-serif text-lg text-[#0a0a0a] dark:text-[#f9f8f5] truncate">
                    {next.title}
                  </p>
                  <a
                    href={next.rsvpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block text-center border border-[#0a0a0a] bg-[#0a0a0a] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#f9f8f5] hover:bg-[#1900ff] hover:border-[#1900ff] dark:border-[#f9f8f5] dark:bg-[#f9f8f5] dark:text-[#0a0a0a] dark:hover:bg-[#1900ff] dark:hover:text-[#f9f8f5] transition-colors"
                  >
                    Luma RSVP ↗
                  </a>
                </div>
              ) : null}
            </div>
          </header>

          {/* Photography Gallery Strip */}
          <div className="border-b border-[#e5e2da] bg-[#f2efe9] p-6 md:p-12 dark:border-[#262626] dark:bg-[#141414]">
            {collage ? (
              <ClubCollage images={collage} tone={club.slug} />
            ) : (
              <div className="aspect-[16/9] w-full overflow-hidden border border-[#e5e2da] bg-[#f2efe9] dark:border-[#262626] dark:bg-[#1a1a1a]">
                <ClubImage
                  src={club.heroImage}
                  alt={`${club.name} in San Francisco`}
                  label={club.name}
                  tone={club.slug}
                  className="h-full w-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                />
              </div>
            )}
          </div>

          {/* Content Ledger */}
          <div className="p-6 md:p-12 space-y-12 max-w-4xl">
            <section>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                01 / Overview
              </span>
              <p className="mt-4 text-base md:text-lg leading-relaxed text-[#404040] dark:text-[#a3a3a3]">
                {club.description}
              </p>
            </section>

            <section className="border-t border-[#e5e2da] pt-10 dark:border-[#262626]">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                02 / Cadence & Details
              </span>
              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-[#e5e2da] bg-white p-5 dark:border-[#262626] dark:bg-[#121212]">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-[#737373]">Frequency</dt>
                  <dd className="mt-2 font-serif text-2xl text-[#0a0a0a] dark:text-[#f9f8f5]">{club.cadence}</dd>
                </div>
                <div className="border border-[#e5e2da] bg-white p-5 dark:border-[#262626] dark:bg-[#121212]">
                  <dt className="font-mono text-[9px] uppercase tracking-widest text-[#737373]">Location</dt>
                  <dd className="mt-2 font-serif text-2xl text-[#0a0a0a] dark:text-[#f9f8f5]">{club.location}</dd>
                </div>
              </dl>
            </section>

            {club.galleryImages.length > 0 ? (
              <section className="border-t border-[#e5e2da] pt-10 dark:border-[#262626]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                    03 / Documentation Archive
                  </span>
                  <span className="font-mono text-[10px] text-[#737373]">
                    f.inc Media Archive
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {club.galleryImages.map((img) => (
                    <div key={img.src} className="border border-[#e5e2da] bg-white p-2 dark:border-[#262626] dark:bg-[#121212]">
                      <div className="aspect-[3/2] w-full overflow-hidden bg-[#f2efe9] dark:bg-[#1a1a1a]">
                        <ClubImage
                          src={img.src}
                          alt={img.alt}
                          label={img.caption ?? club.name}
                          tone={club.slug}
                          className="h-full w-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                        />
                      </div>
                      {img.caption ? (
                        <p className="mt-2 font-mono text-[10px] text-[#737373] uppercase tracking-wider">
                          {img.caption}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
