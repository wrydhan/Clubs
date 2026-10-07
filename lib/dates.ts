/** Wall-clock helpers for America/Los_Angeles. Events are always Pacific time. */

export const TIME_ZONE = "America/Los_Angeles";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type YMD = { year: number; month: number; day: number };

export type LAParts = YMD & {
  hour: number;
  minute: number;
  weekday: (typeof WEEKDAY_SHORT)[number];
};

export function laParts(date: Date): LAParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0;
  const weekday = get("weekday") as LAParts["weekday"];
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour,
    minute: Number(get("minute")),
    weekday,
  };
}

export function addCalendarDays(year: number, month: number, day: number, days: number): YMD {
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

/** Interpret a Pacific wall-clock time as a UTC instant. */
export function pacificToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const parts = laParts(utcGuess);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
  const offset = asUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offset);
}

export function addCalendarWeeks(date: Date, weeks: number): Date {
  if (weeks === 0) return date;
  const parts = laParts(date);
  const next = addCalendarDays(parts.year, parts.month, parts.day, weeks * 7);
  return pacificToUtc(next.year, next.month, next.day, parts.hour, parts.minute);
}

/**
 * Next time this weekday happens at hour:minute Pacific.
 * An event that started within `graceMs` still counts, so a reel posted
 * during the session doesn't land on an empty page.
 */
export function nextOccurrence(
  weekday: number,
  hour: number,
  minute: number,
  from = new Date(),
  graceMs = 2 * 60 * 60 * 1000,
): Date {
  const today = laParts(from);
  const todayIndex = WEEKDAY_SHORT.indexOf(today.weekday);
  if (todayIndex < 0) {
    throw new Error(`Unexpected weekday token: ${today.weekday}`);
  }
  const delta = (weekday - todayIndex + 7) % 7;
  let ymd = addCalendarDays(today.year, today.month, today.day, delta);
  let result = pacificToUtc(ymd.year, ymd.month, ymd.day, hour, minute);
  if (result.getTime() + graceMs < from.getTime()) {
    ymd = addCalendarDays(ymd.year, ymd.month, ymd.day, 7);
    result = pacificToUtc(ymd.year, ymd.month, ymd.day, hour, minute);
  }
  return result;
}

export function startOfWeekMonday(date: Date): YMD {
  const parts = laParts(date);
  const index = WEEKDAY_SHORT.indexOf(parts.weekday);
  const delta = index === 0 ? -6 : 1 - index;
  return addCalendarDays(parts.year, parts.month, parts.day, delta);
}

export function sameYmd(a: YMD, b: YMD): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function ymdKey(value: YMD): string {
  return `${value.year}-${value.month}-${value.day}`;
}

export function compareYmd(a: YMD, b: YMD): number {
  return ymdKey(a).localeCompare(ymdKey(b), "en", { numeric: true });
}
