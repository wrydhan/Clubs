import type { Metadata } from "next";
import { AsciiHero } from "@/components/ascii-hero";
import { ClubCalendar } from "@/components/club-calendar";
import { JsonLd } from "@/components/json-ld";
import { getEvents } from "@/lib/events";
import { eventJsonLd, graph, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getConfirmedPortalEvents, mergeCalendarEvents } from "@/lib/portal/public-events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Founders, Inc. Clubs — calendar",
  description:
    "What's coming up at Founders, Inc. — tournaments, track days, workshops and field days in San Francisco. 3v3 basketball on December 14 at Moscone Rec Center.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Founders, Inc. Clubs — calendar",
    description:
      "Tournaments, track days, workshops and field days at Founders, Inc. in San Francisco.",
  },
};

export default async function Home() {
  const now = new Date();
  // Portal-confirmed events are part of the same calendar: confirm one on
  // /clubs/portal/planning and it lands here with no second entry.
  const events = mergeCalendarEvents(getEvents(now), await getConfirmedPortalEvents(now));

  return (
    <main>
      {/*
        Structured data is built from the same `events` this page renders, so the
        markup can never describe an event a person does not see on screen.
      */}
      <JsonLd data={graph([organizationJsonLd(), websiteJsonLd(), ...eventJsonLd(events)])} />

      <AsciiHero />

      <section
        id="calendar"
        aria-labelledby="calendar-heading"
        className="mx-auto max-w-[1360px] scroll-mt-20 px-5 pb-24 pt-6 sm:px-8 sm:pt-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-6 border-t border-ink/15 pt-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">The calendar</p>
            <h2
              id="calendar-heading"
              className="mt-3 font-serif text-[2.6rem] leading-[0.9] text-ink sm:text-[3.4rem]"
            >
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
