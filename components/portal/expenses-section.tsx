"use client";

import { useMemo, useState } from "react";
import {
  formatMoney,
  formatVariance,
  parseMoneyInput,
  parsePercent,
  rollupByCategory,
  rollupByEvent,
  summarize,
} from "@/lib/portal/compute";
import {
  CATEGORY_LABEL,
  EXPENSE_CATEGORIES,
  EXPENSE_STATUSES,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
  type PlannedEvent,
} from "@/lib/portal/types";
import { centsToInput, requestSnapshot, type PortalSnapshot } from "@/components/portal/client";

type Props = {
  initial: PortalSnapshot;
  /** Hide the per-event table when the dashboard already shows events above. */
  showEventRollup?: boolean;
};

const STATUS_LABEL: Record<ExpenseStatus, string> = {
  planned: "Planned",
  quoted: "Quoted",
  committed: "Committed",
  paid: "Paid",
};

export function ExpensesSection({ initial, showEventRollup = true }: Props) {
  const [snapshot, setSnapshot] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openEventId, setOpenEventId] = useState<string>("all");

  const { expenses, events } = snapshot;

  const totals = useMemo(() => summarize(expenses), [expenses]);
  const categories = useMemo(() => rollupByCategory(expenses), [expenses]);
  const byEvent = useMemo(() => rollupByEvent(expenses, events), [expenses, events]);

  const eventName = (id: string | null) =>
    events.find((event) => event.id === id)?.name ?? "Campus overhead";

  const visible = openEventId === "all" ? expenses : expenses.filter((row) => (row.eventId ?? "none") === openEventId);

  async function commit(row: Expense, patch: Partial<Expense>) {
    setBusyId(row.id);
    setError(null);
    try {
      const next = await requestSnapshot("/portal/api/expenses", {
        method: "PATCH",
        body: JSON.stringify({ id: row.id, ...patch }),
      });
      setSnapshot(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: Expense) {
    setBusyId(row.id);
    setError(null);
    try {
      const next = await requestSnapshot(`/portal/api/expenses?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      setSnapshot(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete");
    } finally {
      setBusyId(null);
    }
  }

  const peak = Math.max(totals.budgeted, totals.actual, 1);

  return (
    <section aria-labelledby="expenses-heading" className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">02 / Money</p>
          <h2 id="expenses-heading" className="mt-2 font-serif text-[2.4rem] leading-[0.9] sm:text-[3rem]">
            Budget vs actual.
          </h2>
          <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ink-2">
            Every line is budgeted against an event. Blank means nobody has quoted it yet — it is
            not zero, and it is counted separately below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Stat label="Budgeted" value={formatMoney(totals.budgeted)} note={`${totals.lineCount - totals.unbudgetedCount} of ${totals.lineCount} lines`} />
          <Stat label="Actual" value={formatMoney(totals.actual)} note={`${totals.lineCount - totals.unspentCount} invoiced`} />
          <Stat
            label="Variance"
            value={formatVariance(totals.variance)}
            note="over invoiced lines"
            tone={totals.variance > 0 ? "bad" : "good"}
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-[8px] bg-white/8 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {/* budget / actual bar for the whole programme */}
      <div className="mt-8 rounded-[15px] bg-surface p-5">
        <Bar label="Budgeted" cents={totals.budgeted} peak={peak} />
        <Bar label="Actual" cents={totals.actual} peak={peak} muted />
        {totals.unbudgetedCount > 0 ? (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            {totals.unbudgetedCount} line{totals.unbudgetedCount === 1 ? "" : "s"} still unquoted
          </p>
        ) : null}
      </div>

      {/* category roll-up */}
      <div className="mt-10">
        <h3 className="label">By category</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                <th className="py-2 pr-4 font-normal">Category</th>
                <th className="py-2 pr-4 text-right font-normal">Lines</th>
                <th className="py-2 pr-4 text-right font-normal">Budgeted</th>
                <th className="py-2 pr-4 text-right font-normal">Actual</th>
                <th className="py-2 pr-4 text-right font-normal">Variance</th>
                <th className="py-2 font-normal">Share of budget</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {categories.map((row) => (
                <tr key={row.category} className="border-t border-line">
                  <td className="py-2 pr-4">{row.label}</td>
                  <td className="py-2 pr-4 text-right text-ink-soft">
                    {row.lineCount}
                    {row.unbudgetedCount > 0 ? ` · ${row.unbudgetedCount} unquoted` : ""}
                  </td>
                  <td className="py-2 pr-4 text-right">{formatMoney(row.budgeted)}</td>
                  <td className="py-2 pr-4 text-right">{formatMoney(row.actual)}</td>
                  <td className={`py-2 pr-4 text-right ${row.variance > 0 ? "font-medium" : ""}`}>
                    {row.lineCount - row.unbudgetedCount === 0 ? "—" : formatVariance(row.variance)}
                  </td>
                  <td className="py-2">
                    <span className="block h-[6px] w-full max-w-[180px] rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-ink"
                        style={{ width: `${Math.round(parsePercent(row.budgeted, totals.budgeted || 1) * 100)}%` }}
                      />
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-ink">
                <td className="py-2 pr-4 font-medium">Total</td>
                <td className="py-2 pr-4 text-right text-ink-soft">{totals.lineCount}</td>
                <td className="py-2 pr-4 text-right font-medium">{formatMoney(totals.budgeted)}</td>
                <td className="py-2 pr-4 text-right font-medium">{formatMoney(totals.actual)}</td>
                <td className="py-2 pr-4 text-right font-medium">{formatVariance(totals.variance)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* per-event roll-up */}
      {showEventRollup ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byEvent.map((row) => (
            <div key={row.eventId ?? "overhead"} className="finc-card p-5">
              <p className="label">{row.status}</p>
              <h4 className="mt-2 font-serif text-[1.35rem] leading-tight">{row.name}</h4>
              <dl className="tnum mt-4 grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-ink-soft">Cap</dt>
                <dd className="text-right">{formatMoney(row.budgetTotal)}</dd>
                <dt className="text-ink-soft">Budgeted</dt>
                <dd className="text-right">{formatMoney(row.budgeted)}</dd>
                <dt className="text-ink-soft">Actual</dt>
                <dd className="text-right">{formatMoney(row.actual)}</dd>
                <dt className="text-ink-soft">Headroom</dt>
                <dd className="text-right">{formatMoney(row.headroom)}</dd>
              </dl>
            </div>
          ))}
        </div>
      ) : null}

      {/* line items */}
      <div className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="label">Line items</h3>
          <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
            Event
            <select
              value={openEventId}
              onChange={(event) => setOpenEventId(event.target.value)}
              className="rounded-[8px] bg-white/8 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink"
            >
              <option value="all">All</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
              {expenses.some((row) => row.eventId == null) ? <option value="none">Overhead</option> : null}
            </select>
          </label>
        </div>

        <ul className="mt-3 divide-y divide-line">
          {visible.map((row) => (
            <ExpenseRow
              key={row.id}
              row={row}
              eventName={eventName(row.eventId)}
              options={events}
              busy={busyId === row.id}
              onCommit={(patch) => commit(row, patch)}
              onRemove={() => remove(row)}
            />
          ))}
          {visible.length === 0 ? (
            <li className="py-6 text-sm text-ink-soft">No lines for this event yet.</li>
          ) : null}
        </ul>

        <NewExpenseForm
          events={events}
          defaultEventId={openEventId === "all" || openEventId === "none" ? null : openEventId}
          onCreated={setSnapshot}
          onError={setError}
        />
      </div>
    </section>
  );
}

function Stat({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "good" | "bad" }) {
  return (
    <div className="min-w-[128px] rounded-[15px] bg-surface px-4 py-3">
      <p className="label">{label}</p>
      <p className={`tnum mt-1 font-serif text-[1.6rem] leading-none ${tone === "bad" ? "" : ""}`}>{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">{note}</p>
    </div>
  );
}

function Bar({ label, cents, peak, muted }: { label: string; cents: number; peak: number; muted?: boolean }) {
  const width = Math.max(0, Math.min(1, cents / peak)) * 100;
  return (
    <div className="mt-2 first:mt-0">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        <span>{label}</span>
        <span className="tnum text-ink">{formatMoney(cents)}</span>
      </div>
      <span className="mt-1 block h-[10px] w-full rounded-full bg-white/10">
        <span
          className={`block h-full rounded-full ${muted ? "bg-[rgba(0,0,0,0.35)]" : "bg-ink"}`}
          style={{ width: `${width}%` }}
        />
      </span>
    </div>
  );
}

function ExpenseRow({
  row,
  eventName,
  options,
  busy,
  onCommit,
  onRemove,
}: {
  row: Expense;
  eventName: string;
  options: PlannedEvent[];
  busy: boolean;
  onCommit: (patch: Partial<Expense>) => void;
  onRemove: () => void;
}) {
  const [budgeted, setBudgeted] = useState(centsToInput(row.budgeted));
  const [actual, setActual] = useState(centsToInput(row.actual));

  function saveMoney(field: "budgeted" | "actual", raw: string) {
    try {
      const cents = parseMoneyInput(raw);
      const current = field === "budgeted" ? row.budgeted : row.actual;
      if (cents !== current) onCommit({ [field]: cents });
    } catch {
      // Invalid entry: put the stored value back so the row never shows a lie.
      const restore = centsToInput(field === "budgeted" ? row.budgeted : row.actual);
      if (field === "budgeted") setBudgeted(restore);
      else setActual(restore);
    }
  }

  return (
    <li className={`py-4 ${busy ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <div className="min-w-[220px] flex-1">
          <p className="text-[15px] leading-snug">{row.lineItem}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            {eventName} · {CATEGORY_LABEL[row.category]}
            {row.vendor ? ` · ${row.vendor}` : ""}
          </p>
          {row.note ? <p className="mt-1 text-xs leading-relaxed text-ink-2">{row.note}</p> : null}
        </div>

        <label className="block">
          <span className="label">Budgeted</span>
          <span className="mt-1 flex items-center gap-1">
            <span className="text-sm text-ink-soft">$</span>
            <input
              inputMode="decimal"
              value={budgeted}
              placeholder="unquoted"
              onChange={(event) => setBudgeted(event.target.value)}
              onBlur={(event) => saveMoney("budgeted", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className="tnum w-[92px] rounded-[8px] bg-white/8 px-2 py-1 text-sm"
            />
          </span>
        </label>

        <label className="block">
          <span className="label">Actual</span>
          <span className="mt-1 flex items-center gap-1">
            <span className="text-sm text-ink-soft">$</span>
            <input
              inputMode="decimal"
              value={actual}
              placeholder="not invoiced"
              onChange={(event) => setActual(event.target.value)}
              onBlur={(event) => saveMoney("actual", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className="tnum w-[92px] rounded-[8px] bg-white/8 px-2 py-1 text-sm"
            />
          </span>
        </label>

        <label className="block">
          <span className="label">Status</span>
          <select
            value={row.status}
            onChange={(event) => onCommit({ status: event.target.value as ExpenseStatus })}
            className="mt-1 rounded-[8px] bg-white/8 px-2 py-1 text-sm"
          >
            {EXPENSE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label">Event</span>
          <select
            value={row.eventId ?? ""}
            onChange={(event) => onCommit({ eventId: event.target.value || null })}
            className="mt-1 max-w-[190px] rounded-[8px] bg-white/8 px-2 py-1 text-sm"
          >
            <option value="">Overhead</option>
            {options.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onRemove}
          className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
        >
          Remove
        </button>
      </div>
    </li>
  );
}

function NewExpenseForm({
  events,
  defaultEventId,
  onCreated,
  onError,
}: {
  events: PlannedEvent[];
  defaultEventId: string | null;
  onCreated: (next: PortalSnapshot) => void;
  onError: (message: string | null) => void;
}) {
  const [lineItem, setLineItem] = useState("");
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("misc");
  const [eventId, setEventId] = useState(defaultEventId ?? "");
  const [budgeted, setBudgeted] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!lineItem.trim()) {
      onError("Give the line an item name");
      return;
    }
    setSaving(true);
    onError(null);
    try {
      let cents: number | null = null;
      try {
        cents = parseMoneyInput(budgeted);
      } catch {
        throw new Error("Budgeted must be a dollar amount, or blank");
      }
      const next = await requestSnapshot("/portal/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          lineItem: lineItem.trim(),
          vendor: vendor.trim() || undefined,
          category,
          eventId: eventId || null,
          budgeted: cents,
          actual: null,
          status: "planned",
        }),
      });
      onCreated(next);
      setLineItem("");
      setVendor("");
      setBudgeted("");
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Could not add the line");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-[15px] bg-surface p-4">
      <p className="label">Add a line</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block flex-1 min-w-[180px]">
          <span className="label">Item</span>
          <input
            value={lineItem}
            onChange={(event) => setLineItem(event.target.value)}
            placeholder="Court rental, tees, security…"
            className="mt-1 w-full rounded-[8px] bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block min-w-[120px]">
          <span className="label">Vendor</span>
          <input
            value={vendor}
            onChange={(event) => setVendor(event.target.value)}
            className="mt-1 w-full rounded-[8px] bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="label">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
            className="mt-1 rounded-[8px] bg-paper px-2 py-2 text-sm"
          >
            {EXPENSE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Event</span>
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="mt-1 rounded-[8px] bg-paper px-2 py-2 text-sm"
          >
            <option value="">Overhead</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Budgeted $</span>
          <input
            value={budgeted}
            onChange={(event) => setBudgeted(event.target.value)}
            inputMode="decimal"
            placeholder="blank"
            className="tnum mt-1 w-[100px] rounded-[8px] bg-paper px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" disabled={saving} className="pill-btn">
          {saving ? "Saving…" : "Add line"}
        </button>
      </div>
    </form>
  );
}
