/**
 * Clubs portal — expenses and event-planning data model.
 *
 * Money is stored as integer cents so totals never drift on float math.
 * `null` means "not provided yet" and is never treated as zero: a line with
 * no actual has not cost $0, it just has no invoice against it. Every view
 * that adds money filters nulls out and says so.
 */

export const EXPENSE_CATEGORIES = [
  "venue",
  "production",
  "food-drink",
  "swag",
  "prizes",
  "staffing",
  "marketing",
  "misc",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  venue: "Venue",
  production: "Production",
  "food-drink": "Food & drink",
  swag: "Swag",
  prizes: "Prizes",
  staffing: "Staffing",
  marketing: "Marketing",
  misc: "Misc",
};

/** planned = pencilled in, quoted = vendor number in hand,
    committed = contract signed, paid = money has left. */
export const EXPENSE_STATUSES = ["planned", "quoted", "committed", "paid"] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export const EVENT_STATUSES = [
  "planning",
  "confirmed",
  "locked",
  "live",
  "done",
  "cancelled",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

/** Integer cents. */
export type Money = number;

export type Expense = {
  id: string;
  /** null = campus overhead / not tied to one event. */
  eventId: string | null;
  category: ExpenseCategory;
  lineItem: string;
  vendor?: string;
  budgeted: Money | null;
  actual: Money | null;
  status: ExpenseStatus;
  note?: string;
  updatedAt: string;
};

export type PlannedEvent = {
  id: string;
  name: string;
  /** Pacific calendar date, YYYY-MM-DD. */
  date: string;
  /** Pacific wall clock, HH:MM 24h. */
  startTime: string;
  endTime: string;
  venue: string;
  room?: string;
  owner: string;
  status: EventStatus;
  /** Free text on purpose: "20 teams", "120 guests". */
  attendance?: string;
  /** Whole-event budget cap, when one has been agreed. */
  budgetTotal: Money | null;
  notes?: string;
  updatedAt: string;
};

export type ExpenseTotals = {
  /** Sum of non-null budgeted lines. */
  budgeted: Money;
  /** Sum of non-null actual lines. */
  actual: Money;
  /** actual - budgeted, over the lines that have both. */
  variance: Money;
  lineCount: number;
  /** Lines with no budget figure at all. */
  unbudgetedCount: number;
  /** Lines with no actual/invoice figure yet. */
  unspentCount: number;
};

export type CategoryRollup = ExpenseTotals & {
  category: ExpenseCategory;
  label: string;
};

export type EventRollup = ExpenseTotals & {
  eventId: string | null;
  name: string;
  status: EventStatus | "overhead";
  budgetTotal: Money | null;
  /** budgetTotal - budgeted, null when either side is unknown. */
  headroom: Money | null;
};
