import { pacificToUtc } from "@/lib/dates";

/**
 * Founders, Inc. club events.
 *
 * Events are defined inline here — the fastest path to a live page, and the
 * single source the calendar reads. To add an event, add an object to
 * `eventSeeds`. Dates are Pacific wall-clock; the calendar converts them.
 *
 * No per-club split, no filter chips: every event belongs to the club.
 */

export type EventSeed = {
  id: string;
  title: string;
  /** e.g. "3v3 Basketball Tournament" */
  kind: string;
  location: string;
  /** Verified RSVP target, if one exists. Omit rather than invent a dead link. */
  rsvpUrl?: string;
  description: string;
  /** Flat facts shown as spec chips (teams, players, prize…). */
  facts?: { label: string; value: string }[];
} & (
  | {
      /** A real date. Drops off the calendar after the day ends. */
      date: { year: number; month: number; day: number; hour: number; minute: number };
      endHour?: number;
    }
  | {
      /** 0 Sunday … 6 Saturday */
      weekday: number;
      hour: number;
      minute: number;
      /** Weeks after the next occurrence. 0 is the soonest one. */
      weekOffset: number;
    }
);

export type SiteEvent = {
  id: string;
  title: string;
  kind: string;
  location: string;
  rsvpUrl?: string;
  description: string;
  facts: { label: string; value: string }[];
  /** ISO instants (UTC) for start, and end when known. */
  datetime: string;
  endDatetime?: string;
};

export const eventSeeds: EventSeed[] = [
  {
    id: "hoops-3v3-2026-12-14",
    title: "3v3 Basketball Tournament",
    kind: "Tournament",
    location: "Moscone Rec Center · 1800 Chestnut St, San Francisco",
    rsvpUrl: "https://luma.com/finc-basketball",
    description:
      "Founders, Inc. Hoops Club takes over Moscone Rec Center for a single-elimination 3v3 tournament. Twenty teams of three, sixty players, a mystery grand prize on the line. Games run 6:00–10:00 PM. Bring a squad or come watch — courtside is open to the campus.",
    facts: [
      { label: "Format", value: "3v3 · 20 teams" },
      { label: "Players", value: "60" },
      { label: "Prize", value: "Mystery grand prize" },
      { label: "Doors", value: "6:00–10:00 PM" },
    ],
    date: { year: 2026, month: 12, day: 14, hour: 18, minute: 0 },
    endHour: 22,
  },
];

function seedStart(seed: EventSeed): Date {
  // Only real dates are used for now; recurring seeds can be added later.
  if ("date" in seed) {
    return pacificToUtc(seed.date.year, seed.date.month, seed.date.day, seed.date.hour, seed.date.minute);
  }
  // Fallback for a recurring seed: nearest future occurrence of that weekday.
  const now = new Date();
  const base = pacificToUtc(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), seed.hour, seed.minute);
  const dayMs = 24 * 60 * 60 * 1000;
  const delta = (seed.weekday - base.getUTCDay() + 7) % 7;
  return new Date(base.getTime() + (delta + seed.weekOffset * 7) * dayMs);
}

export function getEvents(now = new Date()): SiteEvent[] {
  return eventSeeds
    .flatMap((seed) => {
      const start = seedStart(seed);
      // Drop an event once its day is over (10h after start).
      if (start.getTime() + 10 * 60 * 60 * 1000 < now.getTime()) return [];
      const endDatetime =
        "date" in seed && seed.endHour !== undefined
          ? pacificToUtc(seed.date.year, seed.date.month, seed.date.day, seed.endHour, 0).toISOString()
          : undefined;
      return [
        {
          id: seed.id,
          title: seed.title,
          kind: seed.kind,
          location: seed.location,
          rsvpUrl: seed.rsvpUrl,
          description: seed.description,
          facts: seed.facts ?? [],
          datetime: start.toISOString(),
          endDatetime,
        } satisfies SiteEvent,
      ];
    })
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}
