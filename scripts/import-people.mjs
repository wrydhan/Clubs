#!/usr/bin/env node
/**
 * Import Luma guest exports into the Clubs portal people dataset.
 *
 *   node scripts/import-people.mjs <event-slug>=<export.csv> [...]
 *
 * Example:
 *   node scripts/import-people.mjs basketball-3v3=~/Downloads/luma-export.csv
 *
 * The Luma guest export is one row per *ticket*, so a team registration shows up
 * once per member with the same `guest_id`. Rows are folded by `guest_id` before
 * anything is written, which is why a 3-person team is one person, not three.
 *
 * Output is `data/clubs-portal/people.manual.ts` — wait, no: manual rows are
 * hand-edited and never touched by this script. The generated file is
 * `data/clubs-portal/people.seed.ts`; it carries a do-not-edit header.
 *
 * Exit codes: 0 ok, 1 bad usage / unreadable file.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/clubs-portal/people.seed.ts");

/** Minimal RFC 4180 parser: quoted fields, doubled quotes, embedded newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function toObjects(rows) {
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj = {};
    header.forEach((key, index) => {
      obj[key] = (cells[index] ?? "").trim();
    });
    return obj;
  });
}

/** Luma approval_status + check-in → the portal's person status. */
function toStatus(approvalStatus, checkedInAt) {
  if (checkedInAt) return "attended";
  switch (approvalStatus) {
    case "approved":
      return "signed_up";
    case "waitlist":
      return "waitlist";
    case "declined":
      return "declined";
    case "pending_approval":
    case "invited":
    case "session":
    default:
      return "lead";
  }
}

/** A person is in a funnel stage only when the export proves it. */
function toStages(status, checkedInAt) {
  const stages = [];
  if (checkedInAt) stages.push("attendees");
  if (status === "attended" || status === "signed_up") stages.push("signups");
  return stages;
}

const isoDate = (value) => (value ? value.slice(0, 10) : undefined);

function foldRows(rows, eventSlug) {
  const byGuest = new Map();
  let ticketRows = 0;
  let duplicates = 0;

  for (const row of rows) {
    const id = row.guest_id;
    if (!id) continue;
    ticketRows += 1;

    const existing = byGuest.get(id);
    if (existing) {
      duplicates += 1;
      // Group registration: later rows carry the same guest, so keep the
      // earliest seen date and merge notes instead of writing a second person.
      continue;
    }

    const status = toStatus(row.approval_status, row.checked_in_at);
    const team = row["Team Name"];
    const notes = [team ? `Team: ${team}` : "", row["Any Questions?"] ? `Asked: ${row["Any Questions?"]}` : ""]
      .filter(Boolean)
      .join(". ");

    byGuest.set(id, {
      id,
      name: row.name || [row.first_name, row.last_name].filter(Boolean).join(" "),
      email: row.email || undefined,
      source: "luma",
      status,
      stages: toStages(status, row.checked_in_at),
      events: [eventSlug],
      firstSeen: isoDate(row.created_at) ?? "1970-01-01",
      lastSeen: isoDate(row.checked_in_at) ?? isoDate(row.created_at) ?? "1970-01-01",
      ...(team ? { company: undefined } : {}),
      ...(notes ? { notes } : {}),
    });
  }

  return { people: [...byGuest.values()], ticketRows, duplicates };
}

function readExistingPeople() {
  try {
    const text = readFileSync(OUT, "utf8");
    return text;
  } catch {
    return null;
  }
}

/**
 * Keep rows this run did not touch: a Luma import for one event must not delete
 * people captured from another event, a manual add, or X. The generated file is
 * a merge target, not a replacement.
 */
function previouslyImported(text) {
  if (!text) return [];
  const people = [];
  const re = /\n  \{\n([\s\S]*?)\n  \},/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const body = match[1];
    const get = (key) => {
      const m = body.match(new RegExp(`\\b${key}: "([^"]*)"`));
      return m ? m[1] : undefined;
    };
    const stagesMatch = body.match(/stages: \[([^\]]*)\]/);
    const stages = stagesMatch
      ? [...stagesMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];
    const eventsMatch = body.match(/events: \[([^\]]*)\]/);
    const events = eventsMatch
      ? [...eventsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];
    const id = get("id");
    if (!id) continue;
    people.push({
      id,
      name: get("name") ?? id,
      ...(get("handle") ? { handle: get("handle") } : {}),
      ...(get("email") ? { email: get("email") } : {}),
      ...(get("company") ? { company: get("company") } : {}),
      source: get("source") ?? "manual",
      status: get("status") ?? "lead",
      stages,
      events,
      firstSeen: get("firstSeen") ?? "1970-01-01",
      lastSeen: get("lastSeen") ?? "1970-01-01",
      ...(get("notes") ? { notes: get("notes") } : {}),
    });
  }
  return people;
}

const q = (value) => JSON.stringify(value);
const opt = (key, value) => (value ? `      ${key}: ${q(value)},\n` : "");

function toTs(people) {
  const body = people
    .map(
      (person) => `  {
    id: ${q(person.id)},
    name: ${q(person.name)},
${opt("handle", person.handle)}${opt("email", person.email)}${opt("company", person.company)}    source: ${q(person.source)},
    status: ${q(person.status)},
    stages: [${person.stages.map(q).join(", ")}],
    events: [${person.events.map(q).join(", ")}],
    firstSeen: ${q(person.firstSeen)},
    lastSeen: ${q(person.lastSeen)},
${opt("notes", person.notes)}  },`,
    )
    .join("\n");

  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by \`node scripts/import-people.mjs <event-slug>=<export.csv>\` from a
 * Luma guest export. Hand-added people belong in
 * data/clubs-portal/people.manual.ts, which this script never rewrites.
 *
 * This file contains real attendee names and emails: it is committed because the
 * portal is server-rendered behind the password gate, and it is excluded from
 * search indexing along with the rest of /clubs/portal.
 */

import type { SeedDataset } from "@/lib/clubs-portal/people/types";

export const seedDataset: SeedDataset = {
  generatedAt: ${q(new Date().toISOString())},
  isPlaceholder: false,
  note: ${q(
    "Luma guest exports only. X followers/engagers and in-person check-ins are not imported — those stages read 0 until the X sync is connected and someone is checked in.",
  )},
  people: [
${body}
  ],
};
`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("usage: node scripts/import-people.mjs <event-slug>=<export.csv> [...]");
    process.exit(1);
  }

  const imported = [];
  let ticketRows = 0;
  let duplicates = 0;

  for (const arg of args) {
    const split = arg.indexOf("=");
    if (split < 0) {
      console.error(`bad argument (expected slug=file): ${arg}`);
      process.exit(1);
    }
    const eventSlug = arg.slice(0, split);
    const file = arg.slice(split + 1).replace(/^~/, process.env.HOME ?? "");
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch (error) {
      console.error(`cannot read ${file}: ${error.message}`);
      process.exit(1);
    }
    const folded = foldRows(toObjects(parseCsv(text)), eventSlug);
    ticketRows += folded.ticketRows;
    duplicates += folded.duplicates;
    imported.push(...folded.people);
  }

  const prior = previouslyImported(readExistingPeople());
  const byId = new Map();
  for (const person of prior) byId.set(person.id, person);
  for (const person of imported) {
    const existing = byId.get(person.id);
    if (existing) {
      const events = [...new Set([...existing.events, ...person.events])];
      byId.set(person.id, { ...existing, ...person, events });
    } else {
      byId.set(person.id, person);
    }
  }

  const people = [...byId.values()].sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
  writeFileSync(OUT, toTs(people));

  const counts = people.reduce((acc, person) => {
    acc[person.status] = (acc[person.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`read ${ticketRows} ticket rows, folded ${duplicates} duplicate ticket rows`);
  console.log(`wrote ${people.length} people to ${path.relative(ROOT, OUT)}`);
  console.log(`status: ${JSON.stringify(counts)}`);
}

main();
