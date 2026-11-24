/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by `node scripts/import-people.mjs` next to
 * `data/clubs-portal/people.seed.ts`. It records which Clubs event each export
 * belongs to, so the portal can tell "0 rows because no export has arrived"
 * apart from "0 rows because nobody signed up".
 *
 * The importer merges this file across runs; `--fresh` rewrites it to the
 * exports named on that command line only.
 */

export interface LumaImport {
  slug: string;
  file: string;
  /** Rows in the CSV, before folding group registrations by guest_id. */
  ticketRows: number;
  importedAt: string;
}

export const lumaImports: LumaImport[] = [
  {
    slug: "basketball-3v3",
    file: "basketball-3v3.csv",
    ticketRows: 10,
    importedAt: "2026-11-24T00:21:18.081Z",
  },
];
