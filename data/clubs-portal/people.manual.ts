import type { Person } from "@/lib/clubs-portal/people/types";

/**
 * People added by hand — someone who came to a club night, commented in the
 * group chat, or was introduced and never touched Luma or X.
 *
 * Hand-edit this file. `scripts/import-people.mjs` never writes it, so a new
 * Luma export cannot delete a manual row. Every row needs a stable `id`; use
 * `manual:<email-or-handle>` so a later Luma/X import can be matched to it.
 *
 * Example (kept as a comment so the portal renders empty until a real row is
 * added):
 *
 *   {
 *     id: "manual:someone@example.com",
 *     name: "Someone",
 *     email: "someone@example.com",
 *     source: "manual",
 *     status: "lead",
 *     stages: [],
 *     events: [],
 *     firstSeen: "2026-11-21",
 *     lastSeen: "2026-11-21",
 *     notes: "Met at the Dec 17 party",
 *   },
 */
export const manualPeople: Person[] = [];
