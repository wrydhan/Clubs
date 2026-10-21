"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ApplyForm } from "@/components/apply-form";
import { Tape } from "@/components/collage/paper";
import { papers, stickerOptions, type PaperKind } from "@/lib/collage";
import s from "./desk.module.css";
import { BulldogClip, Mug, Pen, TapeRoll } from "./props";

/**
 * The first-person desk: you have just sat down at the charter table.
 *
 * Wall above, desk below, the charter laid out on the wood in front of you.
 * Three moves, all inside the room: spin the orbit of clubs on the wall, cut
 * your own sticker at the cutting table beside the charter, then sign the
 * charter. Everything is state-driven CSS: no canvas, no rAF loop, no iframes,
 * and a reduced-motion path that still lets someone finish the application.
 * The submission path lives in `apply-form.tsx` and is unchanged — this
 * component is only the room around it.
 */

type LetteringId = "plaque" | "scrawl" | "stencil";

const orbits = [
  {
    slug: "cars",
    name: "Cars",
    line: "Track days at Sonoma",
    sticker: "/collage/sticker-cars.webp",
    emblem: "cars",
    proposal: "Sonoma Track Days",
    href: "/clubs/cars",
  },
  {
    slug: "basketball",
    name: "Hoops",
    line: "Tuesday full-court runs",
    sticker: "/collage/sticker-hoops.webp",
    emblem: "basketball",
    proposal: "Tuesday Full-Court",
    href: "/clubs/basketball",
  },
  {
    slug: "hardware",
    name: "Workshops",
    line: "Machine nights at Pier 2",
    sticker: "/collage/sticker-hardware.webp",
    emblem: "hardware",
    proposal: "Machine Nights",
    href: "/clubs/hardware",
  },
  {
    slug: "paintball",
    name: "Field days",
    line: "Woodsball across the Bay",
    sticker: "/collage/sticker-paintball.webp",
    emblem: "paintball",
    proposal: "Woodsball Days",
    href: "/clubs/paintball",
  },
] as const;

const letterings: { id: LetteringId; label: string; className: string }[] = [
  { id: "plaque", label: "Plaque", className: "font-serif" },
  { id: "scrawl", label: "Handwritten", className: "scrawl" },
  { id: "stencil", label: "Stencil", className: "font-mono uppercase tracking-[0.08em] text-lg" },
];

/** Where a club sits relative to the front of the ring, in degrees, -180…180. */
function facing(spin: number, index: number): number {
  const raw = (spin + index * 90) % 360;
  return ((raw + 540) % 360) - 180;
}

const wallNotes = [
  { n: "01", title: "A specific cadence", body: "“Thursdays at 7” beats “whenever people are free.”" },
  { n: "02", title: "A real first date", body: "A date, a place, and what happens when people arrive." },
  { n: "03", title: "Ten names", body: "People you can already say will come to the first one." },
];

export function DeskScene() {
  const spinRef = useRef(0);
  const turn = useRef<{ id: number; x: number; base: number; captured: boolean } | null>(null);
  /** A press that has not passed the drag threshold yet: let its click through. */
  const dragged = useRef(false);
  const nameTouched = useRef(false);

  const [emblem, setEmblem] = useState<string>(stickerOptions[0].id);
  const [name, setName] = useState("");
  const [spin, setSpin] = useState(0);
  const [gliding, setGliding] = useState(true);
  const [orbit, setOrbit] = useState<string>(orbits[0].slug);
  const [stock, setStock] = useState<PaperKind>("kraft");
  const [lettering, setLettering] = useState<LetteringId>("plaque");
  const [tape, setTape] = useState(true);
  const [stitch, setStitch] = useState(false);
  const [settle, setSettle] = useState(0);
  const [note, setNote] = useState("");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const active = orbits.find((item) => item.slug === orbit) ?? orbits[0];
  const activeSticker = stickerOptions.find((option) => option.id === emblem) ?? stickerOptions[0];
  const activeLettering = letterings.find((item) => item.id === lettering) ?? letterings[0];
  const plate = name.trim() || "Untitled club";

  const applySpin = useCallback((value: number, glide: boolean) => {
    spinRef.current = value;
    setGliding(glide);
    setSpin(value);
  }, []);

  /** Keep the plate and the charter in step until the applicant types their own. */
  const seedName = useCallback((value: string) => {
    if (nameTouched.current) return;
    setName(value);
  }, []);

  /** Arrow buttons and arrow keys: one club per press, always a 90° snap. */
  const nudge = useCallback(
    (direction: 1 | -1) => {
      const next = spinRef.current - direction * 90;
      applySpin(next, true);
      const index = ((Math.round(-next / 90) % orbits.length) + orbits.length) % orbits.length;
      const target = orbits[index];
      setOrbit(target.slug);
      setEmblem(target.emblem);
      seedName(target.proposal);
      setNote(`${target.name} brought to the front.`);
    },
    [applySpin, seedName],
  );

  /** Clicking a club on the ring: pull it down and lay its sticker on the table. */
  function pickOrbit(slug: string) {
    const index = orbits.findIndex((item) => item.slug === slug);
    if (index < 0) return;
    const target = orbits[index];
    setOrbit(slug);
    setEmblem(target.emblem);
    seedName(target.proposal);
    applySpin(-index * 90, true);
    setSettle((value) => value + 1);
    setNote(`${target.name} cut out and laid on the table.`);
  }

  /** Pixels of horizontal travel before a press becomes a drag. Below it, a press is a tap. */
  const DRAG_THRESHOLD = 6;

  function onStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragged.current = false;
    turn.current = { id: event.pointerId, x: event.clientX, base: spinRef.current, captured: false };
    setGliding(false);
  }

  function onStagePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = turn.current;
    if (!state || state.id !== event.pointerId) return;
    const travel = event.clientX - state.x;
    // Capture only once this is unmistakably a drag, so a press that starts on a
    // club card keeps its click and can still reach pickOrbit.
    if (!state.captured) {
      if (Math.abs(travel) < DRAG_THRESHOLD) return;
      state.captured = true;
      dragged.current = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* capture unavailable */
      }
    }
    applySpin(state.base + travel * 0.55, false);
  }

  function onStagePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const state = turn.current;
    if (!state || state.id !== event.pointerId) return;
    turn.current = null;
    if (state.captured) {
      try {
        event.currentTarget.releasePointerCapture(state.id);
      } catch {
        /* already released */
      }
    }
    // A tap: the card's own click runs pickOrbit, so leave the ring and the note alone.
    if (!dragged.current) {
      const onCard = (event.target as HTMLElement | null)?.closest?.("[data-orbit-card]");
      if (onCard) return;
    }
    const snapped = Math.round(spinRef.current / 90) * 90;
    applySpin(snapped, true);
    const index = ((Math.round(-snapped / 90) % orbits.length) + orbits.length) % orbits.length;
    const target = orbits[index];
    setOrbit(target.slug);
    setEmblem(target.emblem);
    seedName(target.proposal);
    setNote(`${target.name} brought to the front.`);
  }

  function cutOut() {
    setSettle((value) => value + 1);
    setNote(`${plate} cut out and laid on the table.`);
  }

  return (
    <div className={s.scene}>
      {/* starfield, one composited layer, no rAF */}
      <div aria-hidden className={`starfield pointer-events-none ${s.starfieldLayer}`} />

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

          {/* ---------------------- 01 · the galaxy, on the wall ---------------------- */}
          <section aria-labelledby="orbit-heading" className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#f0d3a8]">
                  01 · pick your orbit
                </span>
                <h2
                  id="orbit-heading"
                  className="mt-2 font-serif text-[1.9rem] leading-[0.92] text-paper sm:text-[2.5rem]"
                >
                  Four clubs spinning on the wall.
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => nudge(-1)}
                  className="rounded-full border border-paper/30 px-3.5 py-1.5 font-mono text-[12px] text-paper/85 transition-colors hover:border-paper/60 hover:text-paper"
                  aria-label="Spin the orbit left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => nudge(1)}
                  className="rounded-full border border-paper/30 px-3.5 py-1.5 font-mono text-[12px] text-paper/85 transition-colors hover:border-paper/60 hover:text-paper"
                  aria-label="Spin the orbit right"
                >
                  →
                </button>
              </div>
            </div>

            {/* the stage: drag it to spin */}
            <div
              onPointerDown={onStagePointerDown}
              onPointerMove={onStagePointerMove}
              onPointerUp={onStagePointerUp}
              onPointerCancel={onStagePointerUp}
              onClick={() => {
                // Any click, on a card or on the stage, ends the press.
                dragged.current = false;
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  nudge(-1);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  nudge(1);
                }
              }}
              tabIndex={0}
              role="group"
              aria-label="Club orbit — drag or use the arrow keys to spin through the clubs"
              className="relative mt-5 cursor-grab touch-none select-none overflow-hidden rounded-[2px] border border-paper/10 bg-[#241a15]/80 px-4 pb-3 pt-3 shadow-[var(--shadow-lift)] outline-none focus-visible:ring-2 focus-visible:ring-[#f0d3a8]/60 active:cursor-grabbing"
              style={{ perspective: "1100px", touchAction: "pan-y" }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(244,237,225,0.10),transparent_70%)]" />
              <div
                className="relative mx-auto h-[250px] w-full max-w-[780px] sm:h-[300px]"
                style={{ transformStyle: "preserve-3d" }}
                aria-live="off"
              >
                <div
                  className={`absolute left-1/2 top-1/2 h-0 w-0 ${
                    gliding && !reduced ? "transition-transform duration-[520ms] ease-[var(--ease-paper)]" : ""
                  }`}
                  style={{ transform: `rotateY(${spin}deg)`, transformStyle: "preserve-3d" }}
                >
                  {orbits.map((item, index) => {
                    const angle = facing(spin, index);
                    const depth = Math.cos((angle * Math.PI) / 180);
                    const hidden = depth < -0.15;
                    const chosen = item.slug === orbit;
                    return (
                      <div
                        key={item.slug}
                        className="absolute left-0 top-0 w-[170px] -translate-x-1/2 -translate-y-1/2 sm:w-[212px]"
                        style={{
                          transform: `rotateY(${index * 90}deg) translateZ(var(--orbit))`,
                          opacity: hidden ? 0 : 0.35 + Math.max(0, depth) * 0.65,
                          pointerEvents: hidden ? "none" : "auto",
                          ["--orbit" as string]: "clamp(140px, 22vw, 230px)",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <button
                          type="button"
                          data-orbit-card={item.slug}
                          onClick={() => {
                            // A press that turned into a drag must not also pick the card.
                            if (dragged.current) {
                              dragged.current = false;
                              return;
                            }
                            pickOrbit(item.slug);
                          }}
                          aria-pressed={chosen}
                          className={`group relative flex w-full flex-col items-stretch bg-paper px-3 pb-2.5 pt-2 text-left shadow-[var(--shadow-lift)] transition-transform duration-200 ease-[var(--ease-paper)] hover:-translate-y-1 motion-reduce:transition-none ${
                            chosen ? "outline outline-2 outline-offset-2 outline-paper" : ""
                          }`}
                        >
                          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                            club · {item.slug}
                          </span>
                          <span className="relative mt-1.5 block aspect-square w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.sticker}
                              alt=""
                              draggable={false}
                              className="sticker-img pointer-events-none h-full w-full select-none object-contain"
                            />
                          </span>
                          <span className="mt-1.5 block font-serif text-[1.35rem] leading-[0.95] text-ink">
                            {item.name}
                          </span>
                          <span className="mt-1 block font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-3">
                            {item.line}
                          </span>
                          <span className="mt-1.5 block font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-2 underline decoration-ink/25 underline-offset-4">
                            bring it down
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-paper/15 pt-2.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/60">
                  drag to spin · ← → · {active.name.toLowerCase()} in front
                </span>
                <Link
                  href={active.href}
                  className="font-mono text-[9px] uppercase tracking-[0.14em] text-paper/80 underline decoration-paper/30 underline-offset-4 hover:text-paper"
                >
                  see the {active.name.toLowerCase()} club ↗
                </Link>
              </div>
            </div>
          </section>

          {/* pinned on the wall: what gets approved */}
          <div className={`${s.notices} mt-9`}>
            {wallNotes.map((item, index) => (
              <div
                key={item.n}
                className={s.notice}
                style={{ transform: `rotate(${index === 1 ? 1.1 : index === 0 ? -1.6 : -0.4}deg)` }}
              >
                <span className={s.noticeLine}>what gets approved · {item.n}</span>
                <p className={s.noticeTitle}>{item.title}</p>
                <p className="mt-2 max-w-[26ch] text-[11.5px] leading-snug text-[#3f3129]">
                  {item.body}
                </p>
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

          {/* what's also on the desk: the cutting table */}
          <aside className={s.side} aria-label="On the desk beside the charter">
            <div className={s.cutTable}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#45362a]">
                  02 · the cutting table
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStock("kraft");
                    setEmblem("cars");
                    setLettering("plaque");
                    setName("");
                    nameTouched.current = false;
                    setTape(true);
                    setStitch(false);
                    setSettle((value) => value + 1);
                    setNote("Fresh sheet on the table.");
                  }}
                  className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#45362a] underline decoration-[#45362a]/30 underline-offset-4 hover:text-[#241a15]"
                >
                  fresh sheet
                </button>
              </div>

              {/* the scrap you are cutting — this is what gets pinned */}
              <div
                key={settle}
                className={`${s.scrapPreview} studio-pop relative mx-auto mt-3 w-full max-w-[290px] px-5 pb-4 pt-5 ${
                  papers[stock].className
                } ${stitch ? "stitched" : ""}`}
                style={{ ["--tilt" as string]: "-1.6deg" }}
              >
                {tape ? (
                  <>
                    <Tape className="-left-5 -top-3 z-10" rotate={-22} width={84} height={24} />
                    <Tape className="-right-4 top-0 z-10" rotate={16} width={68} height={20} />
                  </>
                ) : null}
                <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-3">
                  club n° {String(orbits.findIndex((item) => item.slug === orbit) + 1).padStart(2, "0")} · pier 2
                </span>
                <div className="relative mx-auto mt-2 aspect-square w-[58%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSticker.src}
                    alt={activeSticker.label}
                    draggable={false}
                    className="sticker-img pointer-events-none h-full w-full select-none object-contain"
                  />
                </div>
                <p
                  className={`mt-2 break-words text-center text-[#241a15] ${activeLettering.className} ${
                    lettering === "plaque"
                      ? "text-[1.6rem] leading-[0.95]"
                      : lettering === "scrawl"
                        ? "text-[1.5rem] leading-[1.02]"
                        : ""
                  }`}
                >
                  {plate}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-ink/15 pt-2">
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-3">
                    {papers[stock].label}
                  </span>
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink-3">
                    founders, inc. clubs
                  </span>
                </div>
              </div>

              <fieldset className="mt-4">
                <legend className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#45362a]">
                  Paper stock
                </legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(Object.keys(papers) as PaperKind[]).map((key) => {
                    const on = stock === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setStock(key);
                          setSettle((value) => value + 1);
                        }}
                        aria-pressed={on}
                        className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                          on ? "bg-ink text-paper" : "bg-ink/10 text-ink-2 hover:bg-ink/20"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`h-4 w-4 rounded-full bg-cover bg-center ${papers[key].className} ${
                            on ? "ring-1 ring-paper/60" : "ring-1 ring-ink/15"
                          }`}
                        />
                        {papers[key].label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-3">
                <legend className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#45362a]">
                  Emblem
                </legend>
                <div className="mt-1.5 grid grid-cols-5 gap-1.5" role="group" aria-label="Club emblem">
                  {stickerOptions.map((option) => {
                    const on = emblem === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setEmblem(option.id);
                          setSettle((value) => value + 1);
                          setNote(`${option.label} pressed onto the scrap.`);
                        }}
                        aria-pressed={on}
                        title={option.label}
                        className={`relative aspect-square bg-paper transition-transform duration-150 ease-[var(--ease-paper)] hover:-translate-y-0.5 motion-reduce:transition-none ${
                          on ? "outline outline-2 outline-offset-2 outline-ink/70" : "opacity-65 hover:opacity-100"
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
              </fieldset>

              <fieldset className="mt-3">
                <legend className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#45362a]">
                  Nameplate lettering
                </legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {letterings.map((item) => {
                    const on = lettering === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLettering(item.id);
                          setSettle((value) => value + 1);
                        }}
                        aria-pressed={on}
                        className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                          on ? "bg-ink text-paper" : "bg-ink/10 text-ink-2 hover:bg-ink/20"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <label htmlFor="desk-club-name" className="mt-2.5 block">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#45362a]">
                    Write the club name on the sticker
                  </span>
                  <input
                    id="desk-club-name"
                    type="text"
                    value={name}
                    maxLength={40}
                    onChange={(event) => {
                      nameTouched.current = true;
                      setName(event.target.value);
                    }}
                    placeholder="e.g. Sonoma Track Days"
                    className="mt-1.5 w-full border-0 border-b border-dashed border-[#241a15]/40 bg-transparent px-0.5 pb-1 font-serif text-[1.25rem] leading-tight text-[#241a15] outline-none placeholder:font-sans placeholder:text-[12px] placeholder:text-[#45362a]/50 focus:border-solid focus:border-[#241a15]"
                  />
                </label>
              </fieldset>

              <fieldset className="mt-3">
                <legend className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#45362a]">
                  Finishing
                </legend>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTape((value) => !value);
                      setSettle((value) => value + 1);
                    }}
                    aria-pressed={tape}
                    className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                      tape ? "bg-ink text-paper" : "bg-ink/10 text-ink-2 hover:bg-ink/20"
                    }`}
                  >
                    {tape ? "Tape on" : "Tape off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStitch((value) => !value);
                      setSettle((value) => value + 1);
                    }}
                    aria-pressed={stitch}
                    className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                      stitch ? "bg-ink text-paper" : "bg-ink/10 text-ink-2 hover:bg-ink/20"
                    }`}
                  >
                    {stitch ? "Stitched" : "Plain edge"}
                  </button>
                  <button type="button" onClick={cutOut} className="ml-auto bg-ink px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-paper hover:bg-[#3a2b20]">
                    Cut it out →
                  </button>
                </div>
              </fieldset>

              <p
                aria-live="polite"
                className="mt-3 border-t border-[#241a15]/15 pt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-[#4a3a2c]"
              >
                {note}
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
