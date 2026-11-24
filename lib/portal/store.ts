import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { SEED_EVENTS, SEED_EXPENSES } from "@/lib/portal/seed";
import { EXPENSE_CATEGORIES, EVENT_STATUSES, type Expense, type PlannedEvent } from "@/lib/portal/types";

/**
 * Server-only file store for the portal's planning data.
 *
 * Two JSON files under data/portal/ are the source of truth: they are seeded
 * from lib/portal/seed.ts on first read, then written by the API routes.
 *
 * Deliberate limits, so nobody assumes more than it does:
 *  - One file each, whole-file writes with a temp-file rename. That is safe for
 *    one operator editing a dozen rows; it is not a database. Swap this module
 *    for Postgres behind the same function signatures when it needs to be.
 *  - On a serverless host the filesystem is not durable. On a long-running
 *    node host (or locally) the writes persist.
 */

const DATA_DIR = process.env.CLUBS_PORTAL_DATA_DIR
  ? path.resolve(process.env.CLUBS_PORTAL_DATA_DIR)
  : path.join(process.cwd(), "data", "portal");
/**
 * Where writes land when the project directory is read-only — which is every
 * serverless host, including Vercel. `/tmp` is writable there, so an edit at
 * least takes effect for the life of that instance instead of failing outright.
 * It is *not* durable across instances or deploys: for real persistence point
 * CLUBS_PORTAL_DATA_DIR at a writable volume, or move this module to a database.
 */
const FALLBACK_DIR = path.join(os.tmpdir(), "clubs-portal-data");

/** The directory reads and writes actually use for this process. */
let activeDir: string | null = null;

const files = (dir: string) => ({
  expenses: path.join(dir, "expenses.json"),
  events: path.join(dir, "events.json"),
});

async function readJsonFile<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function writeJsonFile(file: string, value: unknown): Promise<void> {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(tmp, file);
}

/** Try the project dir, then the writable temp dir. */
async function currentDir(): Promise<string> {
  if (activeDir) return activeDir;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_DIR, fs.constants?.W_OK ?? 2);
    activeDir = DATA_DIR;
  } catch {
    await fs.mkdir(FALLBACK_DIR, { recursive: true });
    activeDir = FALLBACK_DIR;
  }
  return activeDir;
}

/** Read with the fallback in mind: a temp-dir copy wins if it exists. */
async function readStoreJson<T>(name: "expenses" | "events"): Promise<T | null> {
  const dir = await currentDir();
  const primary = files(dir === DATA_DIR ? FALLBACK_DIR : DATA_DIR)[name];
  const fallback = files(dir)[name];
  return (await readJsonFile<T>(fallback)) ?? (await readJsonFile<T>(primary));
}

async function writeStoreJson(name: "expenses" | "events", value: unknown): Promise<void> {
  const dir = await currentDir();
  await writeJsonFile(files(dir)[name], value);
}

export async function readEvents(): Promise<PlannedEvent[]> {
  const stored = await readStoreJson<PlannedEvent[]>("events");
  if (stored) return stored;
  await writeStoreJson("events", SEED_EVENTS);
  return SEED_EVENTS;
}

export async function readExpenses(): Promise<Expense[]> {
  const stored = await readStoreJson<Expense[]>("expenses");
  if (stored) return stored;
  await writeStoreJson("expenses", SEED_EXPENSES);
  return SEED_EXPENSES;
}

export async function writeEvents(events: PlannedEvent[]): Promise<void> {
  await writeStoreJson("events", events);
}

export async function writeExpenses(expenses: Expense[]): Promise<void> {
  await writeStoreJson("expenses", expenses);
}

// ---------- input validation (shared by the API routes) ----------

type Unknown = Record<string, unknown>;

const asRecord = (value: unknown): Unknown => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Body must be a JSON object");
  }
  return value as Unknown;
};

const optString = (value: unknown, field: string): string | undefined => {
  if (value == null) return undefined;
  if (typeof value !== "string") throw new Error(`${field} must be text`);
  return value.trim() || undefined;
};

const reqString = (value: unknown, field: string): string => {
  const out = optString(value, field);
  if (!out) throw new Error(`${field} is required`);
  return out;
};

const optMoney = (value: unknown, field: string): number | null => {
  if (value == null || value === "") return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} must be a number of cents`);
  }
  if (value < 0) throw new Error(`${field} cannot be negative`);
  return Math.round(value);
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], field: string): T => {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new Error(`${field} must be one of ${allowed.join(", ")}`);
  }
  return value as T;
};

const isoTime = (value: unknown, field: string): string => {
  const out = reqString(value, field);
  if (!/^\d{2}:\d{2}$/.test(out)) throw new Error(`${field} must be HH:MM`);
  return out;
};

const isoDate = (value: unknown, field: string): string => {
  const out = reqString(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out)) throw new Error(`${field} must be YYYY-MM-DD`);
  return out;
};

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Accepts a full expense row or a partial one (for PATCH). */
export function parseExpense(body: unknown, base?: Expense): Expense {
  const raw = asRecord(body);
  const timestamp = new Date().toISOString();
  return {
    id: base?.id ?? optString(raw.id, "id") ?? makeId("exp"),
    eventId:
      "eventId" in raw ? (optString(raw.eventId, "eventId") ?? null) : (base?.eventId ?? null),
    category: "category" in raw ? oneOf(raw.category, EXPENSE_CATEGORIES, "category") : (base?.category ?? "misc"),
    lineItem: "lineItem" in raw ? reqString(raw.lineItem, "lineItem") : (base?.lineItem ?? ""),
    vendor: "vendor" in raw ? optString(raw.vendor, "vendor") : base?.vendor,
    budgeted: "budgeted" in raw ? optMoney(raw.budgeted, "budgeted") : (base?.budgeted ?? null),
    actual: "actual" in raw ? optMoney(raw.actual, "actual") : (base?.actual ?? null),
    status: "status" in raw ? oneOf(raw.status, ["planned", "quoted", "committed", "paid"] as const, "status") : (base?.status ?? "planned"),
    note: "note" in raw ? optString(raw.note, "note") : base?.note,
    updatedAt: timestamp,
  };
}

/** Accepts a full event row or a partial one (for PATCH). */
export function parseEvent(body: unknown, base?: PlannedEvent): PlannedEvent {
  const raw = asRecord(body);
  const timestamp = new Date().toISOString();
  return {
    id: base?.id ?? optString(raw.id, "id") ?? makeId("evt"),
    name: "name" in raw ? reqString(raw.name, "name") : (base?.name ?? ""),
    date: "date" in raw ? isoDate(raw.date, "date") : (base?.date ?? ""),
    startTime: "startTime" in raw ? isoTime(raw.startTime, "startTime") : (base?.startTime ?? ""),
    endTime: "endTime" in raw ? isoTime(raw.endTime, "endTime") : (base?.endTime ?? ""),
    venue: "venue" in raw ? reqString(raw.venue, "venue") : (base?.venue ?? ""),
    room: "room" in raw ? optString(raw.room, "room") : base?.room,
    owner: "owner" in raw ? reqString(raw.owner, "owner") : (base?.owner ?? ""),
    status: "status" in raw ? oneOf(raw.status, EVENT_STATUSES, "status") : (base?.status ?? "planning"),
    attendance: "attendance" in raw ? optString(raw.attendance, "attendance") : base?.attendance,
    budgetTotal:
      "budgetTotal" in raw ? optMoney(raw.budgetTotal, "budgetTotal") : (base?.budgetTotal ?? null),
    notes: "notes" in raw ? optString(raw.notes, "notes") : base?.notes,
    updatedAt: timestamp,
  };
}
