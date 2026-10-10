import type { Metadata } from "next";
import Link from "next/link";
import { ApplyForm } from "@/components/apply-form";
import { perks, steps } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Charter a Club — Founders, Inc. Clubs",
  description:
    "Apply to run a Founders, Inc. club in San Francisco. We provide budgets, track bookings at Sonoma, workshop space at Fort Mason, and media production.",
  alternates: { canonical: "/clubs/apply" },
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header Banner */}
      <header className="px-6 pt-12 pb-10 sm:px-8 sm:pt-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-mono text-[11px] text-black/50">
          <span className="font-semibold text-black">FOUNDERS, INC. CAMPUS</span>
          <span>/</span>
          <span>CLUB CHARTER APPLICATION</span>
        </div>

        <div className="mt-8 max-w-3xl">
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-black leading-none">
            Charter a Club.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-black/70 leading-relaxed font-sans">
            If you have been gathering founders in group chats for track sessions, basketball runs, or workshop builds, this is how it becomes an official institution. We subsidize venue access, track days, court fees, and equipment. You run the sessions.
          </p>
        </div>
      </header>

      {/* Process / Steps */}
      <section className="px-6 py-12 sm:px-8 max-w-7xl mx-auto">
        <div className="finc-card p-8 sm:p-12">
          <span className="font-mono text-xs uppercase tracking-wider text-black/40">
            Charter Process
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-black">
            How It Works
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.n}
                className="bg-white p-6 rounded-[12px] flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-black/50 font-semibold">
                    {step.n}
                  </span>
                  <h3 className="mt-3 font-serif text-2xl text-black">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-black/60 leading-relaxed font-sans">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Founders, Inc. Provides */}
      <section className="px-6 py-8 sm:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <span className="font-mono text-xs uppercase tracking-wider text-black/40">
            Support & Resources
          </span>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-black">
            What Founders, Inc. Subsidizes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk) => (
            <div
              key={perk.label}
              className="finc-card p-6 sm:p-8"
            >
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/5 text-black">
                {perk.label}
              </span>
              <p className="mt-4 text-sm text-black/70 leading-relaxed font-sans">
                {perk.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section id="form" className="px-6 py-16 sm:px-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-black/40">
            Official Submission
          </span>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl text-black">
            Charter Proposal
          </h2>
          <p className="mt-2 text-sm text-black/60 font-sans">
            Reviewed weekly by the Founders, Inc. campus team. Approved clubs receive venue bookings, production media support, and budgets.
          </p>
        </div>

        <ApplyForm />
      </section>
    </main>
  );
}
