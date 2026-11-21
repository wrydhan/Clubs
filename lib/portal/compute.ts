import {
  CATEGORY_LABEL,
  EXPENSE_CATEGORIES,
  type CategoryRollup,
  type EventRollup,
  type Expense,
  type ExpenseTotals,
  type Money,
  type PlannedEvent,
} from "@/lib/portal/types";

/**
 * Pure roll-up maths. No fs, no React — safe to import in a client component.
 *
 * Rule that matters: a `null` figure is unknown, not zero. It is skipped in
 * every sum and counted separately, so "budgeted $1,440 across 6 lines, 5
 * still unquoted" can never read as a complete budget.
 */

export function summarize(rows: Expense[]): ExpenseTotals {
  let budgeted = 0;
  let actual = 0;
  let variance = 0;
  let unbudgetedCount = 0;
  let unspentCount = 0;

  for (const row of rows) {
    if (row.budgeted == null) unbudgetedCount += 1;
    else budgeted += row.budgeted;

    if (row.actual == null) unspentCount += 1;
    else actual += row.actual;

    if (row.budgeted != null && row.actual != null) variance += row.actual - row.budgeted;
  }

  return { budgeted, actual, variance, lineCount: rows.length, unbudgetedCount, unspentCount };
}

export function rollupByCategory(rows: Expense[]): CategoryRollup[] {
  const buckets = new Map<string, Expense[]>();
  for (const row of rows) {
    const list = buckets.get(row.category) ?? [];
    list.push(row);
    buckets.set(row.category, list);
  }
  return EXPENSE_CATEGORIES.filter((category) => buckets.has(category)).map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    ...summarize(buckets.get(category)!),
  }));
}

export function rollupByEvent(rows: Expense[], events: PlannedEvent[]): EventRollup[] {
  const byEvent = new Map<string, Expense[]>();
  const overhead: Expense[] = [];
  const eventIds = new Set(events.map((event) => event.id));

  for (const row of rows) {
    if (row.eventId == null || !eventIds.has(row.eventId)) {
      // An expense pointing at a deleted event is overhead, not lost data.
      overhead.push(row);
      continue;
    }
    const list = byEvent.get(row.eventId) ?? [];
    list.push(row);
    byEvent.set(row.eventId, list);
  }

  const out: EventRollup[] = events.map((event) => {
    const totals = summarize(byEvent.get(event.id) ?? []);
    return {
      eventId: event.id,
      name: event.name,
      status: event.status,
      budgetTotal: event.budgetTotal,
      headroom: event.budgetTotal == null ? null : event.budgetTotal - totals.budgeted,
      ...totals,
    };
  });

  if (overhead.length > 0) {
    out.push({
      eventId: null,
      name: "Campus overhead",
      status: "overhead",
      budgetTotal: null,
      headroom: null,
      ...summarize(overhead),
    });
  }

  return out;
}

/** "$1,440" / "$1,440.50" / "—" for unknown. */
export function formatMoney(cents: Money | null): string {
  if (cents == null) return "—";
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rest = abs % 100;
  const whole = dollars.toLocaleString("en-US");
  return rest === 0 ? `${sign}$${whole}` : `${sign}$${whole}.${String(rest).padStart(2, "0")}`;
}

export function formatVariance(cents: Money): string {
  if (cents === 0) return "$0";
  return `${cents > 0 ? "+" : ""}${formatMoney(cents)}`;
}

/** "1,440.50" / "$1440" / "" -> cents. Throws a message the form can show. */
export function parseMoneyInput(raw: string): Money | null {
  const trimmed = raw.trim().replace(/[$,\s]/g, "");
  if (trimmed === "") return null;
  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error(`"${raw}" is not an amount of money`);
  }
  return Math.round(Number(trimmed) * 100);
}

export function parsePercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.min(1, numerator / denominator);
}

export function nextEvent(events: PlannedEvent[], now = new Date()): PlannedEvent | undefined {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return events
    .filter((event) => event.status !== "cancelled" && event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}
