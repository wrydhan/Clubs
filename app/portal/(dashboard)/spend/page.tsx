import type { Metadata } from "next";
import { Card, Chip, Drawer, Kpi, PageTitle } from "@/components/portal/dark/ui";
import { GroupedBars } from "@/components/portal/dark/charts";
import { ExpensesSection } from "@/components/portal/expenses-section";
import { formatMoney, formatVariance, rollupByCategory, rollupByEvent, summarize } from "@/lib/portal/compute";
import { readEvents, readExpenses } from "@/lib/portal/store";

export const metadata: Metadata = {
  title: "Spend",
  robots: { index: false, follow: false },
};

/**
 * Spend tab: four numbers, one budget-vs-actual chart by category, then the
 * per-event bars. The line-item editor sits folded at the bottom so the tab
 * opens as a picture, not a form.
 */
export default async function SpendPage() {
  const [expenses, events] = await Promise.all([readExpenses(), readEvents()]);
  const totals = summarize(expenses);
  const categories = rollupByCategory(expenses);
  const byEvent = rollupByEvent(expenses, events);
  const quoted = totals.lineCount - totals.unbudgetedCount;

  return (
    <>
      <PageTitle
        eyebrow="Clubs · money"
        title="Spend"
        right={
          <>
            <Chip>{`${totals.lineCount} lines`}</Chip>
            <Chip tone="outline">{`${totals.lineCount - totals.unspentCount} invoiced`}</Chip>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Budgeted" value={formatMoney(totals.budgeted)} note={`${quoted} of ${totals.lineCount} lines`} tone="strong" />
        <Kpi label="Invoiced" value={formatMoney(totals.actual)} note={`${totals.lineCount - totals.unspentCount} lines`} />
        <Kpi label="Variance" value={formatVariance(totals.variance)} note="invoiced vs budgeted" tone="dim" />
        <Kpi
          label="Unquoted"
          value={String(totals.unbudgetedCount)}
          note={totals.unbudgetedCount === 1 ? "line has no price yet" : "lines have no price yet"}
          tone="dim"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="By category" hint="budget vs invoiced">
          <GroupedBars
            rows={categories.map((row) => ({
              label: `${row.label} · ${formatMoney(row.budgeted)}`,
              first: row.budgeted,
              second: row.actual,
            }))}
            firstLabel="Budgeted"
            secondLabel="Invoiced"
          />
        </Card>

        <Card title="By event" hint="budgeted">
          <GroupedBars
            rows={byEvent.map((row) => ({
              label: `${row.name} · ${formatMoney(row.budgeted)}`,
              first: row.budgeted,
              second: row.actual,
            }))}
            firstLabel="Budgeted"
            secondLabel="Invoiced"
          />
          <ul className="mt-4 space-y-1.5">
            {byEvent.map((row) => (
              <li key={row.eventId ?? "overhead"} className="flex justify-between text-[11.5px] text-ink-soft">
                <span className="truncate pr-3">{row.name}</span>
                <span className="tabular-nums">
                  cap {formatMoney(row.budgetTotal)} · headroom {formatMoney(row.headroom)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Drawer label="Edit line items">
        <ExpensesSection initial={{ expenses, events }} showEventRollup={false} />
      </Drawer>
    </>
  );
}
