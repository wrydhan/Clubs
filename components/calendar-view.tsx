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
    <div className="py-6">
      {/* Club Filter Chips (Pill styling) */}
      <div className="flex flex-wrap items-center gap-2 mb-10" role="toolbar" aria-label="Filter by club">
        <span className="mr-2 font-mono text-[11px] uppercase tracking-wider text-black/40">Filter:</span>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-xs font-medium tracking-tight transition-all ${
            filter === "all"
              ? "bg-black text-white"
              : "bg-[#F1F1F1] text-black/70 hover:bg-[#E7E7E7] hover:text-black"
          }`}
        >
          All Sessions
        </button>
        {clubs.map((club) => {
          const active = filter === club.slug;
          return (
            <button
              key={club.slug}
              type="button"
              onClick={() => setFilter(club.slug)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-tight transition-all ${
                active
                  ? "bg-black text-white"
                  : "bg-[#F1F1F1] text-black/70 hover:bg-[#E7E7E7] hover:text-black"
              }`}
            >
              {club.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        {/* Left Column: Agenda View */}
        <div>
          {visible.length === 0 ? (
            <div className="finc-card p-8 sm:p-12 text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-black/40">Schedule Status</span>
              <p className="mt-3 font-serif text-3xl sm:text-4xl text-black">No sessions currently posted.</p>
              <p className="mt-3 text-sm text-black/60 max-w-md mx-auto leading-relaxed">
                Dates are finalized with track marshals and coordinators weekly. Subscribe to sync dates automatically to your calendar.
              </p>
              <a
                href={subscribeUrl}
                className="mt-6 inline-flex pill-btn text-xs py-3 px-6"
              >
                Subscribe to Calendar Updates →
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {weeks.map((week) => (
                <section key={ymdKey(week.start)} aria-labelledby={`week-${ymdKey(week.start)}`}>
                  <div className="flex items-center gap-3 pb-3">
                    <span className="h-2 w-2 rounded-full bg-black/40" />
                    <h2 id={`week-${ymdKey(week.start)}`} className="font-serif text-2xl sm:text-3xl text-black">
                      {weekLabel(week.start, today)}
                    </h2>
                  </div>
                  {week.events.length === 0 ? (
                    <p className="mt-3 finc-card px-6 py-4 text-xs font-mono text-black/50">
                      No sessions on the calendar for this week.
                    </p>
                  ) : (
                    <ul className="mt-4 flex flex-col gap-4">
                      {week.events.map((event) => (
                        <li
                          key={event.id}
                          id={event.id}
                          className="scroll-mt-24 finc-card p-6 sm:p-8 hover:bg-[#EBEBEB] transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <Link
                              href={`/clubs/${event.clubSlug}`}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/5 text-black hover:bg-black hover:text-white transition-colors"
                            >
                              {event.clubName}
                            </Link>
                            <span className="font-mono text-xs text-black/50 tnum">
                              {formatWeekday(event.datetime)} · {formatTime(event.datetime)}
                            </span>
                          </div>

                          <h3 className="mt-4 font-serif text-2xl sm:text-3xl text-black">{event.title}</h3>
                          <p className="mt-1 font-mono text-xs text-black/50">📍 {event.location}</p>
                          <p className="mt-3 text-sm text-black/70 leading-relaxed font-sans max-w-2xl">
                            {event.description}
                          </p>

                          <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-4">
                            {event.capacity ? (
                              <span className="font-mono text-xs text-black/40">
                                {event.capacity} driver capacity limit
                              </span>
                            ) : <span />}
                            <a
                              href={event.rsvpUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="pill-btn text-xs py-2 px-5"
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
          <div className="finc-card p-6 sm:p-8 sticky top-24">
            <div className="flex items-center justify-between pb-4">
              <h2 className="font-serif text-2xl text-black">{formatMonth(cursor.year, cursor.month)}</h2>
              <div className="flex gap-1.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  aria-label="Previous month"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="h-8 w-8 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                  aria-label="Next month"
                >
                  →
                </button>
              </div>
            </div>

            <div
              className="mt-4 grid grid-cols-7 gap-1 text-center"
              role="grid"
              aria-label={formatMonth(cursor.year, cursor.month)}
            >
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-1 font-mono text-[10px] uppercase text-black/40">
                  {day}
                </div>
              ))}
              {cells.map((cell) => {
                const isToday = sameYmd(cell.ymd, today);
                const hasEvent = monthEvents.some((ev) => sameYmd(laYmdFromIso(ev.datetime), cell.ymd));
                return (
                  <div
                    key={ymdKey(cell.ymd)}
                    className={`h-10 rounded-[8px] flex flex-col items-center justify-center text-xs font-mono transition-colors ${
                      cell.inMonth ? "text-black" : "text-black/20"
                    } ${isToday ? "bg-black text-white font-semibold" : hasEvent ? "bg-black/10 font-medium" : ""}`}
                  >
                    <span>{cell.ymd.day}</span>
                    {hasEvent && !isToday ? (
                      <span className="block h-1 w-1 rounded-full bg-black mt-0.5" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-4">
              <a
                href={subscribeUrl}
                className="pill-btn-secondary w-full text-center text-xs py-3"
              >
                Sync with Calendar (.ics)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
