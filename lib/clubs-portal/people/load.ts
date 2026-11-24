import { CLUBS_EVENT_SLUGS } from "@/data/clubs-portal/events";
import { manualPeople } from "@/data/clubs-portal/people.manual";
import { seedDataset } from "@/data/clubs-portal/people.seed";
import { sourceStatus } from "@/data/clubs-portal/sources";
import { summarizePeople } from "./summarize";
import type { PeopleDataset, Person } from "./types";

/**
 * Single entry point for the people funnel.
 *
 * Reads the generated Luma seed and the hand-edited manual rows, folds them into
 * one list, and derives the funnel/source/status summaries. Server-only: the
 * portal layout is `force-dynamic`, so this runs per request and a re-imported
 * seed shows up on the next load without a rebuild.
 *
 * When the portal gets a database (still undecided — see docs/portal.md), only
 * this function changes; the funnel and table keep their contract.
 */
export function loadPeopleDataset(): PeopleDataset & {
  sourceStatus: typeof sourceStatus;
} {
  const byId = new Map<string, Person>();

  for (const person of manualPeople) byId.set(person.id, person);
  for (const person of seedDataset.people) {
    // Only the three Clubs events put people in the portal (see
    // data/clubs-portal/events.ts). Anything imported from another event is
    // dropped here as well as at import time, so a stray row can never reach
    // the funnel or the table.
    const events = person.events.filter((slug) => CLUBS_EVENT_SLUGS.has(slug));
    if (events.length === 0) continue;
    const row = events.length === person.events.length ? person : { ...person, events };

    const manual = byId.get(person.id);
    // A manual row wins the fields it set, so a hand-written note on a Luma
    // guest is not overwritten by the next export.
    byId.set(person.id, manual ? { ...row, ...manual } : row);
  }

  return {
    ...summarizePeople([...byId.values()], {
      generatedAt: seedDataset.generatedAt,
      isPlaceholder: seedDataset.isPlaceholder,
      note: seedDataset.note,
    }),
    sourceStatus,
  };
}
