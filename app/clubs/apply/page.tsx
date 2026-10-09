import type { Metadata } from "next";
import Link from "next/link";
import { ApplyForm } from "@/components/apply-form";
import { ClubImage } from "@/components/club-image";
import { FaqList } from "@/components/faq";
import { expectations, goodApplication, perks, steps, timeline } from "@/lib/copy";
import { getClubs } from "@/lib/clubs";

export const metadata: Metadata = {
  title: "Start a Club — Founders, Inc. Clubs",
  description:
    "Apply to run a Founders, Inc. club in San Francisco. We provide budgets, space at Fort Mason, logistics, and media production. You host it.",
  alternates: { canonical: "/clubs/apply" },
};

export default function ApplyPage() {
  const running = getClubs().filter((club) => club.status === "active");

  return (
    <main className="min-h-screen">
      {/* Header Banner */}
      <header className="border-b border-[#e5e2da] bg-[#f9f8f5] px-4 py-16 sm:px-6 md:py-24 lg:px-8 dark:border-[#262626] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#737373]">
            <span className="text-[#0a0a0a] dark:text-[#f9f8f5]">Founders, Inc. Clubs</span>
            <span>/</span>
            <span>Charter Application</span>
          </div>

          <div className="mt-8 max-w-3xl">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] text-[#0a0a0a] dark:text-[#f9f8f5]">
              Start a Club.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
              If you have been holding a community or subculture together in group chats, this is how it becomes an institution. We subsidize venue access, track days, court fees, and gear. You lead the sessions.
            </p>
          </div>
        </div>
      </header>

      {/* How it Works */}
      <section className="border-b border-[#e5e2da] bg-white px-4 py-16 sm:px-6 md:py-20 lg:px-8 dark:border-[#262626] dark:bg-[#121212]">
        <div className="mx-auto max-w-7xl">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
            Process
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[#0a0a0a] dark:text-[#f9f8f5]">
            How It Works
          </h2>

          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <li
                key={step.n}
                className="border border-[#e5e2da] bg-[#f9f8f5] p-6 flex flex-col justify-between dark:border-[#262626] dark:bg-[#141414]"
              >
                <div>
                  <span className="font-mono text-xs text-[#0a0a0a] dark:text-[#f9f8f5] font-semibold">
                    {step.n}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl text-[#0a0a0a] dark:text-[#f9f8f5]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What Founders, Inc. Provides */}
      <section className="border-b border-[#e5e2da] bg-[#f9f8f5] px-4 py-16 sm:px-6 md:py-20 lg:px-8 dark:border-[#262626] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
            Backing
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[#0a0a0a] dark:text-[#f9f8f5]">
            What Founders, Inc. Provides
          </h2>

          <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk) => (
              <div
                key={perk.label}
                className="border border-[#e5e2da] bg-white p-6 dark:border-[#262626] dark:bg-[#121212]"
              >
                <dt className="font-mono text-[10px] uppercase tracking-wider text-[#0a0a0a] dark:text-[#f9f8f5] font-semibold">
                  {perk.label}
                </dt>
                <dd className="mt-3 text-sm text-[#404040] dark:text-[#a3a3a3] leading-relaxed">
                  {perk.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Application Form */}
      <section id="form" className="px-4 py-16 sm:px-6 md:py-24 lg:px-8 bg-white dark:bg-[#121212]">
        <div className="mx-auto max-w-2xl">
          <div className="border-b border-[#e5e2da] pb-6 dark:border-[#262626]">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
              Application
            </span>
            <h2 className="mt-2 font-serif text-4xl text-[#0a0a0a] dark:text-[#f9f8f5]">
              Charter Form
            </h2>
            <p className="mt-2 text-sm text-[#404040] dark:text-[#a3a3a3]">
              Applications are reviewed on a rolling basis. Direct proposals get prioritized.
            </p>
          </div>

          <div className="mt-8">
            <ApplyForm />
          </div>
        </div>
      </section>
    </main>
  );
}
