import type { PersonSource } from "@/lib/clubs-portal/people/types";

export type SourceState = "live" | "partial" | "not_connected";

export interface SourceStatus {
  source: PersonSource | "x_followers" | "x_engagers";
  label: string;
  state: SourceState;
  detail: string;
}

/**
 * What the dashboard is actually fed by, per source.
 *
 * This is deliberately separate from the counts: a source that reads 0 because
 * nothing happened must not look the same as a source that reads 0 because it
 * was never connected. The funnel section prints this next to the numbers.
 *
 * Update a row in the same PR that connects (or breaks) that source.
 */
export const sourceStatus: SourceStatus[] = [
  {
    source: "luma",
    label: "Luma signups",
    state: "partial",
    detail:
      "Clubs events only: the 3v3 Basketball Tournament export is imported. Track day and the holiday party have no export yet, so they read 0. Imported by scripts/import-people.mjs.",
  },
  {
    source: "event",
    label: "In-person check-ins",
    state: "partial",
    detail:
      "Read from the export's checked_in_at column. No one is checked in yet, so the stage shows 0. The basketball export carries no check-in timestamps.",
  },
  {
    source: "x_followers",
    label: "X followers",
    state: "not_connected",
    detail:
      "No X sync yet. Needs an X developer app with credits; the follower list is a paid read.",
  },
  {
    source: "x_engagers",
    label: "X engagers",
    state: "not_connected",
    detail:
      "No X sync yet. Likes, replies, reposts and mentions of @foundersclubs are not imported.",
  },
  {
    source: "manual",
    label: "Manual entries",
    state: "live",
    detail: "Hand-added rows in data/clubs-portal/people.manual.ts.",
  },
];

export const SOURCE_STATE_LABELS: Record<SourceState, string> = {
  live: "Live",
  partial: "Partial",
  not_connected: "Not connected",
};
