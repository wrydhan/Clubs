import type { Metadata } from "next";
import { AsciiHero } from "@/components/ascii-hero";
import { ClubCalendar } from "@/components/club-calendar";
import { getEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Founders, Inc. Clubs — Calendar",
  description:
    "What's coming up at Founders, Inc. — tournaments, track days, workshops and field days in San Francisco.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Founders, Inc. Clubs — Calendar",
    description:
      "Tournaments, track days, workshops and field days at Founders, Inc. in San Francisco.",
    url: "/",
  },
};

export default function Home() {
  const now = new Date();
  const events = getEvents(now);

  return (
    <main>
      <AsciiHero />

      <section id="calendar" className="mx-auto max-w-[1360px] scroll-mt-20 px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-ink/15 pt-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">The calendar</p>
            <h2 className="mt-3 font-serif text-[2.6rem] leading-[0.9] text-ink sm:text-[3.4rem]">
              What&apos;s coming up.
            </h2>
          </div>
        </div>

        <div className="mt-12">
          <ClubCalendar events={events} todayIso={now.toISOString()} />
        </div>
      </section>
    </main>
  );
}
