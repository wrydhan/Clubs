import { pacificToUtc } from "@/lib/dates";
import type { SiteEvent } from "@/lib/events";
import { readEvents } from "@/lib/portal/store";

/**
 * Confirmed portal events on the public calendar.
 *
 * The portal's planning tab and the public page must not drift: an event marked
 * `confirmed` in `/portal/planning` shows up on the main-page calendar with
 * no second entry anywhere. Same file, same rows.
 *
 * Only `confirmed` (and later-stage: locked / live) events are published. A date
 * still in `planning` is internal until someone confirms it.
 */

const PUBLISHED_STATUSES = new Set(["confirmed", "locked", "live"]);

function toSiteEvent(event: {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  room?: string;
  status: string;
  notes?: string;
  attendance?: string;
}): SiteEvent | null {
  const [year, month, day] = event.date.split("-").map(Number);
  const [startHour, startMinute] = event.startTime.split(":").map(Number);
  const [endHour, endMinute] = event.endTime.split(":").map(Number);
  if (!year || !month || !day || Number.isNaN(startHour) || Number.isNaN(startMinute)) return null;

  const start = pacificToUtc(year, month, day, startHour, startMinute);
  const end =
    Number.isNaN(endHour) || Number.isNaN(endMinute)
      ? undefined
      : pacificToUtc(year, month, day, endHour, endMinute).toISOString();

  const facts = [
    { label: "Status", value: event.status },
    event.attendance ? { label: "Attendance", value: event.attendance } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return {
    id: `portal:${event.id}`,
    title: event.name,
    kind: "Club event",
    location: event.room ? `${event.venue}, ${event.room}` : event.venue,
    description: event.notes ?? "",
    facts,
    datetime: start.toISOString(),
    endDatetime: end,
  };
}

/** Pacific calendar day of an ISO instant, e.g. "2026-12-14". */
function pacificDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** Confirmed portal events, mapped to the public calendar's shape. */
export async function getConfirmedPortalEvents(now = new Date()): Promise<SiteEvent[]> {
  const events = await readEvents();
  const falloff = 10 * 60 * 60 * 1000;
  return events
    .filter((event) => PUBLISHED_STATUSES.has(event.status))
    .map(toSiteEvent)
    .filter((event): event is SiteEvent => event !== null)
    .filter((event) => new Date(event.datetime).getTime() + falloff >= now.getTime())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

/**
 * Merge the hand-written seeds with the portal's confirmed events.
 *
 * A seed already describes the same date with its RSVP link and copy, so the
 * seed wins on a date the portal also lists — the calendar never shows the same
 * day twice.
 */
export function mergeCalendarEvents(seeds: SiteEvent[], portal: SiteEvent[]): SiteEvent[] {
  const seedDays = new Set(seeds.map((event) => pacificDay(event.datetime)));
  return [...seeds, ...portal.filter((event) => !seedDays.has(pacificDay(event.datetime)))].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );
}
