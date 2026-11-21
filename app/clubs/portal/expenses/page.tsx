import type { Metadata } from "next";
import Link from "next/link";
import { ExpensesSection } from "@/components/portal/expenses-section";
import { PlanningSection } from "@/components/portal/planning-section";
import { readEvents, readExpenses } from "@/lib/portal/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Expenses & planning — Clubs portal",
  description: "Budget vs actual by event and category, plus the book of upcoming club dates.",
  robots: { index: false, follow: false },
};

/**
 * The planning half of the clubs portal: expenses (budget vs actual) and the
 * future-event book. It is written to sit directly under the funnel dashboard
 * as `<ExpensesSection …/>` then `<PlanningSection …/>`; this route is the
 * standalone mount so the section can be reviewed and worked on alone.
 *
 * No auth here on purpose — the shell that gates /clubs/portal owns that.
 */
export default async function PortalPlanningPage() {
  const [expenses, events] = await Promise.all([readExpenses(), readEvents()]);
  const initial = { expenses, events };

  return (
    <main className="min-h-screen pb-24">
      <section className="mx-auto max-w-[1360px] px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          <Link href="/clubs" className="inline-flex min-h-[32px] items-center hover:text-ink">
            Founders, Inc. Clubs
          </Link>
          <span>/</span>
          <span className="text-ink">Portal / planning</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h1 className="font-serif text-[3rem] leading-[0.86] sm:text-[4.4rem]">
              The books, and what&apos;s next.
            </h1>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <div className="rounded-[15px] bg-surface px-5 py-4">
              <p className="label">Internal</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                Editing here writes the live planning figures. Nothing on this page is public.
              </p>
            </div>
          </div>
        </div>

        <ExpensesSection initial={initial} />
        <PlanningSection initial={initial} />
      </section>
    </main>
  );
}
