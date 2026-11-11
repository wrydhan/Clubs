"use client";

import { useMemo, useState } from "react";
import {
  addCalendarDays,
  compareYmd,
  laParts,
  pacificToUtc,
  sameYmd,
  startOfWeekMonday,
  ymdKey,
  type YMD,
} from "@/lib/dates";
import { formatMonth, formatMonthDay, formatTime, formatWeekday, formatYmd, laYmdFromIso } from "@/lib/format";
import { subscribeUrl } from "@/lib/site";
import type { SiteEvent } from "@/lib/events";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONDAY_INDEX: Record<string, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
};

function weekLabel(start: YMD, today: YMD): string {
  const thisWeek = startOfWeekMonday(pacificToUtc(today.year, today.month, today.day, 12, 0));
  const nextWeek = addCalendarDays(thisWeek.year, thisWeek.month, thisWeek.day, 7);
  if (sameYmd(start, thisWeek)) return "This week";
  if (sameYmd(start, nextWeek)) return "Next week";
  const end = addCalendarDays(start.year, start.month, start.day, 6);
  return `${formatYmd(start)} – ${formatYmd(end)}`;
}

function monthCells(year: number, month: number): { ymd: YMD; inMonth: boolean }[] {
  const first = laParts(pacificToUtc(year, month, 1, 12, 0));
  const start = addCalendarDays(year, month, 1, -MONDAY_INDEX[first.weekday]);
  const cells: { ymd: YMD; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i += 1) {
    const ymd = addCalendarDays(start.year, start.month, start.day, i);
    cells.push({ ymd, inMonth: ymd.year === year && ymd.month === month });
  }
  while (cells.length > 28 && cells.slice(-7).every((cell) => !cell.inMonth)) {
    cells.splice(-7, 7);
  }
  return cells;
}

export function ClubCalendar({
  events,
  todayIso,
}: {
  events: SiteEvent[];
  todayIso: string;
}) {
  const today = laYmdFromIso(todayIso);
  const [cursor, setCursor] = useState({ year: today.year, month: today.month });

  const weeks = useMemo(() => {
    if (events.length === 0) return [];
    const thisWeek = startOfWeekMonday(pacificToUtc(today.year, today.month, today.day, 12, 0));
    const last = laYmdFromIso(events[events.length - 1].datetime);
    const lastWeek = startOfWeekMonday(pacificToUtc(last.year, last.month, last.day, 12, 0));
    const buckets: { start: YMD; events: SiteEvent[] }[] = [];
    let cursorWeek = thisWeek;
    let guard = 0;
    while (compareYmd(cursorWeek, lastWeek) <= 0 && guard < 520) {
      const key = ymdKey(cursorWeek);
      const inWeek = events.filter((event) => ymdKey(startOfWeekMonday(new Date(event.datetime))) === key);
      if (inWeek.length > 0) buckets.push({ start: cursorWeek, events: inWeek });
      cursorWeek = addCalendarDays(cursorWeek.year, cursorWeek.month, cursorWeek.day, 7);
      guard += 1;
    }
    return buckets;
  }, [events, today]);

  const cells = monthCells(cursor.year, cursor.month);
  const monthEvents = events.filter((event) => {
    const ymd = laYmdFromIso(event.datetime);
    return ymd.year === cursor.year && ymd.month === cursor.month;
  });

  function shiftMonth(delta: number) {
    const next = addCalendarDays(cursor.year, cursor.month, 1, delta > 0 ? 32 : -2);
    setCursor({ year: next.year, month: next.month });
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
      {/* Agenda */}
      <div>
        {events.length === 0 ? (
          <div className="border-t border-ink/15 py-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">Schedule</p>
            <p className="mt-3 font-serif text-3xl text-ink sm:text-4xl">No events on the books yet.</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-2">
              The next session is being confirmed. Subscribe and the dates land in your calendar the
              moment they are set.
            </p>
            <a href={subscribeUrl} className="pill-btn mt-6 inline-flex text-xs">
              Subscribe to the calendar
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {weeks.map((week) => (
              <section key={ymdKey(week.start)} aria-labelledby={`week-${ymdKey(week.start)}`}>
                <div className="flex items-center gap-3 border-b border-ink/15 pb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/50" />
                  <h3 id={`week-${ymdKey(week.start)}`} className="font-serif text-2xl text-ink sm:text-[1.9rem]">
                    {weekLabel(week.start, today)}
                  </h3>
                </div>
                <ul className="mt-5 flex flex-col gap-4">
                  {week.events.map((event) => (
                    <li key={event.id} id={event.id} className="scroll-mt-24">
                      <EventRow event={event} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Month grid */}
      <div className="order-first lg:order-none lg:sticky lg:top-24">
        <div className="border border-ink/15 bg-paper p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-ink">{formatMonth(cursor.year, cursor.month)}</h3>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center border border-ink/15 text-ink-2 transition-colors hover:bg-ink hover:text-paper"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center border border-ink/15 text-ink-2 transition-colors hover:bg-ink hover:text-paper"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center" role="grid" aria-label={formatMonth(cursor.year, cursor.month)}>
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1 font-mono text-[9px] uppercase tracking-wide text-ink-3">
                {day}
              </div>
            ))}
            {cells.map((cell) => {
              const isToday = sameYmd(cell.ymd, today);
              const dayEvents = monthEvents.filter((ev) => sameYmd(laYmdFromIso(ev.datetime), cell.ymd));
              const hasEvent = dayEvents.length > 0;
              return (
                <div
                  key={ymdKey(cell.ymd)}
                  className={`flex h-9 flex-col items-center justify-center font-mono text-[11px] tnum ${
                    cell.inMonth ? "text-ink" : "text-ink-3/50"
                  } ${isToday ? "bg-ink text-paper" : hasEvent ? "bg-ink/10 font-semibold" : ""}`}
                >
                  <span>{cell.ymd.day}</span>
                  {hasEvent && !isToday ? <span className="mt-0.5 block h-1 w-1 rounded-full bg-ink" /> : null}
                </div>
              );
            })}
          </div>

          {monthEvents.length > 0 ? (
            <div className="mt-4 space-y-1.5 border-t border-ink/15 pt-4">
              {monthEvents.map((event) => (
                <a
                  key={event.id}
                  href={`#${event.id}`}
                  className="block font-mono text-[11px] text-ink-2 transition-colors hover:text-ink"
                >
                  {formatMonthDay(event.datetime)} · {event.title}
                </a>
              ))}
            </div>
          ) : null}

          <a
            href={subscribeUrl}
            className="mt-5 flex w-full items-center justify-center border border-ink/20 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2 transition-colors hover:bg-ink hover:text-paper"
          >
            Sync calendar (.ics)
          </a>
        </div>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: SiteEvent }) {
  return (
    <article className="group relative border border-ink/15 bg-paper px-5 py-6 transition-colors hover:border-ink/30 sm:px-7 sm:py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
        <div className="shrink-0 sm:w-24">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
            {formatWeekday(event.datetime)}
          </span>
          <span className="my-1 block font-serif text-[2.4rem] leading-none text-ink">
            {new Date(event.datetime).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", day: "numeric" })}
          </span>
          <span className="block font-mono text-[11px] tnum text-ink-2">
            {formatTime(event.datetime)}
            {event.endDatetime ? `–${formatTime(event.endDatetime)}` : ""}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center border border-ink/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-2">
            {event.kind}
          </span>
          <h4 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-[1.9rem]">{event.title}</h4>
          <p className="mt-1 font-mono text-[11px] text-ink-3">{event.location}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">{event.description}</p>

          {event.facts.length > 0 ? (
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {event.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">{fact.label}</dt>
                  <dd className="mt-0.5 font-serif text-base text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {event.rsvpUrl ? (
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noreferrer"
              className="pill-btn mt-6 inline-flex text-xs"
            >
              RSVP →
            </a>
          ) : (
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              Registration opens soon
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
