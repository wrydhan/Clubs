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
import { formatFullDate, formatMonth, formatTime, formatYmd, laYmdFromIso } from "@/lib/format";
import { btnPrimary } from "@/lib/styles";
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
  if (sameYmd(start, thisWeek)) return "This week";
  if (sameYmd(start, nextWeek)) return "Next week";
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
    <div>
      <div className="flex gap-2 overflow-x-auto px-5 py-4 md:px-8" role="toolbar" aria-label="Filter by club">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {clubs.map((club) => (
          <FilterChip key={club.slug} active={filter === club.slug} onClick={() => setFilter(club.slug)}>
            {club.name}
          </FilterChip>
        ))}
      </div>

      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-16 md:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          {visible.length === 0 ? (
            <div className="border border-line px-5 py-10">
              <p className="font-serif text-3xl leading-none">Nothing scheduled.</p>
              <p className="mt-3 text-sm text-muted">
                No upcoming dates for this filter. Subscribe anyway — the next one will land in the same calendar.
              </p>
              <a href={subscribeUrl} className={`${btnPrimary} mt-5`}>
                Subscribe
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {weeks.map((week) => (
                <section key={ymdKey(week.start)} aria-labelledby={`week-${ymdKey(week.start)}`}>
                  <h2 id={`week-${ymdKey(week.start)}`} className="font-serif text-3xl leading-none">
                    {weekLabel(week.start, today)}
                  </h2>
                  {week.events.length === 0 ? (
                    <p className="mt-4 border border-line px-4 py-5 text-sm text-muted">
                      Nothing scheduled this week.
                    </p>
                  ) : (
                    <ul className="mt-4 flex flex-col gap-3">
                      {week.events.map((event) => (
                        <li key={event.id} id={event.id} className="scroll-mt-24 border border-line bg-card p-4">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{event.clubName}</p>
                          <h3 className="mt-1 font-serif text-2xl leading-tight">{event.title}</h3>
                          <p className="mt-1 text-sm text-muted">
                            {formatFullDate(event.datetime)} · {formatTime(event.datetime)} · {event.location}
                          </p>
                          <a
                            href={event.rsvpUrl}
                            className="mt-3 inline-flex h-11 items-center bg-ink px-4 text-sm text-paper hover:opacity-90"
                          >
                            RSVP
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">{formatMonth(cursor.year, cursor.month)}</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => shiftMonth(-1)} className="h-10 border border-line px-3 text-sm" aria-label="Previous month">
                Prev
              </button>
              <button type="button" onClick={() => shiftMonth(1)} className="h-10 border border-line px-3 text-sm" aria-label="Next month">
                Next
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-7 border-r border-b border-line text-left" role="grid" aria-label={formatMonth(cursor.year, cursor.month)}>
            {WEEKDAYS.map((day) => (
              <div key={day} className="border-l border-t border-line px-1 py-1 text-[10px] uppercase tracking-[0.12em] text-muted">
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
                  className={`min-h-14 border-l border-t border-line p-1 md:min-h-20 ${cell.inMonth ? "" : "opacity-40"}`}
                >
                  <span className={`inline-block text-xs ${isToday ? "bg-chip px-1 text-white" : ""}`}>
                    {cell.ymd.day}
                  </span>
                  <div className="mt-1 hidden md:block">
                    {dayEvents.slice(0, 2).map((event) => (
                      <a key={event.id} href={`#${event.id}`} className="block truncate text-[10px] leading-tight hover:underline">
                        {event.clubName}
                      </a>
                    ))}
                  </div>
                  {dayEvents.length > 0 ? (
                    <div className="mt-1 flex gap-0.5 md:hidden" aria-hidden>
                      {dayEvents.slice(0, 3).map((event) => (
                        <span key={event.id} className="h-1.5 w-1.5 bg-chip" />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          {monthEvents.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing on the calendar this month.</p>
          ) : null}
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
      className={`h-10 shrink-0 px-3 text-sm ${active ? "bg-ink text-paper" : "border border-line text-ink"}`}
    >
      {children}
    </button>
  );
}
