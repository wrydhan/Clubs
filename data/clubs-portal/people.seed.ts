/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `node scripts/import-people.mjs <event-slug>=<export.csv>` from a
 * Luma guest export. Hand-added people belong in
 * data/clubs-portal/people.manual.ts, which this script never rewrites.
 *
 * This file contains real attendee names and emails: it is committed because the
 * portal is server-rendered behind the password gate, and it is excluded from
 * search indexing along with the rest of /portal.
 */

import type { SeedDataset } from "@/lib/clubs-portal/people/types";

export const seedDataset: SeedDataset = {
  generatedAt: "2026-11-24T00:21:06.147Z",
  isPlaceholder: false,
  note: "Luma guest exports for the three Clubs events only (Track Day, 3v3 Basketball Tournament, Holiday Party), one row per person folded across events. X followers/engagers and in-person check-ins are not imported — those stages read 0 until the X sync is connected and someone is checked in.",
  people: [
  {
    id: "gst-VfFdhkVuLXl2fMu",
    name: "Irfan Ahmed",
    email: "irfan.ahmed2@gmail.com",
    source: "luma",
    status: "signed_up",
    stages: ["signups"],
    events: ["basketball-3v3"],
    firstSeen: "2026-11-14",
    lastSeen: "2026-11-14",
    notes: "Team: Bernal ballers",
  },
  {
    id: "gst-jokrGu3xMWc9X8S",
    name: "Alex",
    email: "ac@mint.gg",
    source: "luma",
    status: "signed_up",
    stages: ["signups"],
    events: ["basketball-3v3"],
    firstSeen: "2026-11-12",
    lastSeen: "2026-11-12",
    notes: "Team: Human in the Hoop",
  },
  {
    id: "gst-RyhIUtGMWHfFOEY",
    name: "David Alade",
    email: "davidalade@sorce.jobs",
    source: "luma",
    status: "signed_up",
    stages: ["signups"],
    events: ["basketball-3v3"],
    firstSeen: "2026-11-12",
    lastSeen: "2026-11-12",
    notes: "Team: D^2 + 1",
  },
  {
    id: "gst-dE5DN7IejmjKbHx",
    name: "Declan",
    email: "declangessel@gmail.com",
    source: "luma",
    status: "signed_up",
    stages: ["signups"],
    events: ["basketball-3v3"],
    firstSeen: "2026-11-12",
    lastSeen: "2026-11-12",
    notes: "Team: SLAM",
  },
  {
    id: "gst-tkgdQqEPJnH7gUy",
    name: "Landon Gregg",
    email: "landon@nebula.gg",
    source: "luma",
    status: "declined",
    stages: [],
    events: ["basketball-3v3"],
    firstSeen: "2026-11-12",
    lastSeen: "2026-11-12",
    notes: "Team: Human in the Hoop",
  },
  {
    id: "gst-02LPNqEoU6HM5DX",
    name: "Ju Lin",
    email: "ju@clusy.io",
    source: "luma",
    status: "signed_up",
    stages: ["signups"],
    events: ["basketball-3v3"],
    firstSeen: "2026-11-11",
    lastSeen: "2026-11-11",
    notes: "Team: Clusy",
  },
  {
    id: "gst-CTk1PAGg4A2O2Rv",
    name: "Waleed Rydhan",
    email: "waleed@f.inc",
    source: "luma",
    status: "declined",
    stages: [],
    events: ["basketball-3v3"],
    firstSeen: "2026-11-10",
    lastSeen: "2026-11-10",
    notes: "Team: fdsdsfsd",
  },
  {
    id: "gst-xTxZfO0dUYOAnKJ",
    name: "Will Wang",
    email: "willwangmi@gmail.com",
    source: "luma",
    status: "declined",
    stages: [],
    events: ["basketball-3v3"],
    firstSeen: "2026-11-10",
    lastSeen: "2026-11-10",
    notes: "Team: Clova",
  },
  ],
};
