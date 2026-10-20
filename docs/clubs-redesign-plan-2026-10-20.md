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

All are 1024², webp + jpg. Cut-outs are on white so they can be dropped in with `mix-blend-mode: multiply`. More assets on request — a second batch should be generated only after the first pass is on screen, so we generate against what the page actually needs.

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

1. Builder self-checks: `next build`, `next lint`, then screenshots at 1440×900, 834×1112 and 390×844 for `/clubs`, `/clubs/cars`, `/clubs/calendar`, `/clubs/apply`.
2. Designer critiques its own shots against the reference and fixes: paper believability, type contrast on kraft, tap targets, no horizontal scroll, no stuck scroll.
3. Verification bot audits independently: build, routes, contrast, mobile, reduced-motion, broken images, and that every Luma/RSVP/apply action still works.
4. Anything that fails goes back to the builder with the specific shot and the specific fix. Nothing reports as done until the audit is green.
5. Waleed reviews on return: branch + PR + screenshot set + a one-paragraph what-changed.

## 6. Done criteria

- Warm paper/collage aesthetic on every Clubs route; no pure-white brutalist surfaces left.
- Hero is interactive and survives a phone: parallax/tilt/drag degrade to a clean static stack under reduced motion and on touch.
- All 21 routes build; no missing-image placeholders in new work.
- RSVP links, apply form, calendar and subscribe links unchanged in behaviour.
- Lighthouse-adjacent sanity: no layout shift from images, no multi-MB single hero asset, LCP image priority-set.
- Screenshots posted for desktop and mobile; verification bot green.

## 7. Risks

- **Push access.** The sandbox GitHub App has historically been f-inc-only; if the push to `wrydhan/Clubs` is refused we deliver patches + screenshots and hand Waleed the push command. Verified before the build starts, not after.
- **No deploy target.** There is no Vercel project linked to the repo in this workspace, so a public preview URL may not exist; the deliverable is then branch + PR + screenshots.
- **Disk.** The sandbox was at 94% before work started; npm cache was cleared to make room for the build.
- **Scope.** The 3D room is explicitly out of scope for this pass. If the collage wall lands well, a WebGL prop layer is a natural next iteration.
