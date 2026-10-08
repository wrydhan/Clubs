"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { formatFullDate, formatMonth, formatTime, formatWeekday, formatYmd, laYmdFromIso } from "@/lib/format";
import { subscribeUrl } from "@/lib/site";

export type CalendarEvent = {
  id: string;
  clubSlug: string;
  clubName: string;
  title: string;
  datetime: string;
  location: string;
  rsvpUrl: string;
  description: string;
  capacity?: number;
};

type ClubFilter = { slug: string; name: string };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function weekLabel(start: YMD, today: YMD): string {
  const thisWeek = startOfWeekMonday(pacificToUtc(today.year, today.month, today.day, 12, 0));
  const nextWeek = addCalendarDays(thisWeek.year, thisWeek.month, thisWeek.day, 7);
  if (sameYmd(start, thisWeek)) return "This Week";
  if (sameYmd(start, nextWeek)) return "Next Week";
  const end = addCalendarDays(start.year, start.month, start.day, 6);
  return `${formatYmd(start)} – ${formatYmd(end)}`;
}

const MONDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

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

export function CalendarView({
  events,
  clubs,
  todayIso,
}: {
  events: CalendarEvent[];
  clubs: ClubFilter[];
  todayIso: string;
}) {
  const today = laYmdFromIso(todayIso);
  const [filter, setFilter] = useState("all");
  const [cursor, setCursor] = useState({ year: today.year, month: today.month });

  const visible = useMemo(
    () => (filter === "all" ? events : events.filter((event) => event.clubSlug === filter)),
    [events, filter],
  );

  const weeks = useMemo(() => {
    if (visible.length === 0) return [];
    const thisWeek = startOfWeekMonday(pacificToUtc(today.year, today.month, today.day, 12, 0));
    const last = laYmdFromIso(visible[visible.length - 1].datetime);
    const lastWeek = startOfWeekMonday(pacificToUtc(last.year, last.month, last.day, 12, 0));
    const buckets: { start: YMD; events: CalendarEvent[] }[] = [];
    let cursorWeek = thisWeek;
    while (compareYmd(cursorWeek, lastWeek) <= 0) {
      const key = ymdKey(cursorWeek);
      const inWeek = visible.filter((event) => ymdKey(startOfWeekMonday(new Date(event.datetime))) === key);
      if (filter === "all" || inWeek.length > 0) {
        buckets.push({ start: cursorWeek, events: inWeek });
      }
      cursorWeek = addCalendarDays(cursorWeek.year, cursorWeek.month, cursorWeek.day, 7);
    }
    return buckets;
  }, [visible, today, filter]);

  const cells = monthCells(cursor.year, cursor.month);
  const monthEvents = visible.filter((event) => {
    const ymd = laYmdFromIso(event.datetime);
    return ymd.year === cursor.year && ymd.month === cursor.month;
  });

  function shiftMonth(delta: number) {
    const next = addCalendarDays(cursor.year, cursor.month, 1, delta > 0 ? 32 : -2);
    setCursor({ year: next.year, month: next.month });
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
      {/* Club Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-6" role="toolbar" aria-label="Filter by club">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Filter:</span>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All Events
        </FilterChip>
        {clubs.map((club) => (
          <FilterChip key={club.slug} active={filter === club.slug} onClick={() => setFilter(club.slug)}>
            {club.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        {/* Left Column: Agenda View */}
        <div>
          {visible.length === 0 ? (
            <div className="border border-line bg-card p-8 rounded-sm">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Schedule</span>
              <p className="mt-2 font-serif text-3xl text-ink">Nothing scheduled for this filter.</p>
              <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                No dates posted yet. Subscribe to receive invites directly to your inbox when registration opens.
              </p>
              <a
                href={subscribeUrl}
                className="mt-6 inline-flex h-11 items-center justify-center bg-ink px-6 text-xs font-mono uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm"
              >
                Subscribe to Calendar Updates →
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {weeks.map((week) => (
                <section key={ymdKey(week.start)} aria-labelledby={`week-${ymdKey(week.start)}`}>
                  <div className="flex items-center gap-3 border-b border-line pb-3">
                    <span className="font-mono text-xs text-accent">✦</span>
                    <h2 id={`week-${ymdKey(week.start)}`} className="font-serif text-2xl md:text-3xl text-ink">
                      {weekLabel(week.start, today)}
                    </h2>
                  </div>
                  {week.events.length === 0 ? (
                    <p className="mt-4 border border-line bg-paper-subtle px-5 py-4 text-xs font-mono text-muted rounded-sm">
                      No sessions on the calendar for this week.
                    </p>
                  ) : (
                    <ul className="mt-4 flex flex-col gap-4">
                      {week.events.map((event) => (
                        <li
                          key={event.id}
                          id={event.id}
                          className="scroll-mt-24 border border-line bg-card p-6 rounded-sm hover:border-line-strong transition-all shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
                            <Link
                              href={`/clubs/${event.clubSlug}`}
                              className="font-mono text-xs font-semibold uppercase tracking-wider text-accent hover:underline"
                            >
                              {event.clubName}
                            </Link>
                            <span className="font-mono text-xs text-muted">
                              {formatWeekday(event.datetime)} · {formatTime(event.datetime)}
                            </span>
                          </div>

                          <h3 className="mt-3 font-serif text-2xl text-ink">{event.title}</h3>
                          <p className="mt-1 font-mono text-xs text-muted">📍 {event.location}</p>
                          <p className="mt-3 text-sm text-ink-secondary leading-relaxed">
                            {event.description}
                          </p>

                          <div className="mt-5 flex items-center justify-between pt-3 border-t border-line/50">
                            {event.capacity ? (
                              <span className="font-mono text-xs text-muted">
                                {event.capacity} capacity limit
                              </span>
                            ) : <span />}
                            <a
                              href={event.rsvpUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-9 items-center justify-center bg-ink px-4 text-xs font-mono uppercase tracking-wider text-paper hover:bg-accent transition-colors rounded-sm"
                            >
                              RSVP on Luma →
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Month Grid */}
        <div>
          <div className="border border-line bg-card p-6 rounded-sm shadow-sm sticky top-20">
            <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-4">
              <h2 className="font-serif text-2xl text-ink">{formatMonth(cursor.year, cursor.month)}</h2>
              <div className="flex gap-1.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="h-8 border border-line px-2.5 hover:border-ink hover:bg-paper-subtle transition-colors rounded-sm"
                  aria-label="Previous month"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="h-8 border border-line px-2.5 hover:border-ink hover:bg-paper-subtle transition-colors rounded-sm"
                  aria-label="Next month"
                >
                  →
                </button>
              </div>
            </div>

            <div
              className="mt-4 grid grid-cols-7 border-r border-b border-line text-left"
              role="grid"
              aria-label={formatMonth(cursor.year, cursor.month)}
            >
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="border-l border-t border-line px-1 py-1.5 font-mono text-[9px] uppercase tracking-wider text-muted text-center"
                >
                  {day}
                </div>
              ))}
              {cells.map((cell) => {
                const dayEvents = visible.filter((event) => sameYmd(laYmdFromIso(event.datetime), cell.ymd));
                const isToday = sameYmd(cell.ymd, today);
                return (
                  <div
                    key={ymdKey(cell.ymd)}
                    role="gridcell"
                    className={`min-h-12 border-l border-t border-line p-1 text-center transition-colors ${
                      cell.inMonth ? "bg-card" : "bg-paper-subtle/50 opacity-30"
                    }`}
                  >
                    <span
                      className={`inline-block font-mono text-[11px] ${
                        isToday
                          ? "h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center mx-auto"
                          : "text-ink"
                      }`}
                    >
                      {cell.ymd.day}
                    </span>
                    {dayEvents.length > 0 ? (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {dayEvents.map((event) => (
                          <a
                            key={event.id}
                            href={`#${event.id}`}
                            className="block truncate rounded-sm bg-accent/10 px-1 py-0.5 font-mono text-[9px] font-medium text-accent hover:bg-accent hover:text-white transition-colors"
                          >
                            {event.clubName}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {monthEvents.length === 0 ? (
              <p className="mt-4 font-mono text-xs text-muted text-center">
                No events in {formatMonth(cursor.year, cursor.month)}.
              </p>
            ) : null}

            <div className="mt-6 pt-5 border-t border-line/60">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-2">
                Sync to your device
              </span>
              <a
                href={subscribeUrl}
                className="flex h-10 w-full items-center justify-center border border-line bg-paper-subtle text-xs font-mono uppercase tracking-wider text-ink hover:border-ink transition-colors rounded-sm"
              >
                Subscribe via iCal / Google →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 px-3.5 font-mono text-xs uppercase tracking-wider transition-all rounded-sm ${
        active
          ? "bg-ink text-paper font-semibold shadow-sm"
          : "border border-line bg-card text-ink/80 hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
