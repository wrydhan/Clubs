import { laParts, TIME_ZONE, type YMD } from "@/lib/dates";

function format(iso: string | Date, options: Intl.DateTimeFormatOptions): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...options }).format(date);
}

export function formatWeekday(iso: string): string {
  return format(iso, { weekday: "short" });
}

export function formatDay(iso: string): string {
  return format(iso, { day: "numeric" });
}

export function formatTime(iso: string): string {
  return format(iso, { hour: "numeric", minute: "2-digit" }).replace(" ", "").toLowerCase();
}

export function formatMonthDay(iso: string | Date): string {
  return format(iso, { month: "short", day: "numeric" });
}

export function formatFullDate(iso: string): string {
  return format(iso, { weekday: "short", month: "short", day: "numeric" });
}

export function formatMonth(year: number, month: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1, 12));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatYmd(value: YMD): string {
  const date = new Date(Date.UTC(value.year, value.month - 1, value.day, 12));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function laYmdFromIso(iso: string): YMD {
  const parts = laParts(new Date(iso));
  return { year: parts.year, month: parts.month, day: parts.day };
}
