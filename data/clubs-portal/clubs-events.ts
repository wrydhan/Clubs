import type { Person } from "@/lib/clubs-portal/people/types";
import { lumaImports, type LumaImport } from "@/data/clubs-portal/luma-imports";

/**
 * The only events the Clubs portal people data is allowed to draw from.
 *
 * Waleed's rule (24 Nov 2026): the people dashboard is about Clubs events —
 * the track day, the 3v3 basketball tournament and the holiday party. Nothing
 * else (Fireside, Night Hack, Blueprint Demo Day, Blueprint Preview…) belongs
 * in `people.seed.ts`, no matter how many rows an old export had.
 *
 * `scripts/import-people.mjs` refuses any slug that is not in
 * `CLUBS_EVENT_SLUGS` below, so a stray export cannot reintroduce an event.
 *
 * An event with no export yet stays at 0 rows and is labelled as awaiting an
 * export — a compiler of this file must never invent rows for it.
 */
export type ClubsEventSlug = "track-day" | "basketball-3v3" | "holiday-party";

export const CLUBS_EVENT_SLUGS: readonly ClubsEventSlug[] = [
  "track-day",
  "basketball-3v3",
  "holiday-party",
] as const;

export interface ClubsEventDefinition {
  slug: ClubsEventSlug;
  name: string;
  /** ISO date, only when it is known. Track day's date was never recorded. */
  date?: string;
  venue?: string;
  /** The Luma guest export this event needs before it can carry rows. */
  expectedExport: string;
}

export const clubsEvents: readonly ClubsEventDefinition[] = [
  {
    slug: "track-day",
    name: "Track Day",
    expectedExport: "Luma guest export for the track day (CSV)",
  },
  {
    slug: "basketball-3v3",
    name: "3v3 Basketball Tournament",
    date: "2026-12-14",
    venue: "Moscone Rec Center",
    expectedExport: "Luma guest export for the 3v3 tournament (CSV)",
  },
  {
    slug: "holiday-party",
    name: "Founders, Inc. Holiday Party",
    date: "2026-12-17",
    venue: "Fort Mason Center, Building C",
    expectedExport: "Luma guest export for the holiday party (CSV)",
  },
];

export type ClubsEventExportState = "imported" | "awaiting_export";

export interface ClubsEventCoverage extends ClubsEventDefinition {
  /** People in the dataset whose events list includes this slug. */
  rows: number;
  state: ClubsEventExportState;
  detail: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "America/Los_Angeles",
});

/** Rows per Clubs event, merged with whether an export has actually landed. */
export function clubsEventCoverage(
  people: Person[],
  imports: LumaImport[] = lumaImports,
): ClubsEventCoverage[] {
  return clubsEvents.map((event) => {
    const imported = imports.find((entry) => entry.slug === event.slug);
    const rows = people.filter((person) => person.events.includes(event.slug)).length;
    if (!imported) {
      return {
        ...event,
        rows: 0,
        state: "awaiting_export" as const,
        detail: `No export received yet — this reads 0 because nothing was imported, not because nobody signed up. Send ${event.expectedExport}.`,
      };
    }
    const when = dateFormatter.format(new Date(imported.importedAt));
    return {
      ...event,
      rows,
      state: "imported" as const,
      detail: `${rows} ${rows === 1 ? "person" : "people"} from ${imported.file} (${imported.ticketRows} ticket rows, imported ${when}).`,
    };
  });
}
