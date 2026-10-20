"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApplyForm } from "@/components/apply-form";
import { Tape } from "@/components/collage/paper";
import { papers, stickerOptions, type PaperKind } from "@/lib/collage";

/**
 * The club studio: LittleBigPlanet rules, f.inc paper.
 *
 * Three moves — pick a club from the orbit, cut your own sticker on the table,
 * pin it to the wall (the real charter form). Everything is state-driven CSS:
 * no canvas, no rAF loop, no iframes, and a reduced-motion path that still
 * lets someone finish the application.
 */

const orbits = [
  {
    slug: "cars",
    name: "Cars",
    line: "Track days at Sonoma",
    sticker: "/collage/sticker-cars.webp",
    href: "/clubs/cars",
  },
  {
    slug: "basketball",
    name: "Hoops",
    line: "Tuesday full-court runs",
    sticker: "/collage/sticker-hoops.webp",
    href: "/clubs/basketball",
  },
  {
    slug: "hardware",
    name: "Workshops",
    line: "Machine nights at Pier 2",
    sticker: "/collage/sticker-hardware.webp",
    href: "/clubs/hardware",
  },
  {
    slug: "paintball",
    name: "Field days",
    line: "Woodsball across the Bay",
    sticker: "/collage/sticker-paintball.webp",
    href: "/clubs/paintball",
  },
] as const;

const letterings = [
  { id: "plaque", label: "Plaque", className: "font-serif" },
  { id: "scrawl", label: "Handwritten", className: "scrawl" },
  { id: "stencil", label: "Stencil", className: "font-mono uppercase tracking-[0.08em] text-lg" },
] as const;

type LetteringId = (typeof letterings)[number]["id"];

function facing(spin: number, index: number): number {
  const raw = (spin + index * 90) % 360;
  const normalised = ((raw + 540) % 360) - 180;
  return normalised;
}

export function ClubStudio() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const spinRef = useRef(0);
  const turn = useRef<{ id: number; x: number; base: number } | null>(null);

  const [spin, setSpin] = useState(0);
  const [gliding, setGliding] = useState(true);
  const [orbit, setOrbit] = useState<string>(orbits[0].slug);
  const [stock, setStock] = useState<PaperKind>("kraft");
  const [emblem, setEmblem] = useState<string>(stickerOptions[0].id);
  const [lettering, setLettering] = useState<LetteringId>("plaque");
  const [name, setName] = useState("Sonoma Track Days");
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

  const applySpin = useCallback((value: number, glide: boolean) => {
    spinRef.current = value;
    setGliding(glide);
    setSpin(value);
  }, []);

  const nudge = useCallback(
    (direction: 1 | -1) => {
      const next = spinRef.current - direction * 90;
      applySpin(next, true);
      const index = ((Math.round(-next / 90) % orbits.length) + orbits.length) % orbits.length;
      const target = orbits[index];
      setOrbit(target.slug);
      setNote(`${target.name} brought to the front.`);
    },
    [applySpin],
  );

  const active = orbits.find((item) => item.slug === orbit) ?? orbits[0];
  const activeSticker = stickerOptions.find((option) => option.id === emblem) ?? stickerOptions[0];
  const activeLettering = letterings.find((item) => item.id === lettering) ?? letterings[0];

  function pickOrbit(slug: string) {
    const index = orbits.findIndex((item) => item.slug === slug);
    if (index < 0) return;
    const target = orbits[index];
    setOrbit(slug);
    setEmblem(target.sticker.includes("sticker-cars") ? "cars" : target.sticker.includes("hoops") ? "basketball" : target.sticker.includes("hardware") ? "hardware" : "paintball");
    applySpin(-index * 90, true);
    setSettle((value) => value + 1);
    setNote(`${target.name} cut out and laid on the table.`);
  }

  function onStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    turn.current = { id: event.pointerId, x: event.clientX, base: spinRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
    setGliding(false);
  }

  function onStagePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = turn.current;
    if (!state || state.id !== event.pointerId) return;
    applySpin(state.base + (event.clientX - state.x) * 0.55, false);
  }

  function onStagePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const state = turn.current;
    if (!state) return;
    turn.current = null;
    try {
      event.currentTarget.releasePointerCapture(state.id);
    } catch {
      /* already released */
    }
    const snapped = Math.round(spinRef.current / 90) * 90;
    applySpin(snapped, true);
    const index = ((Math.round(-snapped / 90) % orbits.length) + orbits.length) % orbits.length;
    setOrbit(orbits[index].slug);
    setNote(`${orbits[index].name} brought to the front.`);
  }

  return (
    <div className="relative">
      {/* starfield, one composited layer, no rAF */}
      <div
        aria-hidden
        className="starfield pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{ maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}
      />

      {/* ---------------- 01 · the galaxy ---------------- */}
      <section aria-labelledby="orbit-heading" className="mx-auto max-w-[1360px] px-5 pt-4 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="label">01 · pick your orbit</span>
            <h2 id="orbit-heading" className="mt-3 font-serif text-[2.4rem] leading-[0.9] sm:text-[3.4rem]">
              Four clubs spinning on the wall.
            </h2>
            <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ink-2">
              Spin the ring and pull one down. Start from the closest thing to what you want to
              run, or ignore all four and cut your own below.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => nudge(-1)} className="pill-btn-secondary px-4 py-2 text-[12px]" aria-label="Spin the orbit left">
              ←
            </button>
            <button type="button" onClick={() => nudge(1)} className="pill-btn-secondary px-4 py-2 text-[12px]" aria-label="Spin the orbit right">
              →
            </button>
          </div>
        </div>

        {/* the stage: drag it to spin */}
        <div
          ref={stageRef}
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={onStagePointerUp}
          onPointerCancel={onStagePointerUp}
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
          className="relative mt-10 cursor-grab touch-none select-none overflow-hidden rounded-[2px] bg-[#241a15] px-4 pb-6 pt-4 shadow-[var(--shadow-lift)] active:cursor-grabbing"
          style={{ perspective: "1100px", touchAction: "pan-y" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(244,237,225,0.10),transparent_70%)]" />
          <div
            className="relative mx-auto h-[290px] w-full max-w-[820px] sm:h-[330px]"
            style={{ transformStyle: "preserve-3d" }}
            aria-live="off"
          >
            <div
              className={`absolute left-1/2 top-1/2 h-0 w-0 ${gliding && !reduced ? "transition-transform duration-[520ms] ease-[var(--ease-paper)]" : ""}`}
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
                    className="absolute left-0 top-0 w-[190px] -translate-x-1/2 -translate-y-1/2 sm:w-[230px]"
                    style={{
                      transform: `rotateY(${index * 90}deg) translateZ(var(--orbit))`,
                      opacity: hidden ? 0 : 0.35 + Math.max(0, depth) * 0.65,
                      pointerEvents: hidden ? "none" : "auto",
                      ["--orbit" as string]: "clamp(150px, 24vw, 250px)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => pickOrbit(item.slug)}
                      aria-pressed={chosen}
                      className={`group relative flex w-full flex-col items-stretch bg-paper px-3 pb-3 pt-2 text-left shadow-[var(--shadow-lift)] transition-transform duration-200 ease-[var(--ease-paper)] hover:-translate-y-1 motion-reduce:transition-none ${
                        chosen ? "outline outline-2 outline-offset-2 outline-paper" : ""
                      }`}
                    >
                      <span className="label">club · {item.slug}</span>
                      <span className="relative mt-2 block aspect-square w-full">
                        <Image
                          src={item.sticker}
                          alt=""
                          fill
                          sizes="230px"
                          draggable={false}
                          className="sticker-img pointer-events-none object-contain"
                        />
                      </span>
                      <span className="mt-2 block font-serif text-[1.5rem] leading-[0.95]">
                        {item.name}
                      </span>
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
                        {item.line}
                      </span>
                      <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-ink-2 underline decoration-ink/25 underline-offset-4">
                        bring it down
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 pt-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/60">
              drag to spin · ← → · {active.name.toLowerCase()} in front
            </span>
            <Link
              href={active.href}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/80 underline decoration-paper/30 underline-offset-4 hover:text-paper"
            >
              see the {active.name.toLowerCase()} club ↗
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 02 · the craft table ---------------- */}
      <section aria-labelledby="cut-heading" className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="label">02 · cut your own</span>
            <h2 id="cut-heading" className="mt-3 font-serif text-[2.4rem] leading-[0.9] sm:text-[3.4rem]">
              The cutting table.
            </h2>
            <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-ink-2">
              Stock, sticker, lettering, tape. Everything you change lands on the scrap on the right
              — that scrap is what gets pinned to the wall.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSettle((value) => value + 1)}
              className="pill-btn px-4 py-2 text-[12px]"
            >
              Snap it down
            </button>
            <button
              type="button"
              onClick={() => {
                setStock("kraft");
                setEmblem("cars");
                setLettering("plaque");
                setName("Sonoma Track Days");
                setTape(true);
                setStitch(false);
                setSettle((value) => value + 1);
                setNote("Fresh sheet on the table.");
              }}
              className="pill-btn-secondary px-4 py-2 text-[12px]"
            >
              Start over
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* controls */}
          <div className="order-2 flex flex-col gap-7 lg:order-1 lg:col-span-7">
            <fieldset>
              <legend className="label">Paper stock</legend>
              <div className="mt-3 flex flex-wrap gap-2">
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
                      className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                        on ? "bg-ink text-paper" : "bg-ink/10 text-ink-2 hover:bg-ink/20"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`h-6 w-6 rounded-full bg-cover bg-center ${papers[key].className} ${
                          on ? "ring-1 ring-paper/60" : "ring-1 ring-ink/15"
                        }`}
                      />
                      {papers[key].label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label">Emblem</legend>
              <div className="mt-3 grid grid-cols-5 gap-2">
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
                      className={`relative aspect-square bg-paper transition-transform duration-150 ease-[var(--ease-paper)] hover:-translate-y-0.5 motion-reduce:transition-none ${
                        on ? "outline outline-2 outline-offset-2 outline-ink" : "opacity-70 hover:opacity-100"
                      }`}
                      title={option.label}
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

            <fieldset>
              <legend className="label">Nameplate lettering</legend>
              <div className="mt-3 flex flex-wrap gap-2">
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
                      className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                        on ? "bg-ink text-paper" : "bg-ink/10 text-ink-2 hover:bg-ink/20"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <label htmlFor="studio-name" className="mt-4 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2">
                  Club name on the plate
                </span>
                <input
                  id="studio-name"
                  type="text"
                  value={name}
                  maxLength={26}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Sonoma Track Days"
                  className="paper-field mt-2"
                />
              </label>
            </fieldset>

            <fieldset>
              <legend className="label">Finishing</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTape((value) => !value);
                    setSettle((value) => value + 1);
                  }}
                  aria-pressed={tape}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
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
                  className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                    stitch ? "bg-ink text-paper" : "bg-ink/10 text-ink-2 hover:bg-ink/20"
                  }`}
                >
                  {stitch ? "Stitched" : "Plain edge"}
                </button>
              </div>
            </fieldset>

            <p aria-live="polite" className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
              {note}
            </p>
          </div>

          {/* the scrap you are making */}
          <div className="order-1 lg:order-2 lg:col-span-5 lg:sticky lg:top-24">
            <div
              key={settle}
              className={`studio-pop paper-card relative mx-auto w-full max-w-[420px] px-6 pb-7 pt-8 ${papers[stock].className} ${
                stitch ? "stitched" : ""
              }`}
              style={{ ["--tilt" as string]: "-1.8deg" }}
            >
              {tape ? (
                <>
                  <Tape className="-left-6 -top-3 z-10" rotate={-22} width={104} height={28} />
                  <Tape className="-right-5 top-1 z-10" rotate={16} width={84} height={24} />
                </>
              ) : null}
              <span className="label">club n° {String(orbits.findIndex((item) => item.slug === orbit) + 1).padStart(2, "0")} · pier 2</span>
              <div className="relative mx-auto mt-4 aspect-square w-[74%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeSticker.src}
                  alt={activeSticker.label}
                  draggable={false}
                  className="sticker-img pointer-events-none h-full w-full select-none object-contain"
                />
              </div>
              <p
                className={`mt-4 break-words text-center ${activeLettering.className} ${
                  lettering === "plaque" ? "text-[2rem] leading-[0.95]" : lettering === "scrawl" ? "text-[1.9rem] leading-[1.02]" : ""
                }`}
              >
                {name.trim() || "Untitled club"}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-ink/15 pt-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
                  {papers[stock].label}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
                  founders, inc. clubs
                </span>
              </div>
            </div>
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
              this is the scrap that lands on the wall
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- 03 · pin it to the wall ---------------- */}
      <section
        id="form"
        aria-labelledby="pin-heading"
        className="border-t border-ink/10 bg-paperdeep/60 py-16 sm:py-24"
      >
        <div className="mx-auto grid max-w-[1360px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4">
            <span className="label">03 · pin it up</span>
            <h2 id="pin-heading" className="mt-3 font-serif text-[2.4rem] leading-[0.9] sm:text-[3.2rem]">
              The wall needs one more scrap.
            </h2>
            <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-ink-2">
              The sticker is yours. The charter is what makes it a Founders, Inc. club: a cadence, a
              first date, ten names who will actually show, and the budget it takes.
            </p>
            <ul className="mt-6 space-y-2 text-[13px] leading-snug text-ink">
              <li>— a specific cadence</li>
              <li>— a real first date</li>
              <li>— ten names who will show</li>
            </ul>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
              reviewed weekly · about two weeks to a decision
            </p>
          </div>
          <div className="lg:col-span-8">
            <ApplyForm
              stickerName={name}
              kicker="Official submission"
              heading="Pin your club to the wall."
              intro="This is the charter the campus team reads. Reviewed weekly; approved clubs get venue bookings, production support and a budget."
              submitLabel="Pin my club to the wall →"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
