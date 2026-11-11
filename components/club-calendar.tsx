"use client";

import { useMemo, useState } from "react";
import {
  addCalendarDays,
  laParts,
  pacificToUtc,
  sameYmd,
  type YMD,
} from "@/lib/dates";
import { formatMonth, formatTime, laYmdFromIso } from "@/lib/format";
import { subscribeUrl } from "@/lib/site";
import type { SiteEvent } from "@/lib/events";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONDAY_INDEX: Record<string, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
};

function ymdKey(ymd: YMD): string {
  return `${ymd.year}-${ymd.month}-${ymd.day}`;
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
  const featured = events[0];

  const byDay = useMemo(() => {
    const map = new Map<string, SiteEvent[]>();
    for (const event of events) {
      const key = ymdKey(laYmdFromIso(event.datetime));
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const cells = monthCells(cursor.year, cursor.month);

  function shiftMonth(delta: number) {
    const next = addCalendarDays(cursor.year, cursor.month, 1, delta > 0 ? 32 : -2);
    setCursor({ year: next.year, month: next.month });
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Big month calendar */}
      <div className="border border-ink/15 bg-paper p-4 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-serif text-2xl text-ink sm:text-[2.2rem]">
            {formatMonth(cursor.year, cursor.month)}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-10 w-10 items-center justify-center border border-ink/15 font-mono text-sm text-ink-2 transition-colors hover:bg-ink hover:text-paper"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-10 w-10 items-center justify-center border border-ink/15 font-mono text-sm text-ink-2 transition-colors hover:bg-ink hover:text-paper"
            >
              →
            </button>
          </div>
        </div>

        <div
          className="mt-5 grid grid-cols-7 gap-px border border-ink/10 bg-ink/10"
          role="grid"
          aria-label={formatMonth(cursor.year, cursor.month)}
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="bg-paper py-2.5 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3 sm:text-[10px]"
            >
              {day}
            </div>
          ))}
          {cells.map((cell) => {
            const isToday = sameYmd(cell.ymd, today);
            const dayEvents = byDay.get(ymdKey(cell.ymd)) ?? [];
            const hasEvent = dayEvents.length > 0;
            return (
              <div
                key={ymdKey(cell.ymd)}
                className={`flex min-h-[3.6rem] flex-col gap-1 bg-paper p-1.5 sm:min-h-[6.5rem] sm:p-2.5 ${
                  cell.inMonth ? "" : "bg-paperdeep/40"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center font-mono text-[11px] tnum sm:h-7 sm:w-7 sm:text-[13px] ${
                    isToday
                      ? "bg-ink text-paper"
                      : cell.inMonth
                        ? "text-ink"
                        : "text-ink-3/50"
                  }`}
                >
                  {cell.ymd.day}
                </span>
                {hasEvent ? (
                  <div className="flex flex-col gap-1">
                    {dayEvents.map((event) => (
                      <a
                        key={event.id}
                        href={`#${event.id}`}
                        className="block border-l-2 border-ink bg-ink/5 px-1.5 py-1 font-mono text-[9px] leading-tight text-ink transition-colors hover:bg-ink hover:text-paper sm:text-[10px]"
                      >
                        <span className="hidden sm:block">{formatTime(event.datetime)}</span>
                        <span className="block truncate">{event.title}</span>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            {events.length === 0 ? "No events scheduled" : `${events.length} upcoming`}
          </p>
          <a
            href={subscribeUrl}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2 underline underline-offset-4 transition-colors hover:text-ink"
          >
            Sync calendar (.ics)
          </a>
        </div>
      </div>

      {/* Big event card */}
      {featured ? (
        <FeaturedEvent event={featured} />
      ) : (
        <div className="border border-ink/15 bg-paper px-6 py-12 text-center">
          <p className="font-serif text-3xl text-ink sm:text-4xl">No events on the books yet.</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-2">
            The next session is being confirmed. Subscribe and the dates land in your calendar the
            moment they are set.
          </p>
          <a href={subscribeUrl} className="pill-btn mt-6 inline-flex text-xs">
            Subscribe to the calendar
          </a>
        </div>
      )}
    </div>
  );
}

function FeaturedEvent({ event }: { event: SiteEvent }) {
  const day = new Date(event.datetime).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    day: "numeric",
  });
  const weekday = new Date(event.datetime).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
  });
  const month = new Date(event.datetime).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
  });

  return (
    <article
      id={event.id}
      className="scroll-mt-24 border border-ink/20 bg-paper px-5 py-8 sm:px-10 sm:py-12"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
        {/* Date block */}
        <div className="flex shrink-0 items-start gap-4 border-ink/15 lg:w-56 lg:flex-col lg:gap-1 lg:border-r lg:pr-14">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            {weekday}
          </span>
          <span className="font-serif text-[3.4rem] leading-[0.85] text-ink sm:text-[4.4rem]">
            {day}
          </span>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2">
              {month}
            </span>
            <span className="font-mono text-[11px] tnum text-ink-2">
              {formatTime(event.datetime)}
              {event.endDatetime ? `–${formatTime(event.endDatetime)}` : ""}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center border border-ink/25 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-2">
            {event.kind}
          </span>
          <h3 className="mt-4 font-serif text-[2.1rem] leading-[0.95] text-ink sm:text-[3.2rem]">
            {event.title}
          </h3>
          <p className="mt-2 font-mono text-[11px] text-ink-3">{event.location}</p>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-ink-2">
            {event.description}
          </p>

          {event.facts.length > 0 ? (
            <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-ink/15 pt-6 sm:grid-cols-4">
              {event.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 font-serif text-lg leading-tight text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {event.rsvpUrl ? (
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noreferrer"
              className="pill-btn mt-8 inline-flex text-sm"
            >
              Register your team →
            </a>
          ) : (
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
              Registration opens soon
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
