import { seedDataset } from "@/data/clubs-portal/people.seed";
import { summarizePeople } from "./summarize";
import type { PeopleDataset } from "./types";

/**
 * Single entry point for the people funnel. Today it reads the committed seed;
 * when the portal moves to a database or a fetched export, swap the source here
 * and the funnel/table components keep their contract.
 */
export function loadPeopleDataset(): PeopleDataset {
  return summarizePeople(seedDataset.people, {
    generatedAt: seedDataset.generatedAt,
    isPlaceholder: seedDataset.isPlaceholder,
    note: seedDataset.note,
  });
}
