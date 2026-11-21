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
| Assembly | `app/clubs/people/**` (and mounting into the Track 1 shell) | `clubs-portal/people-funnel` |

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
- Manual additions: append a `Person` to the seed file (or supply a CSV with
  `name,handle,email,company,source,status,notes`).
- The script is idempotent: re-running with the same inputs produces the same
  file, and `generatedAt` is set from the newest input timestamp.

## Data status

Right now the seed is **sample data** (`isPlaceholder: true`). Real Luma
basketball signups, check-ins and X engagement/follower exports still need to be
imported; when they are, set `isPlaceholder: false` and drop the banner.

## Not in this track

Auth, the portal shell and layout tokens (Track 1); expenses and event planning
(Track 3). The funnel page must render correctly inside the shell but must not
import shell internals directly — pass data in and keep the components
presentational.
