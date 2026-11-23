#!/usr/bin/env node
/**
 * Import Luma guest exports into the Clubs portal people dataset.
 *
 *   node scripts/import-people.mjs <event-slug>=<export.csv> [...]
 *
 * Example:
 *   node scripts/import-people.mjs basketball-3v3=~/data/basketball.csv
 *
 * The Luma guest export is one row per *ticket*, so a team registration shows up
 * once per member with the same `guest_id`. Rows are folded by `guest_id` before
 * anything is written, which is why a 3-person team is one person, not three.
 * People are then folded across events by email, so someone who came to two
 * events is one row with two event slugs.
 *
 * Fields captured per person, when the export has them:
 *   - email (every Luma export)
 *   - company (`Company, fund, or affiliation`, `Company`)
 *   - X handle (`X (Twitter)`, `Twitter`), normalised to bare handle
 *   - notes: team name, and what they said they were building
 *
 * Hand-added rows live in `data/clubs-portal/people.manual.ts` and are never
 * touched by this script. The generated file is `data/clubs-portal/people.seed.ts`
 * and carries a do-not-edit header.
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

const firstOf = (row, keys) => {
  for (const key of keys) {
    const value = row[key];
    if (value && value.trim()) return value.trim();
  }
  return "";
};

/** "https://x.com/foo", "@foo", "twitter.com/foo" → "foo". */
function normaliseHandle(raw) {
  if (!raw) return "";
  let value = raw.trim();
  if (!value || /^(na|n\/a|none|-)$/i.test(value)) return "";
  value = value
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(x|twitter)\.com\//i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .replace(/^@/, "")
    .trim();
  if (!value || value.includes(" ") || !/^[A-Za-z0-9_]{1,15}$/.test(value)) return "";
  return value;
}

function foldRows(rows, eventSlug) {
  const byGuest = new Map();
  let ticketRows = 0;
  let duplicates = 0;

  for (const row of rows) {
    const id = row.guest_id;
    if (!id) continue;
    ticketRows += 1;

    if (byGuest.has(id)) {
      duplicates += 1;
      // Group registration: later rows carry the same guest, so keep the first
      // row and fold it as one person instead of writing a second one.
      continue;
    }

    const status = toStatus(row.approval_status, row.checked_in_at);
    const team = firstOf(row, ["Team Name"]);
    const building = firstOf(row, ["What are you building?", "What will you try to build and demo live by the end of Night Hack? No localhost allowed :)"]);
    const notes = [
      team ? `Team: ${team}` : "",
      building ? `Building: ${building.slice(0, 140)}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    byGuest.set(id, {
      id,
      name: row.name || [row.first_name, row.last_name].filter(Boolean).join(" "),
      handle: normaliseHandle(firstOf(row, ["X (Twitter)", "Twitter", "Twitter handle", "X handle"])),
      email: row.email || "",
      company: firstOf(row, ["Company, fund, or affiliation", "Company"]),
      source: "luma",
      status,
      stages: toStages(status, row.checked_in_at),
      events: [eventSlug],
      firstSeen: isoDate(row.created_at) ?? "1970-01-01",
      lastSeen: isoDate(row.checked_in_at) ?? isoDate(row.created_at) ?? "1970-01-01",
      notes,
    });
  }

  return { people: [...byGuest.values()], ticketRows, duplicates };
}

/** Deepest status wins when one person is on several exports. */
const STATUS_RANK = {
  lead: 0,
  waitlist: 1,
  declined: 2,
  signed_up: 3,
  engaged: 4,
  following: 5,
  attended: 6,
};

function mergePerson(a, b) {
  const status = (STATUS_RANK[b.status] ?? 0) > (STATUS_RANK[a.status] ?? 0) ? b.status : a.status;
  const notes = [a.notes, b.notes].filter(Boolean);
  return {
    ...a,
    name: b.name || a.name,
    handle: a.handle || b.handle,
    email: a.email || b.email,
    company: a.company || b.company,
    status,
    stages: [...new Set([...a.stages, ...b.stages])],
    events: [...new Set([...a.events, ...b.events])],
    firstSeen: a.firstSeen < b.firstSeen ? a.firstSeen : b.firstSeen,
    lastSeen: a.lastSeen > b.lastSeen ? a.lastSeen : b.lastSeen,
    notes: [...new Set(notes)].join(". "),
  };
}

function readExistingPeople() {
  try {
    return readFileSync(OUT, "utf8");
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
      handle: get("handle") ?? "",
      email: get("email") ?? "",
      company: get("company") ?? "",
      source: get("source") ?? "manual",
      status: get("status") ?? "lead",
      stages,
      events,
      firstSeen: get("firstSeen") ?? "1970-01-01",
      lastSeen: get("lastSeen") ?? "1970-01-01",
      notes: get("notes") ?? "",
    });
  }
  return people;
}

const q = (value) => JSON.stringify(value);
const opt = (key, value) => (value ? `    ${key}: ${q(value)},\n` : "");

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
    "Luma guest exports only, one row per person folded across events. X followers/engagers and in-person check-ins are not imported — those stages read 0 until the X sync is connected and someone is checked in.",
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

  // id → person, then fold across events by email so a repeat guest is one row.
  const byId = new Map();
  for (const person of previouslyImported(readExistingPeople())) byId.set(person.id, person);
  for (const person of imported) {
    const existing = byId.get(person.id);
    byId.set(person.id, existing ? mergePerson(existing, person) : person);
  }

  const byIdentity = new Map();
  for (const person of byId.values()) {
    const key = person.email ? `email:${person.email.toLowerCase()}` : `id:${person.id}`;
    const existing = byIdentity.get(key);
    byIdentity.set(key, existing ? mergePerson(existing, person) : person);
  }

  const people = [...byIdentity.values()].sort((a, b) =>
    a.lastSeen < b.lastSeen ? 1 : a.lastSeen > b.lastSeen ? -1 : a.name.localeCompare(b.name),
  );
  writeFileSync(OUT, toTs(people));

  const counts = people.reduce((acc, person) => {
    acc[person.status] = (acc[person.status] ?? 0) + 1;
    return acc;
  }, {});
  const withEmail = people.filter((p) => p.email).length;
  const withCompany = people.filter((p) => p.company).length;
  const withHandle = people.filter((p) => p.handle).length;
  const perEvent = people.reduce((acc, person) => {
    for (const slug of person.events) acc[slug] = (acc[slug] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`read ${ticketRows} ticket rows, folded ${duplicates} duplicate ticket rows`);
  console.log(`wrote ${people.length} people to ${path.relative(ROOT, OUT)}`);
  console.log(`status: ${JSON.stringify(counts)}`);
  console.log(`contact: email ${withEmail}, company ${withCompany}, x handle ${withHandle}`);
  console.log(`events: ${JSON.stringify(perEvent)}`);
}

main();
