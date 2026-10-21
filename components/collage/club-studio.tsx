import Link from "next/link";
import { DeskScene } from "@/components/desk/desk-scene";
import { Scrap, Tape, Stamp } from "@/components/collage/paper";
import { perks, steps } from "@/lib/copy";

/**
 * The start-a-club flow, rebuilt as a first-person chair at a desk.
 *
 * Above: the wall and the three things that get approved.
 * On the desk: the charter form, laid on real paper, with the sticker sheet
 * beside it. Below: what happens after you slide the sheet across, and what
 * Founders, Inc. puts in. The submission path lives in `apply-form.tsx` and is
 * unchanged — this component is only the room around it.
 */
export function ClubStudio() {
  return (
    <div className="relative">
      {/* the desk itself */}
      <div id="studio" className="scroll-mt-16">
        <DeskScene />
      </div>

      {/* ---------------------- under the desk: the process ---------------------- */}
      <section
        aria-labelledby="process-heading"
        className="relative bg-paperdeep/70 shadow-[inset_0_30px_34px_-34px_rgba(36,26,21,0.85)]"
      >
        <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="label">Under the desk · after you slide the sheet across</span>
              <h2 id="process-heading" className="mt-3 max-w-[20ch] font-serif text-[2.2rem] leading-[0.92] sm:text-[3rem]">
                Cut, pin, wait about two weeks.
              </h2>
            </div>
            <Link href="/clubs" className="pill-btn-secondary self-start px-4 py-2 text-[12px]">
              ← Back to the wall
            </Link>
          </div>

          <ol className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.n}>
                <Scrap
                  tone={index % 2 === 0 ? "kraft" : "news"}
                  rotate={index % 2 === 0 ? -1.2 : 1.4}
                  className="relative h-full px-5 py-6"
                >
                  <Tape className="-top-3 left-4" rotate={index % 2 === 0 ? -18 : 14} width={68} height={22} />
                  <span className="font-mono text-[11px] tracking-[0.14em] text-ink-3">{step.n}</span>
                  <h3 className="mt-3 font-serif text-[1.7rem] leading-[0.95]">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{step.body}</p>
                </Scrap>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------- what f.inc subsidises ---------------------- */}
      <section aria-labelledby="support-heading" className="bg-paper">
        <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <span className="label">Support</span>
              <h2 id="support-heading" className="mt-3 max-w-[16ch] font-serif text-[2.2rem] leading-[0.92] sm:text-[3rem]">
                What Founders, Inc. subsidises.
              </h2>
              <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-ink-2">
                Enough to run the thing properly. Not a salary and not a blank cheque.
              </p>
              <Scrap tone="kraft" rotate={-2} className="relative mt-7 px-5 py-5">
                <Tape className="-right-4 -top-3" rotate={26} width={84} height={24} />
                <p className="label">Still deciding?</p>
                <p className="mt-2 text-[13px] leading-snug text-ink">
                  Read the four clubs already on the calendar, or come to a session before you
                  write a charter.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link href="/clubs/calendar" className="pill-btn-ghost">
                    The calendar
                  </Link>
                  <Link
                    href="/clubs"
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 underline decoration-ink/25 underline-offset-4 hover:text-ink"
                  >
                    the wall ↗
                  </Link>
                </div>
              </Scrap>
            </div>
            <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-8">
              {perks.map((perk) => (
                <li key={perk.label} className="border-t border-ink/15 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                    {perk.label}
                  </span>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink">{perk.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-12 flex justify-center">
            <Stamp>reviewed weekly</Stamp>
          </div>
        </div>
      </section>
    </div>
  );
}
