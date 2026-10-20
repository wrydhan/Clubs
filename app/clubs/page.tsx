import type { Metadata } from "next";
import Link from "next/link";
import { ClubhouseWall } from "@/components/collage/clubhouse-wall";
import { StickerSheet } from "@/components/collage/sticker-sheet";
import { PinnedNotice } from "@/components/collage/pinned-notice";
import { Scrap, Tape, Pin, Stamp } from "@/components/collage/paper";
import { getEvents, sortClubs } from "@/lib/clubs";

export const metadata: Metadata = {
  title: "Founders, Inc. — Clubs | A wall to poke around in",
  description:
    "Member-run clubs at Founders, Inc. Fort Mason Pier 2, San Francisco. Flagship Car Club track days at Sonoma Raceway, Hardware Workshop, Basketball, and Paintball.",
  alternates: { canonical: "/clubs" },
};

const tenets = [
  {
    n: "01",
    kicker: "Culture",
    title: "Zero pitch decks",
    body: "Clubs exist outside work. No business cards, no investor intros. You are here for the driving line, the sport, or the machine.",
    tone: "news" as const,
    rotate: -1.4,
  },
  {
    n: "02",
    kicker: "Budget",
    title: "Subsidised track time",
    body: "Real money for circuit slots at Sonoma, gym bookings, raw workshop material and hospitality. Not a salary, not a blank cheque.",
    tone: "cream" as const,
    rotate: 1.1,
  },
  {
    n: "03",
    kicker: "Production",
    title: "An in-house media crew",
    body: "Our media team films track sessions, garage builds and games. That archive is how the next room fills up.",
    tone: "kraft" as const,
    rotate: -0.7,
  },
];

export default function ClubsPage() {
  const now = new Date();
  const ordered = sortClubs(now);
  const nextEvent = getEvents(now)[0];

  return (
    <main className="min-h-screen">
      <ClubhouseWall nextEvent={nextEvent} />

      {/* the roster, as a sheet of stickers */}
      <section id="roster" className="mx-auto max-w-[1360px] scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="label">The sticker sheet</span>
            <h2 className="mt-3 font-serif text-[2.6rem] leading-[0.92] sm:text-[3.6rem]">
              Four clubs, all pinned.
            </h2>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-ink-2">
              Every club on the board is run by someone who wanted it to exist. Peeling a sticker
              off takes you to the club.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              {ordered.length} clubs · season running
            </span>
            <Link href="/clubs/calendar" className="pill-btn-secondary">
              The calendar →
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <StickerSheet clubs={ordered} now={now} />
        </div>
      </section>

      {/* next session, pinned */}
      {nextEvent ? (
        <section className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <span className="label">Pinned to the board</span>
            <Link
              href="/clubs/calendar"
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 underline decoration-ink/25 underline-offset-4 hover:text-ink"
            >
              Everything on the calendar →
            </Link>
          </div>
          <PinnedNotice event={nextEvent} />
        </section>
      ) : null}

      {/* the studio, where a club gets made */}
      <section className="border-y border-ink/10 bg-paperdeep/60 py-16 sm:py-24">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <span className="label">Make your own</span>
              <h2 className="mt-3 font-serif text-[2.6rem] leading-[0.92] sm:text-[3.6rem]">
                The cutting table became the studio.
              </h2>
              <p className="mt-4 max-w-[56ch] text-sm leading-relaxed text-ink-2">
                Starting a club now means making its sticker: spin the orbit of clubs, cut your own
                scrap from stock, sticker, tape and lettering, then pin it to the wall. The pin is
                the real charter — cadence, first date, ten names.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/clubs/apply" className="pill-btn">
                  Open the studio →
                </Link>
                <Link href="/clubs/calendar" className="pill-btn-secondary">
                  What&apos;s already pinned
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end">
              <Scrap tone="kraft" rotate={1.8} className="relative w-full max-w-[320px] px-6 py-6">
                <Tape className="-left-5 -top-3" rotate={-20} width={92} height={26} />
                <span className="label">in the studio</span>
                <ul className="mt-3 space-y-1.5 text-[13px] leading-snug text-ink">
                  <li>— spin a galaxy of clubs</li>
                  <li>— cut a sticker on the table</li>
                  <li>— pin the charter to the wall</li>
                </ul>
                <Stamp className="mt-4">reviewed weekly</Stamp>
              </Scrap>
            </div>
          </div>
        </div>
      </section>

      {/* how f.inc backs it */}
      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4">
            <span className="label">Why these exist</span>
            <h2 className="mt-3 font-serif text-[2.6rem] leading-[0.92] sm:text-[3.4rem]">
              Founders, Inc. backs the room.
            </h2>
            <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-ink-2">
              A budget, space at Pier 2, and a media team. You run the sessions on the schedule
              you promised.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/clubs/apply" className="pill-btn">
                Start a club
              </Link>
              <Link href="/clubs/cars" className="pill-btn-secondary">
                Car Club first
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-8 lg:pl-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {tenets.map((tenet) => (
                <Scrap
                  key={tenet.n}
                  tone={tenet.tone}
                  rotate={tenet.rotate}
                  className="relative px-5 py-6"
                >
                  <Tape className="-top-3 left-5" rotate={-14} width={72} height={24} />
                  <span className="label">{tenet.kicker}</span>
                  <h3 className="mt-3 font-serif text-[1.7rem] leading-[0.95]">{tenet.title}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{tenet.body}</p>
                  <span className="mt-4 block font-mono text-[10px] tracking-[0.14em] text-ink-3">
                    {tenet.n}
                  </span>
                </Scrap>
              ))}
            </div>
            <Pin className="right-2 top-10 hidden lg:block" />
          </div>
        </div>
      </section>
    </main>
  );
}
