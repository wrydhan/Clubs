/**
 * Clubs info portal — people funnel (Track 2).
 *
 * This file is the shared contract for the three parallel build slices:
 *   A. data  — data/clubs-portal/**, scripts/import-people.mjs
 *   B. funnel UI — components/clubs-portal/funnel/**
 *   C. people table — components/clubs-portal/people-table/**
 *
 * Do not change exported names or shapes here without editing
 * docs/clubs-portal-people-funnel.md in the same PR.
 */

/** Where we first saw the person. */
export type PersonSource =
  | "luma" // Luma event signup / attendee export
  | "twitter_engage" // liked, replied, reposted, or mentioned @foundersclubs
  | "twitter_follow" // follows @foundersclubs
  | "event" // attended an in-person Clubs event (checked in)
  | "manual"; // added by hand in the portal

/** Deepest relationship we have recorded. */
export type PersonStatus =
  | "following"
  | "engaged"
  | "lead"
  | "signed_up"
  | "waitlist"
  | "declined"
  | "attended";

/**
 * Funnel stages, widest first. A person can be in more than one stage
 * (a follower who also signed up), so counts are cohorts, not a strictly
 * nested set — see the ratio note in docs/clubs-portal-people-funnel.md.
 */
export type FunnelStage = "followers" | "engagers" | "signups" | "attendees";

export const FUNNEL_STAGES: readonly FunnelStage[] = [
  "followers",
  "engagers",
  "signups",
  "attendees",
] as const;

export const STAGE_LABELS: Record<FunnelStage, string> = {
  followers: "Twitter followers",
  engagers: "Twitter engagers",
  signups: "Event signups",
  attendees: "Attendees",
};

export const SOURCE_LABELS: Record<PersonSource, string> = {
  luma: "Luma",
  twitter_engage: "X engagement",
  twitter_follow: "X follower",
  event: "Event check-in",
  manual: "Manual",
};

export const STATUS_LABELS: Record<PersonStatus, string> = {
  following: "Following",
  engaged: "Engaged",
  lead: "Lead",
  signed_up: "Signed up",
  waitlist: "Waitlist",
  declined: "Declined",
  attended: "Attended",
};

export interface Person {
  /** Stable id. Luma guest_id where known, otherwise `src:handle-or-email`. */
  id: string;
  name: string;
  /** X handle without the @ where known. */
  handle?: string;
  email?: string;
  company?: string;
  source: PersonSource;
  status: PersonStatus;
  /** Every funnel stage this person belongs to. */
  stages: FunnelStage[];
  /** Event slugs the person signed up for or attended. */
  events: string[];
  /** ISO 8601 date. */
  firstSeen: string;
  /** ISO 8601 date. */
  lastSeen: string;
  notes?: string;
}

export interface SeedDataset {
  /** ISO 8601 timestamp of when the data behind this file was gathered. */
  generatedAt: string;
  /** True while the rows are curated/sample rather than a real export. */
  isPlaceholder: boolean;
  /** One line the UI can show next to the placeholder banner. */
  note?: string;
  people: Person[];
}

export interface StageSummary {
  stage: FunnelStage;
  label: string;
  count: number;
  /** count / previous stage count, 0-1. Null for the first stage or when the previous count is 0. */
  ratioFromPrevious: number | null;
}

export interface SourceSummary {
  source: PersonSource;
  label: string;
  count: number;
}

export interface PeopleDataset {
  generatedAt: string;
  isPlaceholder: boolean;
  note?: string;
  people: Person[];
  funnel: StageSummary[];
  sources: SourceSummary[];
  /** Rows per status, for the table's status filter chips. */
  statusCounts: Array<{ status: PersonStatus; label: string; count: number }>;
}
