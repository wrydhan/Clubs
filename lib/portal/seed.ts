import type { Expense, PlannedEvent } from "@/lib/portal/types";

/**
 * Seed rows for a fresh portal. Written to data/portal/*.json the first time
 * the store is read, then owned by whatever the operator edits from there.
 *
 * Only two money figures in here are sourced; every other number is `null`
 * ("not quoted yet") on purpose. Do not fill them in from guesswork.
 *
 * Sourced:
 *  - 3v3 tournament budget: $5,000 total (5,000_00).
 *  - Tournament tees: 90 shirts at ~$16 printed = ~$1,440 (144_000), from the
 *    order estimate in the tournament thread.
 */

const SEEDED_AT = "2026-11-21T00:00:00.000Z";

export const SEED_EVENTS: PlannedEvent[] = [
  {
    id: "evt-basketball-3v3",
    name: "3v3 Basketball Tournament",
    date: "2026-12-14",
    startTime: "18:00",
    endTime: "22:00",
    venue: "Moscone Rec Center",
    owner: "Waleed Rydhan",
    status: "confirmed",
    attendance: "20 teams",
    budgetTotal: 500_000,
    notes:
      "Double elimination, 10-min games, two games at once on one full court. Opening speech: Zaza Pachulia, 15-20 min. Winners-final winner takes it; no grand final reset. Mercury payment of $6,000 received (5k merch + 1k ops) — $1,000 over the $5,000 cap.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "evt-holiday-party",
    name: "Founders, Inc. Holiday Party (black tie)",
    date: "2026-12-17",
    startTime: "18:00",
    endTime: "22:00",
    venue: "Fort Mason Center, Building C",
    room: "Room 300",
    owner: "Waleed Rydhan",
    status: "planning",
    attendance: "120 guests (target)",
    budgetTotal: null,
    notes:
      "Black tie. Lunch room dressed for the evening: uplighting, Christmas tree as the photo backdrop, vinyl cutter on site, tall cocktail tables.",
    updatedAt: SEEDED_AT,
  },
];

export const SEED_EXPENSES: Expense[] = [
  // --- 3v3 Basketball Tournament, Moscone Rec Center, Dec 14 ---
  {
    id: "exp-bball-venue",
    eventId: "evt-basketball-3v3",
    category: "venue",
    lineItem: "Court rental (full court, 6-10 PM)",
    vendor: "Moscone Rec Center",
    budgeted: null,
    actual: null,
    status: "planned",
    note: "No quote on file yet.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-bball-swag-tees",
    eventId: "evt-basketball-3v3",
    category: "swag",
    lineItem: "Tournament tees (100 @ ~$16 printed)",
    vendor: "Custom Inc",
    budgeted: 160_000,
    actual: null,
    status: "quoted",
    note: "100 shirts: S 5, M 30, L 38, XL 21, XXL 6. Quote basis ~$16/shirt printed; no invoice on file.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-bball-merch-mercury",
    eventId: "evt-basketball-3v3",
    category: "swag",
    lineItem: "Merchandise — Mercury payment (merch allotment)",
    vendor: "Mercury",
    budgeted: null,
    actual: 500_000,
    status: "paid",
    note: "$6,000 Mercury payment received (5k merch + 1k ops), per Waleed 21 + 23 Nov. No invoice on file. $5,000 merch share — $1,000 over the $5,000 event cap.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-bball-ops-mercury",
    eventId: "evt-basketball-3v3",
    category: "misc",
    lineItem: "Event ops — Mercury payment (ops allotment)",
    vendor: "Mercury",
    budgeted: null,
    actual: 100_000,
    status: "paid",
    note: "$1,000 ops share of the $6,000 Mercury payment (Waleed, 23 Nov). No invoice on file.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-bball-production-crest",
    eventId: "evt-basketball-3v3",
    category: "production",
    lineItem: "Chest print — chevron, one colour",
    vendor: "Custom Inc",
    budgeted: null,
    actual: null,
    status: "planned",
    note: "Left chest only, ~3in, silk screen. Priced with the tee order.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-bball-prizes",
    eventId: "evt-basketball-3v3",
    category: "prizes",
    lineItem: "Grand Prize",
    budgeted: null,
    actual: null,
    status: "planned",
    note: "Prize not selected yet.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-bball-banners",
    eventId: "evt-basketball-3v3",
    category: "production",
    lineItem: "Banners and court decal",
    budgeted: null,
    actual: null,
    status: "planned",
    note: "Banners confirmed as in scope; no quote on file.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-bball-snacks",
    eventId: "evt-basketball-3v3",
    category: "food-drink",
    lineItem: "Snacks and water (no catering)",
    budgeted: null,
    actual: null,
    status: "planned",
    note: "Snacks allowed in the venue, catering is out.",
    updatedAt: SEEDED_AT,
  },

  // --- Holiday Party, Fort Mason Building C, Dec 17 ---
  {
    id: "exp-party-venue",
    eventId: "evt-holiday-party",
    category: "venue",
    lineItem: "Building C, Room 300 (6-10 PM)",
    vendor: "Fort Mason Center",
    budgeted: null,
    actual: null,
    status: "planned",
    note: "No quote on file yet.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-party-production",
    eventId: "evt-holiday-party",
    category: "production",
    lineItem: "Uplighting, Christmas tree, vinyl signage",
    budgeted: null,
    actual: null,
    status: "planned",
    note: "Tree may be available on site; vinyl cutter already on site.",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-party-tables",
    eventId: "evt-holiday-party",
    category: "venue",
    lineItem: "Cocktail tables and black linens",
    budgeted: null,
    actual: null,
    status: "planned",
    updatedAt: SEEDED_AT,
  },
  {
    id: "exp-party-food",
    eventId: "evt-holiday-party",
    category: "food-drink",
    lineItem: "Food and bar",
    budgeted: null,
    actual: null,
    status: "planned",
    note: "Menu not set.",
    updatedAt: SEEDED_AT,
  },
];
