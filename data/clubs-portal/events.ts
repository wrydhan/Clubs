/**
 * The only Clubs events that are allowed to put people in the portal.
 *
 * Waleed's rule (2026-11-24): the people/funnel data is built from the three
 * Clubs events — Track Day, the 3v3 Basketball Tournament and the Holiday
 * Party — and nothing else. Fireside, Night Hack and the Blueprint events are
 * f.inc programme events, not Clubs events, so their guests are not in here.
 *
 * `sourceFile` names the Luma guest export the rows came from. `null` means no
 * export is on file yet: the event is still listed (so it reads as "no data"
 * rather than "not a Clubs event") but it contributes zero rows.
 */
export interface ClubsEvent {
  /** Slug written into `Person.events` by scripts/import-people.mjs. */
  slug: string;
  label: string;
  sourceFile: string | null;
}

export const CLUBS_EVENTS: readonly ClubsEvent[] = [
  {
    slug: "track-day",
    label: "Track Day",
    sourceFile: null,
  },
  {
    slug: "basketball-3v3",
    label: "3v3 Basketball Tournament",
    sourceFile:
      "Founders, Inc. Basketball Tournament - Guests - 2026-11-19-00-00-49.csv",
  },
  {
    slug: "holiday-party",
    label: "Holiday Party",
    sourceFile: null,
  },
] as const;

/** Slugs the people dataset may carry. Anything else is dropped on load. */
export const CLUBS_EVENT_SLUGS: ReadonlySet<string> = new Set(
  CLUBS_EVENTS.map((event) => event.slug),
);

/** Display label for an event slug; unknown slugs fall back to the slug. */
export const CLUBS_EVENT_LABELS: Record<string, string> = Object.fromEntries(
  CLUBS_EVENTS.map((event) => [event.slug, event.label]),
);

export function clubsEventLabel(slug: string): string {
  return CLUBS_EVENT_LABELS[slug] ?? slug;
}

/** Human-readable event list for a person row. */
export function clubsEventLabels(slugs: readonly string[]): string[] {
  return slugs.map(clubsEventLabel);
}
