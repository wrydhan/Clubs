# Clubs v3 — parallel workstreams (integration plan)

Base branch for every workstream: **`clubs/v3-integration`** (the approved collage
board). Every workstream PR targets **`clubs/v3-integration`**, never `main`.
`clubs/v3-integration` reaches `main` only through the single final review PR.

Owner: Task Manager COO. Gate: Task Verification Bot (build + lint + audit before
every merge).

## Ground rules

1. Branch from `clubs/v3-integration`. Rebase onto it before opening the PR.
2. Keep the diff inside your file ownership below. If you need a file another
   workstream owns, say so in the PR body instead of editing it.
3. Style only with semantic tokens/classes (`bg-paper`, `text-ink`, `font-display`,
   CSS custom properties). Never hardcode a hex colour, font family or paper
   texture — the token workstream must be able to restyle you.
4. Irregular poster shapes and the hand-placed collage stay. This round is about
   each club looking like its own design and the site reading as f.inc.
5. Build + lint must pass before the PR opens: `npm run build`, `npm run lint`.
   No test script exists.

## Workstreams

### A. `brand/finc-tokens-and-paper` — f.inc tokens + printer paper
- Study https://f.inc: typefaces, palette, logo/lockup, casing, tone.
- Centralise as design tokens (Tailwind theme + CSS custom properties): display, UI
  and mono families, ink/paper/accent ramp, rules, label casing.
- Replace aged paper site-wide with plain printer paper: clean white to warm
  off-white, at most very light fibre grain. No sepia, stains, burnt or torn edges,
  foxing or watermarks. Body contrast and legibility must improve; record
  before/after contrast ratios in the PR.
- Owns: `app/globals.css`, `app/layout.tsx`, theme/token files,
  `components/collage/paper.tsx`, paper textures in `public/`.

### B. `perf/hallway-walk` — smoother walk on weak hardware + more below the hall
- Steady 60fps on integrated graphics and older laptops at current quality, with
  graceful degrade (pixel ratio cap, no expensive blur/filter chains, no per-frame
  re-render of static layers, cached textures, precomputed transforms).
- Report before/after frame times at DPR 1 and 2 and under 4x CPU throttle.
- Fill out the section below the hallway walk with more real club-board objects.
- Owns: `components/hallway/hallway.tsx`, `components/hallway/hallway-corridor.tsx`,
  hallway textures in `public/`.

### C. `design/unique-posters` — one design per club
- The posters share one design at four shapes. Give each club its own layout family
  suiting its subject (timing sheet / job ticket / scoresheet / field-day map),
  keeping the torn irregular silhouette and collage rhythm.
- Keep identity through A's tokens; match the 3D board to the DOM posters.
- Owns: `components/collage/**`, poster rendering in
  `components/hallway/board-collage.tsx`, poster art in `public/`.

### D. `ux/nav-and-copy` — one club page, no club arithmetic, obvious navigation
- Delete `/clubs/overview` ("At a glance"), 308-redirect to `/clubs/roster`, drop it
  from header nav, sitemap, OG images and `lib/` nav data.
- Remove every explicit club count and next-club arithmetic: "the four clubs",
  "Four clubs · Fort Mason Pier 2", "four flyers · four clubs", "four clubs, top to
  bottom", "Four clubs spinning on the wall", "Start a fifth", "the fifth club goes
  up", "The four clubs →".
- Remove the "Bring ten names" charter requirement and its variants from copy, FAQ
  and the charter desk scene.
- One clear primary nav, current page marked, no two entries leading to the same
  kind of page, no dead ends.
- Owns: `app/clubs/overview/**`, `app/clubs/roster/page.tsx`, `app/clubs/page.tsx`,
  `app/clubs/apply/page.tsx`, `app/clubs/calendar/**`, `components/header.tsx`,
  `components/footer.tsx`, `components/club-nav.tsx`, `lib/collage.ts`,
  `lib/copy.ts`, `lib/site.ts`, `app/sitemap.ts`, `next.config.ts`.

## Merge order

A → D → C → B, each rebased onto the updated `clubs/v3-integration` and rebuilt.
Conflicts are resolved by the incoming workstream's owner, never by dropping a side.

## Existing PRs

`#5 design/collage-board → main` is superseded by this plan; leave it open.
