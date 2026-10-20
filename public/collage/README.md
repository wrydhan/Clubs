# Collage asset pack — clubs clubhouse wall

Generated 2026-10-20. 1024x1024, webp + jpg (jpg for OG/fallbacks). The contact sheet that shows the set lives outside the served directory, at `docs/collage/collage-contact-sheet.jpg`, so no QA artifact ships in the deploy.

| asset | what it is | notes |
| --- | --- | --- |
| paper-kraft | scanned kraft paper with creases, coffee ring, registration marks | board + scrap fill, tiles |
| paper-cork | cork pinboard surface, evenly lit, tiles | hero board; fall back to kraft + CSS grain if it reads synthetic |
| paper-newsprint | blank aged newsprint sheet | notice paper, scrap fill |
| sticker-cars | die-cut helmet sticker on a torn kraft scrap | club badge |
| sticker-hoops | die-cut hoop sticker on cream scrap | club badge |
| sticker-run | die-cut running shoe sticker on kraft strip | club badge |
| sticker-hardware | die-cut soldering iron sticker on newsprint | club badge |
| sticker-paintball | die-cut paintball mask sticker on kraft | club badge |
| cutout-helmet | magazine cut-out, white ground | `mix-blend-mode: multiply` |
| cutout-sneaker | magazine cut-out, white ground | `mix-blend-mode: multiply` |
| scrap-note | handwritten "TRACK DAY / SAT 7AM / convoy from Pier 2" card | hero detail — real copy, reuse for other notices |
| tape-strip | two masking-tape strips on white | `multiply`, rotate freely |

Usage rules: rotate every scrap off-axis (0.5–3deg), never centre a sticker exactly, let tape cross a paper edge, keep drop shadows short and soft (paper is thin). Badges were shot with their own paper scrap, so place them on paper, not on a flat colour. Missing from this batch (generate on demand later, do not fake in CSS): polaroid frame, stamped rubber-stamp marks.
