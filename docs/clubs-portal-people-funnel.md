# Clubs portal — people funnel (Track 2)

The `/clubs/` portal is being built in three tracks. This document covers Track 2
only: the people funnel and the people table. Track 1 owns auth and the portal
shell; Track 3 owns expenses and event planning. Do not add auth here.

## What this track delivers

One page inside the portal shell:

1. **Funnel** — Twitter followers → Twitter engagers → event signups → attendees,
   with counts, stage-to-stage ratios and per-source breakdown.
2. **People table** — every person we know about, with name, source, status,
   handle, company, events and last-seen date; searchable, filterable, sortable.
3. **Honest data state** — a visible banner while rows are samples, so nobody
   reads placeholder numbers as real reach.

## File ownership (parallel slices)

| Slice | Owns | Branch |
| --- | --- | --- |
| A — data | `data/clubs-portal/**`, `scripts/import-people.mjs`, schema docs below | `clubs-portal/people-data` |
| B — funnel UI | `components/clubs-portal/funnel/**` | `clubs-portal/people-funnel-ui` |
| C — people table | `components/clubs-portal/people-table/**` | `clubs-portal/people-table` |
| Assembly | `components/portal/funnel-section.tsx`, `components/portal/people-coverage.tsx` | `clubs-portal/people-funnel-data` |

The shared contract is `lib/clubs-portal/people/types.ts` plus
`lib/clubs-portal/people/summarize.ts` and `lib/clubs-portal/people/load.ts`.
Slices A, B and C must not change those exports; if a change is genuinely needed,
raise it in the PR instead of editing the contract.

## Data model

`Person` (see `types.ts`) is one row per human we can identify across sources:

- `id` — Luma `guest_id` where we have one, otherwise `src:handle-or-email`
- `name`, `handle` (no @), `email`, `company`
- `source` — first place we saw them: `luma`, `twitter_engage`, `twitter_follow`, `event`, `manual`
- `status` — deepest relationship: `following`, `engaged`, `lead`, `signed_up`, `waitlist`, `declined`, `attended`
- `stages` — every funnel stage they belong to (`followers`, `engagers`, `signups`, `attendees`)
- `events` — event slugs they signed up for or attended
- `firstSeen`, `lastSeen` — ISO dates
- `notes`

`loadPeopleDataset()` returns `PeopleDataset`: the rows plus the derived funnel
(`funnel`), source mix (`sources`) and status counts (`statusCounts`).

### Read the funnel counts correctly

Stages are **cohorts, not a nested set**. A follower who never signed up is in
`followers` only; an attendee who does not follow the account is in `attendees`
only. `ratioFromPrevious` is therefore "this stage's count divided by the
previous stage's count", not a true conversion rate, and can exceed 1. The UI
must label it as a ratio against the previous stage, not as "% converted".

## Import path (slice A)

- `scripts/import-people.mjs` — reads one or more CSVs, maps columns, merges
  rows by email then handle, and rewrites `data/clubs-portal/people.seed.ts`.
- Supported inputs:
  - **Luma guest exports** (the CSVs Luma emails on event approval). Columns
    used: `guest_id`, `name`, `email`, `created_at`, `approval_status`,
    `checked_in_at`, plus the team columns when present.
  - **X engagement / follower lists** exported as CSV with `handle` (or `name`
    + `handle`). Engagement includes likes, replies, reposts and mentions.
- Manual additions: append a `Person` to `data/clubs-portal/people.manual.ts`
  (not the generated seed — the next import would overwrite it).
- The script is idempotent on rows: re-running with the same inputs produces the
  same people and counts. `generatedAt` is the run time, so that one line changes
  on every import.

## Data status

The seeded rows are **real**: the Basketball 3v3 Luma guest export (8 people —
5 approved, 3 declined, 0 checked in) was imported with
`scripts/import-people.mjs` and `isPlaceholder` is `false`, so the sample banner
does not render. What is still missing is the other half of the funnel:

| Source | State | What it means |
| --- | --- | --- |
| Luma signups | Live | Imported from the guest export above. |
| In-person check-ins | Partial | Read from the export's `checked_in_at`; nobody has checked in yet, so attendees reads 0. |
| X followers | Not connected | Needs an X developer app with credits. |
| X engagers | Not connected | Likes, replies, reposts and mentions are not imported. |
| Manual rows | Live | `data/clubs-portal/people.manual.ts`, currently empty. |

That table lives in `data/clubs-portal/sources.ts` and renders as the coverage
strip under the charts, so a zero from "nothing happened" never looks like a
zero from "never connected". Update a row in the same PR that connects a source.

## Import path — what the script actually does

```
node scripts/import-people.mjs basketball-3v3=~/Downloads/luma-guests.csv
```

- Parses the Luma export as RFC 4180 CSV (quoted fields and embedded commas
  included — the shirt-size column really does contain `"L, S"`).
- One row per *ticket*, so a 3-person team appears three times with the same
  `guest_id`. Rows are folded by `guest_id`; the last run folded 2 of 10 rows.
- `approval_status` -> `status`: `approved` -> `signed_up`, `waitlist` ->
  `waitlist`, `declined` -> `declined`, anything else -> `lead`; a non-empty
  `checked_in_at` overrides all of them to `attended`.
- `stages`: `signups` only for approved/attended, `attendees` only when checked
  in. A decline is a row, not a funnel stage.
- Merges into the existing generated file by `id`, so importing one event's
  export never deletes people captured from another event.
- Writes `data/clubs-portal/people.seed.ts` with a do-not-edit header and prints
  the ticket-row count, duplicate count and the resulting status mix.
- Manual rows are *never* touched: they live in
  `data/clubs-portal/people.manual.ts`, and `loadPeopleDataset()` merges them
  over the seed, with the manual row winning any field it sets.

There is no database yet (Track 1 lists the store as an open decision), so the
import is a commit-time step: import, review the diff, commit the seed. When a
store lands, only `loadPeopleDataset()` changes.

## Not in this track

Auth, the portal shell and layout tokens (Track 1); expenses and event planning
(Track 3). The funnel page must render correctly inside the shell but must not
import shell internals directly — pass data in and keep the components
presentational.
