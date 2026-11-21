"use client";

import { useMemo, useState } from "react";
import { formatMoney, nextEvent, rollupByEvent } from "@/lib/portal/compute";
import { EVENT_STATUSES, type EventStatus, type PlannedEvent } from "@/lib/portal/types";
import { requestSnapshot, type PortalSnapshot } from "@/components/portal/client";

type Props = {
  initial: PortalSnapshot;
};

const STATUS_LABEL: Record<EventStatus, string> = {
  planning: "Planning",
  confirmed: "Confirmed",
  locked: "Locked",
  live: "Live",
  done: "Done",
  cancelled: "Cancelled",
};

function formatEventDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatClock(value: string): string {
  const [hoursRaw, minutes] = value.split(":");
  const hours = Number(hoursRaw);
  const suffix = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes} ${suffix}`;
}

export function PlanningSection({ initial }: Props) {
  const [snapshot, setSnapshot] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { expenses, events } = snapshot;
  const rollups = useMemo(() => rollupByEvent(expenses, events), [expenses, events]);
  const upcoming = useMemo(() => nextEvent(events), [events]);
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [events],
  );

  const rollupFor = (id: string) => rollups.find((row) => row.eventId === id);

  async function commit(event: PlannedEvent, patch: Partial<PlannedEvent>) {
    setBusyId(event.id);
    setError(null);
    try {
      const next = await requestSnapshot("/clubs/portal/api/events", {
        method: "PATCH",
        body: JSON.stringify({ id: event.id, ...patch }),
      });
      setSnapshot(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the event");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(event: PlannedEvent) {
    setBusyId(event.id);
    setError(null);
    try {
      const next = await requestSnapshot(`/clubs/portal/api/events?id=${encodeURIComponent(event.id)}`, {
        method: "DELETE",
      });
      setSnapshot(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the event");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-labelledby="planning-heading" className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">03 / Calendar</p>
          <h2 id="planning-heading" className="mt-2 font-serif text-[2.4rem] leading-[0.9] sm:text-[3rem]">
            What&apos;s coming.
          </h2>
          <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ink-2">
            Every booked date with its owner and where it stands. Budget and spend pull from the
            expense lines tagged to each event.
          </p>
        </div>
        {upcoming ? (
          <div className="max-w-[300px] rounded-[15px] bg-ink px-5 py-4 text-paper">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.65)]">
              Next up
            </p>
            <p className="mt-2 font-serif text-[1.5rem] leading-tight">{upcoming.name}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(255,255,255,0.75)]">
              {formatEventDate(upcoming.date)} · {formatClock(upcoming.startTime)}–{formatClock(upcoming.endTime)}
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-[8px] bg-[rgba(0,0,0,0.06)] px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <ul className="mt-8 space-y-4">
        {sorted.map((event) => {
          const money = rollupFor(event.id);
          return (
            <li
              key={event.id}
              className={`finc-card p-5 ${busyId === event.id ? "opacity-60" : ""} ${
                event.status === "cancelled" ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[240px] flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                    {formatEventDate(event.date)} · {formatClock(event.startTime)}–{formatClock(event.endTime)}
                  </p>
                  <h3 className="mt-1 font-serif text-[1.6rem] leading-tight">{event.name}</h3>
                  <p className="mt-1 text-sm text-ink-2">
                    {event.venue}
                    {event.room ? `, ${event.room}` : ""}
                    {event.attendance ? ` · ${event.attendance}` : ""}
                  </p>
                  {event.notes ? (
                    <p className="mt-2 max-w-[62ch] text-xs leading-relaxed text-ink-soft">{event.notes}</p>
                  ) : null}
                </div>

                <div className="tnum grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <span className="text-ink-soft">Cap</span>
                  <span className="text-right">{formatMoney(event.budgetTotal)}</span>
                  <span className="text-ink-soft">Budgeted</span>
                  <span className="text-right">{formatMoney(money?.budgeted ?? null)}</span>
                  <span className="text-ink-soft">Actual</span>
                  <span className="text-right">{formatMoney(money?.actual ?? null)}</span>
                  <span className="text-ink-soft">Headroom</span>
                  <span className="text-right">{formatMoney(money?.headroom ?? null)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-4">
                <label className="block">
                  <span className="label">Owner</span>
                  <input
                    defaultValue={event.owner}
                    onBlur={(input) => {
                      const value = input.target.value.trim();
                      if (value && value !== event.owner) commit(event, { owner: value });
                      else input.target.value = event.owner;
                    }}
                    onKeyDown={(input) => {
                      if (input.key === "Enter") input.currentTarget.blur();
                    }}
                    className="mt-1 w-[180px] rounded-[8px] bg-[rgba(0,0,0,0.05)] px-2 py-1 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="label">Status</span>
                  <select
                    value={event.status}
                    onChange={(input) => commit(event, { status: input.target.value as EventStatus })}
                    className="mt-1 rounded-[8px] bg-[rgba(0,0,0,0.05)] px-2 py-1 text-sm"
                  >
                    {EVENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="label">Date</span>
                  <input
                    type="date"
                    defaultValue={event.date}
                    onBlur={(input) => {
                      if (input.target.value && input.target.value !== event.date) {
                        commit(event, { date: input.target.value });
                      }
                    }}
                    className="mt-1 rounded-[8px] bg-[rgba(0,0,0,0.05)] px-2 py-1 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="label">Budget cap $</span>
                  <input
                    defaultValue={event.budgetTotal == null ? "" : String(event.budgetTotal / 100)}
                    placeholder="none set"
                    inputMode="decimal"
                    onBlur={(input) => {
                      const raw = input.target.value.trim();
                      if (raw === "") {
                        if (event.budgetTotal != null) commit(event, { budgetTotal: null });
                        return;
                      }
                      const cents = Math.round(Number(raw.replace(/[$,\s]/g, "")) * 100);
                      if (Number.isFinite(cents) && cents >= 0 && cents !== event.budgetTotal) {
                        commit(event, { budgetTotal: cents });
                      }
                    }}
                    className="tnum mt-1 w-[110px] rounded-[8px] bg-[rgba(0,0,0,0.05)] px-2 py-1 text-sm"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => remove(event)}
                  className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
        {sorted.length === 0 ? (
          <li className="py-6 text-sm text-ink-soft">No events on the books yet.</li>
        ) : null}
      </ul>

      <NewEventForm onCreated={setSnapshot} onError={setError} />
    </section>
  );
}

function NewEventForm({
  onCreated,
  onError,
}: {
  onCreated: (next: PortalSnapshot) => void;
  onError: (message: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("22:00");
  const [venue, setVenue] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<EventStatus>("planning");
  const [saving, setSaving] = useState(false);

  async function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!name.trim() || !date || !venue.trim() || !owner.trim()) {
      onError("Name, date, venue and owner are required");
      return;
    }
    setSaving(true);
    onError(null);
    try {
      const next = await requestSnapshot("/clubs/portal/api/events", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          date,
          startTime,
          endTime,
          venue: venue.trim(),
          owner: owner.trim(),
          status,
          budgetTotal: null,
        }),
      });
      onCreated(next);
      setName("");
      setDate("");
      setVenue("");
      setOwner("");
      setStatus("planning");
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Could not add the event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-[15px] bg-surface p-4">
      <p className="label">Book a date</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block flex-1 min-w-[180px]">
          <span className="label">Event</span>
          <input
            value={name}
            onChange={(input) => setName(input.target.value)}
            placeholder="Rooftop dinner, workshop night…"
            className="mt-1 w-full rounded-[8px] bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="label">Date</span>
          <input
            type="date"
            value={date}
            onChange={(input) => setDate(input.target.value)}
            className="mt-1 rounded-[8px] bg-paper px-2 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="label">Start</span>
          <input
            type="time"
            value={startTime}
            onChange={(input) => setStartTime(input.target.value)}
            className="mt-1 rounded-[8px] bg-paper px-2 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="label">End</span>
          <input
            type="time"
            value={endTime}
            onChange={(input) => setEndTime(input.target.value)}
            className="mt-1 rounded-[8px] bg-paper px-2 py-2 text-sm"
          />
        </label>
        <label className="block min-w-[160px]">
          <span className="label">Venue</span>
          <input
            value={venue}
            onChange={(input) => setVenue(input.target.value)}
            className="mt-1 w-full rounded-[8px] bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="label">Owner</span>
          <input
            value={owner}
            onChange={(input) => setOwner(input.target.value)}
            className="mt-1 w-[150px] rounded-[8px] bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select
            value={status}
            onChange={(input) => setStatus(input.target.value as EventStatus)}
            className="mt-1 rounded-[8px] bg-paper px-2 py-2 text-sm"
          >
            {EVENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={saving} className="pill-btn">
          {saving ? "Saving…" : "Add event"}
        </button>
      </div>
    </form>
  );
}
