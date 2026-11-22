import type { Metadata } from "next";
import { Card, Chip, Drawer, Kpi, Meter, PageTitle } from "@/components/portal/dark/ui";
import { PlanningSection } from "@/components/portal/planning-section";
import { formatMoney, nextEvent, rollupByEvent } from "@/lib/portal/compute";
import { readEvents, readExpenses } from "@/lib/portal/store";

export const metadata: Metadata = {
  title: "What's next",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function eventDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T12:00:00Z`));
}

/**
 * What's next: the forward calendar as cards with a spend meter each, and the
 * event editor folded away underneath.
 */
export default async function PlanningPage() {
  const [events, expenses] = await Promise.all([readEvents(), readExpenses()]);
  const rollups = rollupByEvent(expenses, events);
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const next = nextEvent(events);
  const committed = rollups.reduce((sum, row) => sum + row.budgeted, 0);

  return (
    <>
      <PageTitle
        eyebrow="Clubs · calendar"
        title="What's next"
        right={
          <>
            <Chip>{`${sorted.length} dates`}</Chip>
            {next ? <Chip tone="solid">{eventDate(next.date)}</Chip> : null}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Next up" value={next ? next.name : "—"} note={next ? eventDate(next.date) : "nothing booked"} tone="strong" />
        <Kpi label="Budgeted ahead" value={formatMoney(committed)} note="across all dates" />
        <Kpi
          label="With a cap"
          value={String(sorted.filter((event) => event.budgetTotal != null).length)}
          note={`of ${sorted.length}`}
          tone="dim"
        />
        <Kpi
          label="Capped spend"
          value={formatMoney(
            sorted.reduce((sum, event) => sum + (event.budgetTotal ?? 0), 0),
          )}
          note="agreed caps"
          tone="dim"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sorted.map((event) => {
          const money = rollups.find((row) => row.eventId === event.id);
          const cap = event.budgetTotal ?? 0;
          return (
            <Card key={event.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    {eventDate(event.date)} · {event.startTime}–{event.endTime}
                  </p>
                  <h2 className="mt-1 text-[16px] font-medium leading-snug text-ink">{event.name}</h2>
                  <p className="mt-0.5 truncate text-[12px] text-ink-soft">
                    {event.venue}
                    {event.room ? `, ${event.room}` : ""}
                    {event.attendance ? ` · ${event.attendance}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-soft">
                  {event.status}
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                  <span>budgeted {formatMoney(money?.budgeted ?? null)}</span>
                  <span>cap {formatMoney(event.budgetTotal)}</span>
                </div>
                <Meter value={money?.budgeted ?? 0} max={cap || Math.max(money?.budgeted ?? 0, 1)} />
                <p className="mt-1.5 text-[11px] text-ink-soft">
                  invoiced {formatMoney(money?.actual ?? null)} · headroom {formatMoney(money?.headroom ?? null)}
                </p>
              </div>
            </Card>
          );
        })}
        {sorted.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-[13px] text-ink-soft">No dates on the books yet.</p>
          </Card>
        ) : null}
      </div>

      <Drawer label="Edit events">
        <PlanningSection initial={{ expenses, events }} />
      </Drawer>
    </>
  );
}
