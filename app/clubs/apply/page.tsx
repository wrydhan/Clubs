import type { Metadata } from "next";
import Link from "next/link";
import { ClubStudio } from "@/components/collage/club-studio";
import { Scrap, Tape, Stamp } from "@/components/collage/paper";
import { perks, steps } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Charter a Club — Founders, Inc. Clubs",
  description:
    "Apply to run a Founders, Inc. club in San Francisco. We provide budgets, track bookings at Sonoma, workshop space at Fort Mason, and media production.",
  alternates: { canonical: "/clubs/apply" },
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-[1360px] px-5 pb-12 pt-12 sm:px-8 sm:pt-16">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          <Link href="/clubs" className="inline-flex min-h-[32px] items-center hover:text-ink">
            Founders, Inc. Campus
          </Link>
          <span>/</span>
          <span className="text-ink">Club charter</span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h1 className="font-serif text-[3rem] leading-[0.86] sm:text-[4.4rem]">
              Make your own club.
            </h1>
            <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-ink-2 sm:text-lg">
              Starting a club means making its sticker: spin the orbit, cut the scrap, pin it to the
              wall. The pin is a real charter — cadence, first date, ten names — and we subsidise the
              venue, the track time, the court fees and the equipment. You run the sessions.
            </p>
            <a href="#studio" className="pill-btn mt-7">
              Open the studio ↓
            </a>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end">
            <Scrap tone="kraft" rotate={-2} className="relative px-6 py-6">
              <Tape className="-right-5 -top-3" rotate={26} width={96} height={28} />
              <p className="label">What gets approved</p>
              <ul className="mt-3 space-y-2 text-[13px] leading-snug text-ink">
                <li>— a specific cadence</li>
                <li>— a real first date</li>
                <li>— ten names who will show</li>
              </ul>
              <Stamp className="mt-4">reviewed weekly</Stamp>
            </Scrap>
          </div>
        </div>
      </section>

      {/* process, as four taped scraps */}
      <section className="mx-auto max-w-[1360px] px-5 py-8 sm:px-8 sm:py-12">
        <span className="label">Charter process</span>
        <h2 className="mt-3 font-serif text-[2.2rem] leading-[0.95] sm:text-[3rem]">
          Cut, pin, wait about two weeks.
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>

      {/* what f.inc subsidises */}
      <section className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4">
            <span className="label">Support</span>
            <h2 className="mt-3 font-serif text-[2.2rem] leading-[0.95] sm:text-[3rem]">
              What Founders, Inc. subsidises.
            </h2>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-ink-2">
              Enough to run the thing properly. Not a salary and not a blank cheque.
            </p>
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
      </section>

      {/* the studio: galaxy, cutting table, and the charter itself */}
      <div id="studio" className="scroll-mt-20 border-t border-ink/10">
        <ClubStudio />
      </div>
    </main>
  );
}
