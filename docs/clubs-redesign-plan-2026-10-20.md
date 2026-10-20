# Clubs Website — "Clubhouse Wall" Redesign Plan (2026-10-20)

Brief from @waleed-rydhan: make the Clubs site feel like https://davesocozy.com. "Really sick" within 1–2 hours. AI-generated art as needed. Feedback loop required.

## 1. What the reference actually is

davesocozy.com is a Next.js site for a handmade-collage artist. Its own description: *"Handmade collage artwork. A room to poke around in, originals and prints to take home, and a table to cut your own."* The site is a 3D room (Sketchfab CC-BY props: IKEA bench, VHS tapes, record player, Game Boy, PS1, Canon camera, pegboard, neon OPEN sign), warm brown theme colour `#241A15`, and copy written in the artist's own voice.

What carries the feeling, in order of importance:

1. **A physical place you poke around in.** Objects sit in a room, respond to the pointer, and reward curiosity.
2. **Handmade evidence.** Torn paper, visible tape, misregistered print, halftone dots, scuffs, dust in the scan.
3. **Playful micro-interactions.** Things tilt, peel, lift, wobble. Nothing snaps.
4. **A make-it-yourself corner.** The site invites you to cut your own collage — participation, not just browsing.
5. **Warm, low-key palette.** Paper, kraft, ink, one or two loud accents. Not stark white, not neon.

## 2. The adaptation: the Clubhouse Wall

We are not shipping a WebGL room in two hours. We ship the *feeling* — a tactile, poke-able clubhouse wall built from real collage craft, in the f.inc Clubs identity.

- **Hero: the clubhouse wall.** A full-bleed cork/kraft board, warm and slightly underlit, carrying taped and pinned paper scraps: a torn-paper wordmark, halftone gear cut-outs, club sticker badges, a hand-scrawled note about the next track day, a strip of masking tape, one crooked polaroid. Depth is real (layered shadow, paper lift) but implemented in CSS so it is fast, accessible and works on a phone.
- **Poke around.** Pointer-parallax on the layers, magnetic tilt on hover, stickers that peel a corner then settle back, scraps that can be dragged and re-pinned in place around the board. `prefers-reduced-motion` disables all of it cleanly.
- **Club roster as sticker sheet.** Each club is a die-cut badge on its own torn scrap — Car Club, Hoops, Run Club, Hardware, Paintball — instead of five identical cards. Hovering lifts the scrap off the board; clicking goes to the club page.
- **Next event as a pinned notice.** Typewritten, stamped, tape at two corners, one red hand-drawn circle around the date.
- **"Cut your own" — the make-a-scrap table.** A small interactive: pick a paper, pick a sticker, drag it onto a scrap, get a shareable club poster/collage card. This is the direct nod to the reference's "table to cut your own", and it is the thing people will screenshot.
- **Club detail + calendar + apply** inherit the same tactile system: kraft surfaces, sticker headers, tape-anchored sections, stamped status, typewritten labels — with the existing Luma RSVP links, apply form and calendar behaviour untouched.
- **Type.** Keep the f.inc faces (Instrument Serif display, Instrument Sans UI, Fragment Mono labels) — they are already the right editorial voice — but set them on paper and allow a hand-drawn accent face for scrawls and stamps.
- **Palette.** Warm paper `#F4EDE1` / kraft `#C9A87C` / ink `#241A15` / one loud accent per club. Stop the pure `#000` on `#FFF` brutalist look on these pages.

## 3. Asset pack (generated, in `public/collage/`)

Produced for this job with the image-generation toolkit, prompted as scans and phone snapshots rather than renders:

| File | Use |
| --- | --- |
| `paper-kraft.jpg/.webp` | Main board surface and scrap fills |
| `paper-newsprint.jpg/.webp` | Scraps, notice paper, halftone backgrounds |
| `paper-cork.jpg/.webp` | Hero board / pinboard texture |
| `sticker-cars.jpg/.webp` | Car Club badge |
| `sticker-hoops.jpg/.webp` | Hoops badge |
| `sticker-run.jpg/.webp` | Run Club badge |
| `sticker-hardware.jpg/.webp` | Hardware badge |
| `sticker-paintball.jpg/.webp` | Paintball badge |
| `cutout-helmet.jpg/.webp` | Magazine cut-out, hero scrap |
| `cutout-sneaker.jpg/.webp` | Magazine cut-out, roster scrap |
| `scrap-note.jpg/.webp` | Hero detail and notice cards — handwritten "TRACK DAY / SAT 7AM / convoy from Pier 2". Real copy: it must be either used as-is or replaced by a newly generated note that carries the actual next-event copy, never stretched to fit unrelated text |
| `tape-strip.jpg/.webp` | Masking-tape strips for anchoring scraps and notices. Two strips on white ground: crop to one strip, `mix-blend-mode: multiply`, rotate 1–15deg off-axis, and let it cross a paper edge — never run it parallel to a scrap edge or place it centred |

All are 1024², webp + jpg. Cut-outs and `tape-strip` are on white so they can be dropped in with `mix-blend-mode: multiply`. Badge and paper assets were shot with their own paper ground, so they sit on paper, not on a flat colour. More assets on request — a second batch should be generated only after the first pass is on screen, so we generate against what the page actually needs.

QA artifacts stay out of `public/`: the contact sheet that shows the set lives at `docs/collage/collage-contact-sheet.jpg`, not in the served directory. Nothing matching `_*` ships in `public/`.

## 4. Work breakdown

| # | Package | Owner | Output |
| --- | --- | --- | --- |
| 0 | Reference read, plan, asset pack | @task-manager-coo | this doc + `public/collage/` |
| 1 | Design system for paper/collage surfaces: tokens, torn-edge masks, tape, stamp, sticker, grain, shadow, motion curves | @frontend-designer | primitives in `components/collage/`, tokens in `globals.css` |
| 2 | Hero clubhouse wall + poke-around interactions | @frontend-designer | `components/clubhouse-wall.tsx`, wired into `app/clubs/page.tsx` |
| 3 | Sticker-sheet roster, pinned event notice, club detail / calendar / apply skin | @frontend-designer | updated pages, existing links and forms preserved |
| 4 | "Cut your own" scrap table | @frontend-designer | client component, keyboard accessible |
| 5 | Build, lint, route sweep, screenshot capture, commit + push | @finc-engineer (or @frontend-designer if it already holds the branch) | clean `next build`, 21 routes, desktop/tablet/mobile shots |
| 6 | Independent visual + code audit | @task-verification-bot | pass/fail against the checklist in §6 |

Sequencing is one owner at a time on `/home/nebula/Clubs` branch `redesign/finc-clubs-v2`. Two agents editing the same tree in parallel produce conflicts, not speed.

## 5. Feedback loop

0. **The deliverable is branch + open PR + the screenshot set.** A preview tunnel (cloudflared quick tunnel) dies with its process and must never be the thing Waleed is expected to open on return: it is best-effort only, and if it is still alive when this wraps it is a bonus on top of the PR.
1. Builder self-checks: `next build`, `next lint`, then the full 12-shot matrix — 1440×900 (desktop), 834×1112 (tablet) and 390×844 (mobile) for `/clubs`, `/clubs/cars`, `/clubs/calendar` and `/clubs/apply`.
2. Designer critiques its own shots against the reference and fixes: paper believability, type contrast on kraft, tap targets, no horizontal scroll, no stuck scroll.
3. Verification bot audits independently: build, routes, contrast, mobile, reduced-motion, broken images, and that every Luma/RSVP/apply action still works.
4. Anything that fails goes back to the builder with the specific shot and the specific fix. Nothing reports as done until the audit is green.
5. Waleed reviews on return: branch, open PR (diff against `main`), the 12-shot set, and a one-paragraph what-changed. Closed PR #1 is superseded — the collage commits are carried by the new PR.

## 6. Done criteria

Every line here is pass/fail by measurement, not by impression. A criterion with no number is a criterion the audit cannot fail, so there are none.

**6.1 Build and static checks**
- `npm run build` exits 0 with no route errors; the build log lists every route below as a static or server output.
- `npm run lint` exits 0 with zero errors (warnings must be listed in the hand-off, not silently accepted).
- No file matching `public/**/_*` exists (no QA artifact in the served directory); no image in `public/collage/` is referenced by a path that does not exist.

**6.2 Route sweep — enumerated, with expected status**
Against a production build (`npm run build && npm start`), each request must return exactly the expected status:

| # | Route | Expected |
| --- | --- | --- |
| 1 | `/` | 200 |
| 2 | `/clubs` | 200 |
| 3 | `/clubs/apply` | 200 |
| 4 | `/clubs/calendar` | 200 |
| 5 | `/clubs/cars` | 200 |
| 6 | `/clubs/hardware` | 200 |
| 7 | `/clubs/basketball` | 200 |
| 8 | `/clubs/paintball` | 200 |
| 9 | `/clubs/does-not-exist` | 404 |
| 10 | `/robots.txt` | 200 |
| 11 | `/sitemap.xml` | 200 |
| 12 | `/icon` | 200 |
| 13 | `/favicon.ico` | 200 |
| 14 | `/clubs/opengraph-image` | 200, `image/*` |
| 15 | `/clubs/apply/opengraph-image` | 200, `image/*` |
| 16 | `/clubs/calendar/opengraph-image` | 200, `image/*` |
| 17 | `/clubs/cars/opengraph-image` | 200, `image/*` |
| 18 | `/clubs/hardware/opengraph-image` | 200, `image/*` |
| 19 | `/clubs/basketball/opengraph-image` | 200, `image/*` |
| 20 | `/clubs/paintball/opengraph-image` | 200, `image/*` |

Count: 19 expected-200 routes plus one expected-404 route = 20 checks. Any route added during the build gets appended to this table with its own expected status before the audit; a route that is not in the table is not audited and the audit is not green.

**6.3 Contrast (WCAG AA, measured on the rendered page)**
- Body and UI text ≥ **4.5:1**; display type ≥ 24px or ≥ 19px bold ≥ **3:1**.
- Non-text UI (control boundaries, focus rings, icon-only buttons) ≥ **3:1** against the adjacent surface.
- Palette reference values already measured from the tokens: ink `#241A15` on paper `#F4EDE1` = **14.63:1**; ink on kraft `#C9A87C` = **7.6:1**; accent `#8A2B1E` on paper = **7.38:1**; ink on accent fill `#C9752A` = **4.91:1**. Any new pairing below 4.5:1 fails.
- Text laid over a photo or textured paper counts at its worst-case pixel: sample the lightest and darkest areas under the text and use the worse of the two.

**6.4 Console and network**
- **Zero** console errors and zero uncaught exceptions on each of the eight HTML routes in 6.2, at all three viewports.
- Zero failed requests (status ≥ 400) for same-origin assets on those routes — no missing image, icon or font.
- No `hydration` / `did not match` warnings in the console.

**6.5 Layout and responsive**
- **No horizontal scroll at 390×844**: `document.documentElement.scrollWidth <= clientWidth` on every route and after every interaction state reachable on that page.
- Tablet breakpoint **834×1112** renders with no overlap, no clipped text, and no element narrower than its content; sticky elements must not swallow the scroll.
- Tap targets ≥ 44×44 CSS px on interactive elements at 390 wide; no tap target under 32px in any case.
- Every page is scrollable end-to-end at 390×844: no scroll trap (no element that pins the viewport and prevents reaching the footer).
- No image-driven layout shift: every `next/image` or `<img>` carries explicit width/height or `fill` with a sized parent.

**6.6 Reduced motion — static stack must stay usable**
With `prefers-reduced-motion: reduce` emulated:
- All content that is visible in the animated state is visible on first paint (no reveal-on-scroll hiding, no element stuck at `opacity: 0`).
- No transform/opacity animation or transition longer than 0ms runs; parallax, tilt and drag re-pin behaviour is disabled.
- The page remains fully operable: every link and button is reachable by Tab in a sane order, focus rings are visible, and nothing requires hover or drag to read or to act.
- The wall degrades to a legible static collage — it must not collapse to empty space or unpositioned images.

**6.7 Assets and performance**
- No single hero asset over **1.5 MB**; total `public/collage/` payload served on first visit under **3 MB** with the chosen formats.
- LCP image carries `priority`; every collage image is served as webp with a jpg fallback.
- No missing-image placeholder on any route.

**6.8 Behaviour preserved**
- Every Luma RSVP link on the club pages resolves to the same URL it did on `main` (diff the href sets; they must be identical).
- The apply form posts to the same endpoint with the same field names as on `main`, and a test submit succeeds.
- Calendar entries and subscribe links are unchanged in count and target against `main`.

**6.9 Aesthetic (judged against the reference, from the shots)**
- No pure-white brutalist surface left on a Clubs route: no `#FFF`/`#000` page background in the rendered output.
- Every scrap is rotated off-axis (0.5–3deg); no sticker is exactly centred; tape crosses at least one paper edge per composed group.
- Paper texture is perceptible at 100% zoom on the 1440 shot and does not tile visibly at any of the three widths.

**6.10 Delivery**
- Branch pushed, an **open** PR from `redesign/finc-clubs-v2` into `main` whose head contains the collage commits, and the 12-shot screenshot matrix (4 routes × 3 viewports) posted.
- A preview tunnel is best-effort only and is not a pass condition.
- Verification bot green on 6.1–6.10. Nothing is reported as done until then.

## 7. Risks

- **Push access.** The sandbox GitHub App has historically been f-inc-only; if the push to `wrydhan/Clubs` is refused we deliver patches + screenshots and hand Waleed the push command. Verified before the build starts, not after.
- **No deploy target.** There is no Vercel project linked to the repo in this workspace, so a public preview URL may not exist; the deliverable is then branch + PR + screenshots.
- **Disk.** The sandbox was at 94% before work started; npm cache was cleared to make room for the build.
- **Scope.** The 3D room is explicitly out of scope for this pass. If the collage wall lands well, a WebGL prop layer is a natural next iteration.
