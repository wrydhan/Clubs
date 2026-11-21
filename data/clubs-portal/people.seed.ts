import type { SeedDataset } from "@/lib/clubs-portal/people/types";

/**
 * Sample rows so the funnel UI and table can be built and reviewed before real
 * exports land. Slice A (data) replaces `people` with rows derived from real
 * Luma guest exports and X engagement, and flips `isPlaceholder` to false.
 *
 * These names are illustrative placeholders, not real attendees.
 */
export const seedDataset: SeedDataset = {
  generatedAt: "2026-11-21T00:00:00.000Z",
  isPlaceholder: true,
  note: "Sample rows for the dashboard build. Real Luma, check-in and X exports are not imported yet.",
  people: [
    {
      id: "sample:1",
      name: "Sample Person 01",
      handle: "sample_01",
      email: "sample01@example.com",
      company: "Sample Co",
      source: "twitter_follow",
      status: "following",
      stages: ["followers"],
      events: [],
      firstSeen: "2026-10-02",
      lastSeen: "2026-11-18",
    },
    {
      id: "sample:2",
      name: "Sample Person 02",
      handle: "sample_02",
      source: "twitter_engage",
      status: "engaged",
      stages: ["followers", "engagers"],
      events: ["basketball-3v3"],
      firstSeen: "2026-10-11",
      lastSeen: "2026-11-19",
    },
    {
      id: "sample:3",
      name: "Sample Person 03",
      source: "luma",
      status: "signed_up",
      stages: ["signups"],
      events: ["basketball-3v3"],
      firstSeen: "2026-11-12",
      lastSeen: "2026-11-12",
      notes: "Team registration",
    },
    {
      id: "sample:4",
      name: "Sample Person 04",
      source: "luma",
      status: "attended",
      stages: ["signups", "attendees"],
      events: ["night-hack", "blueprint-demo-day"],
      firstSeen: "2026-07-23",
      lastSeen: "2026-11-18",
    },
    {
      id: "sample:5",
      name: "Sample Person 05",
      source: "event",
      status: "attended",
      stages: ["attendees"],
      events: ["track-day"],
      firstSeen: "2026-09-20",
      lastSeen: "2026-09-20",
    },
    {
      id: "sample:6",
      name: "Sample Person 06",
      source: "manual",
      status: "lead",
      stages: [],
      events: [],
      firstSeen: "2026-11-01",
      lastSeen: "2026-11-01",
      notes: "Intro from a member",
    },
  ],
};
