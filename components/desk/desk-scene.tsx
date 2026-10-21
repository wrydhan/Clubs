"use client";

import { useState } from "react";
import { ApplyForm } from "@/components/apply-form";
import { stickerOptions } from "@/lib/collage";
import s from "./desk.module.css";
import { BulldogClip, Mug, Pen, TapeRoll } from "./props";

/**
 * The first-person desk: you have just sat down at the charter table.
 *
 * Wall above, desk below, the charter laid out on the wood in front of you.
 * The sticker sheet on the right is the only optional move — pick an emblem and
 * write the name, and whatever you write is the club name on the charter.
 */

const wallNotes = [
  { n: "01", title: "A specific cadence", body: "“Thursdays at 7” beats “whenever people are free.”" },
  { n: "02", title: "A real first date", body: "A date, a place, and what happens when people arrive." },
  { n: "03", title: "Ten names", body: "People you can already say will come to the first one." },
];

export function DeskScene() {
  const [emblem, setEmblem] = useState<string>(stickerOptions[0].id);
  const [name, setName] = useState("");

  const active = stickerOptions.find((option) => option.id === emblem) ?? stickerOptions[0];

  return (
    <div className={s.scene}>
      {/* ------------------------------- wall ------------------------------- */}
      <div className={s.wall}>
        <div aria-hidden className={s.lampGlow} />
        <div aria-hidden className={s.pendant}>
          <span className={s.pendantCord} />
          <span className={s.pendantShade} />
          <span className={s.pendantGlow} />
        </div>
        <div aria-hidden className={s.rail} />

        <div className="relative mx-auto max-w-[1180px]">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-paper/70">
            <span>Founders, Inc. campus</span>
            <span aria-hidden>/</span>
            <span className="text-paper/75">Club charter</span>
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#f0d3a8]">
                The charter desk · Pier 2, Fort Mason
              </span>
              <h1 className="mt-3 max-w-[18ch] font-serif text-[2.9rem] leading-[0.86] text-paper sm:text-[4.2rem]">
                Make your own club.
              </h1>
            </div>
            <p className="max-w-[44ch] text-[13.5px] leading-relaxed text-paper/80">
              A club is a real charter: a cadence, a first date, ten names who will show. Write it
              on the sheet below and we book the venue, the track time, the court, the machines.
              You run the sessions.
            </p>
          </div>

          {/* pinned on the wall: what gets approved */}
          <div className={`${s.notices} mt-9`}>
            {wallNotes.map((note, index) => (
              <div
                key={note.n}
                className={s.notice}
                style={{ transform: `rotate(${index === 1 ? 1.1 : index === 0 ? -1.6 : -0.4}deg)` }}
              >
                <span className={s.noticeLine}>what gets approved · {note.n}</span>
                <p className={s.noticeTitle}>{note.title}</p>
                <p className="mt-2 max-w-[26ch] text-[11.5px] leading-snug text-[#3f3129]">{note.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-paper/55">
            <span aria-hidden className="inline-block h-8 w-[1px] bg-gradient-to-b from-transparent to-paper/40" />
            the charter is on the desk
          </p>
        </div>
      </div>

      {/* ------------------------------- desk ------------------------------- */}
      <div className={s.deskWrap}>
        <div aria-hidden className={s.deskPlane} />
        <div aria-hidden className={s.deskEdge} />

        {/* props, desktop only — nothing here is focusable */}
        <div aria-hidden className={`${s.prop} ${s.mugProp}`}>
          <Mug />
        </div>
        <div aria-hidden className={`${s.prop} ${s.penProp}`}>
          <Pen />
        </div>
        <div aria-hidden className={`${s.prop} ${s.tapeProp}`}>
          <TapeRoll />
        </div>
        <div aria-hidden className={`${s.prop} ${s.clipProp}`}>
          <BulldogClip />
        </div>

        <div className={s.workspace}>
          {/* the charter itself */}
          <div className={s.charter}>
            <ApplyForm
              stickerName={name}
              kicker="Official submission"
              heading="Pin your club to the wall."
              intro="This is the charter the campus team reads. Reviewed weekly; approved clubs get venue bookings, production support and a budget."
              submitLabel="Pin my club to the wall →"
            />
          </div>

          {/* what's also on the desk */}
          <aside className={s.side} aria-label="On the desk beside the charter">
            <div className={s.stickerSheet}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#45362a]">
                  Sticker sheet
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4a3a2c]">
                  pick one
                </span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1.5" role="group" aria-label="Club emblem">
                {stickerOptions.map((option) => {
                  const on = emblem === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setEmblem(option.id)}
                      aria-pressed={on}
                      title={option.label}
                      className={`relative aspect-square rounded-[1px] transition-transform duration-150 ease-[var(--ease-paper)] hover:-translate-y-0.5 motion-reduce:transition-none ${
                        on
                          ? "outline outline-2 outline-offset-2 outline-ink/70"
                          : "opacity-65 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={option.src}
                        alt={option.label}
                        draggable={false}
                        className="sticker-img pointer-events-none h-full w-full select-none object-contain"
                      />
                    </button>
                  );
                })}
              </div>

              <label htmlFor="desk-club-name" className="mt-4 block">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#45362a]">
                  Write the club name on the sticker
                </span>
                <input
                  id="desk-club-name"
                  type="text"
                  value={name}
                  maxLength={40}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Sonoma Track Days"
                  className="mt-1.5 w-full border-0 border-b border-dashed border-[#241a15]/40 bg-transparent px-0.5 pb-1 font-serif text-[1.35rem] leading-tight text-[#241a15] outline-none placeholder:font-sans placeholder:text-[13px] placeholder:text-[#45362a]/50 focus:border-solid focus:border-[#241a15]"
                />
              </label>
              <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-[#4a3a2c]">
                {active.label.toLowerCase()} · this name fills in the charter
              </p>
            </div>

            <div className={s.deckNote}>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#45362a]">
                What f.inc puts in
              </span>
              <ul className="mt-2.5 space-y-1.5 text-[12.5px] leading-snug text-[#241a15]">
                <li>— the real cost of the night</li>
                <li>— the workshop, the gym, or a room at Pier 2</li>
                <li>— the calendar, the RSVP, the media team</li>
              </ul>
              <p className="mt-3 border-t border-[#241a15]/15 pt-2.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-[#45362a]">
                Not a salary. Not a blank cheque.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
