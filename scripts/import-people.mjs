#!/usr/bin/env node
/**
 * Clubs portal — people funnel, slice A (data).
 *
 * Converts Luma guest exports and X (Twitter) follow/engage exports into
 * `data/clubs-portal/people.seed.ts`, the seed consumed by
 * `lib/clubs-portal/people/load.ts`.
 *
 * Dependency-free ESM: Node's stdlib only, no npm packages.
 *
 * Usage:
 *   node scripts/import-people.mjs <file.csv> [...] [--out <path>] [--keep-declined]
 *
 * - Luma guest export (columns guest_id, name, email, created_at,
 *   approval_status, checked_in_at, optional Team* columns) → one Person per
 *   guest. approved → status `signed_up`, stage `signups`; checked_in_at set →
 *   status `attended`, adds stage `attendees`; `invited` → status `lead` with no
 *   funnel stage (invited is not signed up); `declined` → skipped unless
 *   `--keep-declined`.
 * - X export (columns handle, name, kind where kind is `follow` or `engage`) →
 *   follow: stage `followers`, status `following`, source `twitter_follow`;
 *   engage: stages `followers` + `engagers`, status `engaged`, source
 *   `twitter_engage`.
 *
 * Rows are deduped by email, then handle, then guest_id; stages, events and
 * timestamps are merged (earliest firstSeen, latest lastSeen). Output is sorted
 * by id and is byte-identical when re-run on the same inputs.
 *
 * Event slugs are inferred from the file name (see EVENT_SLUG_RULES); pass rows
 * from other events by renaming the export or adding a rule below.
 */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";

const FUNNEL_ORDER = ["followers", "engagers", "signups", "attendees"];

const STATUS_RANK = {
  declined: 0,
  lead: 1,
  following: 2,
  engaged: 3,
  waitlist: 3,
  signed_up: 4,
  attended: 5,
};

/** Recognisable event exports → the slug we record on each person. */
const EVENT_SLUG_RULES = [
  [/basketball/i, "basketball-3v3"],
  [/blueprint/i, "blueprint-demo-day"],
  [/night\s*hack/i, "night-hack"],
  [/thariq|fireside/i, "fireside-thariq"],
];

const DEFAULT_OUT = "data/clubs-portal/people.seed.ts";

// ---------------------------------------------------------------- CSV parsing

/** RFC 4180-ish parser: quoted fields, embedded commas/quotes/newlines, BOM, CRLF. */
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch === "\r") {
      // ignore; \n terminates the row
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function normalizeHeader(row) {
  return row.map((h) => h.replace(/^\uFEFF/, "").trim().toLowerCase());
}

function toObjects(rows) {
  const header = normalizeHeader(rows[0]);
  const out = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i];
    const obj = {};
    for (let c = 0; c < header.length; c += 1) obj[header[c]] = (cells[c] ?? "").trim();
    out.push(obj);
  }
  return { header, out };
}

// ------------------------------------------------------------------- helpers

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function eventSlugForFile(file) {
  const base = basename(file);
  for (const [re, slug] of EVENT_SLUG_RULES) if (re.test(base)) return slug;
  const lead = base.split(/\s-\s/)[0].split(/-\s*guests/i)[0];
  return slugify(lead) || "event";
}

function normalizeHandle(raw) {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value || /^(n\/?a|none|na|-)$/i.test(value)) return undefined;
  const url = value.match(/(?:x\.com|twitter\.com)\/@?([A-Za-z0-9_]{1,20})/i);
  if (url) return url[1];
  const bare = value.match(/^@?([A-Za-z0-9_]{1,20})$/);
  return bare ? bare[1] : undefined;
}

function toIso(value) {
  if (!value) return undefined;
  const t = Date.parse(value);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
}

function laterDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(b) > Date.parse(a) ? b : a;
}

function earlierDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(b) < Date.parse(a) ? b : a;
}

function mergeStages(list) {
  const set = new Set(list);
  return FUNNEL_ORDER.filter((s) => set.has(s));
}

// --------------------------------------------------------------- row mapping

function lumaRecords(rows, file, stats, keepDeclined) {
  const { header, out } = toObjects(rows);
  const slug = eventSlugForFile(file);
  const companyKey = header.find((h) => h.startsWith("company, fund, or affiliation"));
  const teamNameKey = header.find((h) => h === "team name");
  const teamMemberKeys = header.filter((h) => /^team member \d+ name$/.test(h));
  const twitterKey = header.find((h) => h === "x (twitter)" || h === "twitter" || h === "x");
  const records = [];

  for (const row of out) {
    const approval = (row.approval_status || "").toLowerCase();
    const checkedIn = toIso(row.checked_in_at);
    if (approval === "declined" && !keepDeclined) {
      stats.declinedSkipped += 1;
      continue;
    }

    let status;
    let stages;
    if (checkedIn) {
      status = "attended";
      stages = ["signups", "attendees"];
    } else if (approval === "approved") {
      status = "signed_up";
      stages = ["signups"];
    } else if (approval === "declined") {
      status = "declined";
      stages = [];
    } else {
      // `invited` and anything unrecognised: we know them, but they have not
      // signed up, so they belong in the table and not in the signups stage.
      status = "lead";
      stages = [];
      stats.leads += 1;
    }

    const created = toIso(row.created_at);
    const team = teamNameKey ? row[teamNameKey] : "";
    const members = teamMemberKeys.map((k) => row[k]).filter((v) => v && !/^(n\/?a|na|-)$/i.test(v));
    const notes = [];
    if (team) notes.push(members.length ? `Team ${team}: ${members.join(", ")}` : `Team: ${team}`);

    records.push({
      guestId: row.guest_id || undefined,
      name: row.name || "",
      email: row.email || undefined,
      handle: twitterKey ? normalizeHandle(row[twitterKey]) : undefined,
      company: companyKey ? row[companyKey] || undefined : undefined,
      source: checkedIn ? "event" : "luma",
      status,
      stages,
      events: [slug],
      firstSeen: created,
      lastSeen: laterDate(created, checkedIn),
      notes: notes.length ? notes.join(" · ") : undefined,
      sourceSeenAt: created || checkedIn,
    });
  }
  return records;
}

function xRecords(rows, file) {
  const { header, out } = toObjects(rows);
  if (!header.includes("handle") || !header.includes("kind")) return null;
  const fileSeen = new Date(statSync(file).mtimeMs).toISOString();
  const records = [];
  for (const row of out) {
    const handle = normalizeHandle(row.handle);
    if (!handle) continue;
    const kind = (row.kind || "").toLowerCase();
    const engage = kind === "engage" || kind === "engagement";
    records.push({
      guestId: undefined,
      name: row.name || "",
      email: undefined,
      handle,
      company: undefined,
      source: engage ? "twitter_engage" : "twitter_follow",
      status: engage ? "engaged" : "following",
      stages: engage ? ["followers", "engagers"] : ["followers"],
      events: [],
      firstSeen: fileSeen,
      lastSeen: fileSeen,
      notes: undefined,
      sourceSeenAt: fileSeen,
    });
  }
  return records;
}

// ------------------------------------------------------------------ merging

function buildPeople(records) {
  const byEmail = new Map();
  const byHandle = new Map();
  const byGuest = new Map();
  const people = [];

  for (const rec of records) {
    const emailKey = rec.email ? rec.email.toLowerCase() : undefined;
    const handleKey = rec.handle ? rec.handle.toLowerCase() : undefined;
    const guestKey = rec.guestId;

    let person =
      (emailKey && byEmail.get(emailKey)) ||
      (handleKey && byHandle.get(handleKey)) ||
      (guestKey && byGuest.get(guestKey)) ||
      null;

    if (!person) {
      person = {
        id: guestKey || (emailKey ? `luma:${emailKey}` : `twitter:${handleKey || slugify(rec.name)}`),
        name: rec.name,
        handle: rec.handle,
        email: rec.email ? rec.email.toLowerCase() : undefined,
        company: rec.company,
        source: rec.source,
        status: rec.status,
        stages: mergeStages(rec.stages),
        events: [...new Set(rec.events)],
        firstSeen: rec.firstSeen,
        lastSeen: rec.lastSeen,
        notes: rec.notes,
        _sourceAt: rec.sourceSeenAt,
      };
      people.push(person);
    } else {
      if (!person.name && rec.name) person.name = rec.name;
      if (!person.handle && rec.handle) person.handle = rec.handle;
      if (!person.email && rec.email) person.email = rec.email.toLowerCase();
      if (!person.company && rec.company) person.company = rec.company;
      const union = new Set([...person.stages, ...rec.stages]);
      person.stages = mergeStages([...union]);
      person.events = [...new Set([...person.events, ...rec.events])];
      person.firstSeen = earlierDate(person.firstSeen, rec.firstSeen);
      person.lastSeen = laterDate(person.lastSeen, rec.lastSeen);
      if ((STATUS_RANK[rec.status] ?? 0) > (STATUS_RANK[person.status] ?? 0)) person.status = rec.status;
      if (rec.notes) person.notes = person.notes ? `${person.notes} · ${rec.notes}` : rec.notes;
      if (rec.sourceSeenAt && (!person._sourceAt || Date.parse(rec.sourceSeenAt) < Date.parse(person._sourceAt))) {
        person.source = rec.source;
        person._sourceAt = rec.sourceSeenAt;
      }
    }

    if (emailKey) byEmail.set(emailKey, person);
    if (handleKey) byHandle.set(handleKey, person);
    if (guestKey) byGuest.set(guestKey, person);
  }

  return people;
}

// ------------------------------------------------------------------ emitting

function finalizePeople(people) {
  return people
    .map((p) => {
      const row = {
        id: p.id,
        name: p.name,
        handle: p.handle,
        email: p.email,
        company: p.company,
        source: p.source,
        status: p.status,
        stages: p.stages,
        events: [...p.events].sort(),
        firstSeen: p.firstSeen || "1970-01-01T00:00:00.000Z",
        lastSeen: p.lastSeen || p.firstSeen || "1970-01-01T00:00:00.000Z",
        notes: p.notes,
      };
      for (const key of Object.keys(row)) if (row[key] === undefined) delete row[key];
      return row;
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function buildNote(people) {
  const count = (stage) => people.filter((p) => p.stages.includes(stage)).length;
  const events = [...new Set(people.flatMap((p) => p.events))].sort();
  const signups = count("signups");
  const attendees = count("attendees");
  const followers = count("followers");
  const engagers = count("engagers");
  const real =
    `Real: ${signups} Luma signups and ${attendees} check-ins across ${events.length} event` +
    `${events.length === 1 ? "" : "s"} (${events.join(", ") || "none"}).`;
  const missing = [];
  if (followers === 0) missing.push("X followers");
  if (engagers === 0) missing.push("X engagers");
  const tail = missing.length
    ? ` Still missing: ${missing.join(" and ")} — no importable export yet, so those funnel stages read 0.`
    : "";
  return `${real}${tail}`;
}

function render(seed) {
  return `import type { SeedDataset } from "@/lib/clubs-portal/people/types";

/**
 * Generated by \`scripts/import-people.mjs\` — do not hand-edit rows.
 * Regenerate after importing more Luma / X exports:
 *
 *   node scripts/import-people.mjs <file.csv> [...]
 *
 * Rows are real Luma guest exports. \`isPlaceholder\` stays true while the X
 * follower and engagement data are still missing; see \`note\`.
 */
export const seedDataset: SeedDataset = ${JSON.stringify(seed, null, 2)};
`;
}

// ---------------------------------------------------------------------- main

function parseArgs(argv) {
  const files = [];
  let out = DEFAULT_OUT;
  let keepDeclined = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out") {
      out = argv[i + 1];
      i += 1;
    } else if (arg === "--keep-declined") {
      keepDeclined = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node scripts/import-people.mjs <file.csv> [...] [--out <path>] [--keep-declined]");
      process.exit(0);
    } else if (arg.startsWith("--")) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(1);
    } else {
      files.push(arg);
    }
  }
  if (files.length === 0) {
    console.error("Usage: node scripts/import-people.mjs <file.csv> [...] [--out <path>] [--keep-declined]");
    process.exit(1);
  }
  return { files, out, keepDeclined };
}

function main() {
  const { files, out, keepDeclined } = parseArgs(process.argv.slice(2));
  const stats = { declinedSkipped: 0, leads: 0 };
  const perFile = [];
  let records = [];

  // Sort by resolved path so the merge order (and therefore the output) does
  // not depend on the order files were typed on the command line.
  const ordered = [...files].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (const file of ordered) {
    const text = readFileSync(file, "utf8");
    const rows = parseCsv(text);
    if (rows.length === 0) continue;
    const header = normalizeHeader(rows[0]);
    let mapped;
    if (header.includes("guest_id") || header.includes("approval_status")) {
      mapped = lumaRecords(rows, file, stats, keepDeclined);
    } else {
      mapped = xRecords(rows, file);
      if (!mapped) {
        console.error(`Skipping ${file}: not a Luma guest export or an X handle/kind export.`);
        continue;
      }
    }
    perFile.push({ file: basename(file), rows: mapped.length });
    records = records.concat(mapped);
  }

  const people = finalizePeople(buildPeople(records));
  const newest = people.reduce((acc, p) => laterDate(acc, p.lastSeen), undefined);
  const generatedAt = newest || new Date().toISOString();

  const seed = {
    generatedAt,
    isPlaceholder: true,
    note: buildNote(people),
    people,
  };

  const target = resolve(process.cwd(), out);
  writeFileSync(target, render(seed), "utf8");

  const stageCount = (stage) => people.filter((p) => p.stages.includes(stage)).length;
  console.log(`Wrote ${people.length} people to ${target}`);
  for (const entry of perFile) console.log(`  ${entry.file}: ${entry.rows} rows`);
  if (stats.declinedSkipped) console.log(`  skipped ${stats.declinedSkipped} declined row(s)`);
  if (stats.leads) console.log(`  ${stats.leads} invited/other row(s) kept as leads (no signups stage)`);
  console.log(
    `  stages — followers ${stageCount("followers")}, engagers ${stageCount("engagers")}, ` +
      `signups ${stageCount("signups")}, attendees ${stageCount("attendees")}`,
  );
  console.log(`  generatedAt ${generatedAt}`);
}

main();
