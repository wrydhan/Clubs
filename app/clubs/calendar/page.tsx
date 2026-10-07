import type { Metadata } from "next";
import { CalendarView, type CalendarEvent } from "@/components/calendar-view";
import { getClubs, getEvents } from "@/lib/clubs";
import { subscribeUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Club Calendar San Francisco",
  description:
    "The Founders, Inc. club calendar in San Francisco. See what's scheduled and subscribe.",
  alternates: { canonical: "/clubs/calendar" },
};

export default function CalendarPage() {
  const now = new Date();
  const clubs = getClubs();
  const events: CalendarEvent[] = getEvents(now).map((event) => ({
    ...event,
    clubName: clubs.find((club) => club.slug === event.clubSlug)?.name ?? event.clubSlug,
  }));

  return (
    <main>
      <section className="bg-inverse text-inverse-ink">
        <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-8 md:py-16">
          <p className="text-[11px] uppercase tracking-[0.18em] text-inverse-ink/60">San Francisco</p>
          <h1 className="mt-3 font-serif text-[3.2rem] leading-[0.92] md:text-7xl">Calendar</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-inverse-ink/75">
            What&apos;s scheduled. Subscribe if you want the next one in your inbox.
          </p>
          <a
            href={subscribeUrl}
            className="mt-6 inline-flex h-12 items-center bg-inverse-ink px-5 text-[15px] text-inverse"
          >
            Subscribe
          </a>
        </div>
      </section>
      <CalendarView
        events={events}
        clubs={clubs.filter((club) => club.status === "active").map((club) => ({ slug: club.slug, name: club.name }))}
        todayIso={now.toISOString()}
      />
    </main>
  );
}
