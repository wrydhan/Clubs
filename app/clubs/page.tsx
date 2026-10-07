import type { Metadata } from "next";
import Link from "next/link";
import { ClubCard } from "@/components/club-card";
import { sortClubs } from "@/lib/clubs";

export const metadata: Metadata = {
  title: "Clubs in San Francisco",
  description:
    "Member-run clubs at Founders, Inc. in Fort Mason, San Francisco. Car Club is on the calendar. Hardware, basketball, and paintball are coming soon.",
  alternates: { canonical: "/clubs" },
};

export default function ClubsPage() {
  const now = new Date();
  const ordered = sortClubs(now);

  return (
    <main>
      <section className="mx-auto max-w-[1200px] px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Fort Mason, San Francisco</p>
        <h1 className="mt-3 max-w-[12ch] font-serif text-[3.15rem] leading-[0.92] md:text-7xl">The clubs</h1>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {ordered.map((club) => (
            <ClubCard key={club.slug} club={club} now={now} />
          ))}
        </div>
      </section>

      <section className="bg-inverse text-inverse-ink">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-20">
          <div className="max-w-xl">
            <h2 className="font-serif text-4xl leading-[0.95] md:text-6xl">Run the thing you wish existed.</h2>
            <p className="mt-4 text-sm leading-relaxed text-inverse-ink/75">
              If you&apos;ve been holding a group chat together, this is how it becomes a Founders, Inc. club.
            </p>
          </div>
          <Link href="/clubs/apply" className="inline-flex h-12 items-center justify-center bg-inverse-ink px-5 text-[15px] text-inverse">
            Start a club
          </Link>
        </div>
      </section>
    </main>
  );
}
