"use client";

import { useMemo, useState } from "react";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  type Person,
  type PersonSource,
  type PersonStatus,
} from "@/lib/clubs-portal/people/types";
import { clubsEventLabels } from "@/data/clubs-portal/events";

export interface PeopleTableProps {
  people: Person[];
  statusCounts: Array<{ status: PersonStatus; label: string; count: number }>;
}

type SortKey = "last_seen" | "name" | "status";

/** Status weight for the "status" sort: deepest relationship first. */
const STATUS_ORDER: Record<PersonStatus, number> = {
  attended: 0,
  signed_up: 1,
  waitlist: 2,
  lead: 3,
  engaged: 4,
  following: 5,
  declined: 6,
};

/** Strongest relationships read as solid ink; declines recede. */
function statusBadgeClass(status: PersonStatus): string {
  switch (status) {
    case "attended":
    case "signed_up":
      return "bg-ink text-paper";
    case "declined":
      return "bg-transparent text-secondary";
    default:
      return "bg-kraft text-ink";
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const CSV_HEADERS = [
  "Name",
  "Handle",
  "Email",
  "Company",
  "Source",
  "Status",
  "Events",
  "Last seen",
];

function rowsToCsv(rows: Person[]): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const person of rows) {
    lines.push(
      [
        person.name,
        person.handle ? `@${person.handle}` : "",
        person.email ?? "",
        person.company ?? "",
        SOURCE_LABELS[person.source],
        STATUS_LABELS[person.status],
        clubsEventLabels(person.events).join("; "),
        person.lastSeen,
      ]
        .map((cell) => csvEscape(cell))
        .join(","),
    );
  }
  return lines.join("\r\n");
}

export function PeopleTable({ people, statusCounts }: PeopleTableProps) {
  const [query, setQuery] = useState("");
  const [activeSources, setActiveSources] = useState<Set<PersonSource>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<PersonStatus>>(new Set());
  const [sort, setSort] = useState<SortKey>("last_seen");

  const sourceCounts = useMemo(() => {
    const counts = new Map<PersonSource, number>();
    for (const person of people) {
      counts.set(person.source, (counts.get(person.source) ?? 0) + 1);
    }
    return (Object.keys(SOURCE_LABELS) as PersonSource[])
      .map((source) => ({ source, count: counts.get(source) ?? 0 }))
      .filter((entry) => entry.count > 0);
  }, [people]);

  const isFiltering =
    query.trim().length > 0 || activeSources.size > 0 || activeStatuses.size > 0;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = people.filter((person) => {
      if (activeSources.size > 0 && !activeSources.has(person.source)) return false;
      if (activeStatuses.size > 0 && !activeStatuses.has(person.status)) return false;
      if (needle.length > 0) {
        const haystack = [person.name, person.handle, person.company, person.email]
          .filter((value): value is string => Boolean(value))
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    return rows.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
        case "status": {
          const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          if (byStatus !== 0) return byStatus;
          return b.lastSeen.localeCompare(a.lastSeen);
        }
        case "last_seen":
        default:
          return b.lastSeen.localeCompare(a.lastSeen);
      }
    });
  }, [people, query, activeSources, activeStatuses, sort]);

  function toggleSource(source: PersonSource) {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  }

  function toggleStatus(status: PersonStatus) {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setActiveSources(new Set());
    setActiveStatuses(new Set());
  }

  function exportCsv() {
    const csv = rowsToCsv(filtered);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "clubs-people.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const total = people.length;
  const shown = filtered.length;
  const nothingAtAll = total === 0;

  return (
    <section aria-labelledby="people-table-heading" className="w-full">
      <div className="flex flex-col gap-4 border-b border-line pb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="people-table-heading" className="font-serif text-[1.9rem] leading-none">
              People
            </h2>
            <p className="mt-1 text-[13px] text-secondary">
              Everyone we can identify, across Luma and X.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="pill-btn-ghost"
            disabled={shown === 0}
            aria-disabled={shown === 0}
          >
            Export CSV
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-1 sm:max-w-sm">
            <label htmlFor="people-search" className="label">
              Search people
            </label>
            <input
              id="people-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, @handle, company, or email"
              className="w-full rounded-[8px] border-none bg-kraft px-3 py-2 text-sm text-ink placeholder:text-secondary"
            />
          </div>

          <div className="flex items-end gap-1">
            <label htmlFor="people-sort" className="label pb-2">
              Sort
            </label>
            <select
              id="people-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-[8px] border-none bg-kraft px-3 py-2 text-sm text-ink"
            >
              <option value="last_seen">Last seen (newest)</option>
              <option value="name">Name (A–Z)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {sourceCounts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="label">Source</span>
            {sourceCounts.map(({ source, count }) => {
              const active = activeSources.has(source);
              return (
                <button
                  key={source}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSource(source)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] transition-colors ${
                    active ? "bg-ink text-paper" : "bg-kraft text-ink hover:bg-surface-hover"
                  }`}
                >
                  <span>{SOURCE_LABELS[source]}</span>
                  <span className="tnum text-[11px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {statusCounts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="label">Status</span>
            {statusCounts.map(({ status, label, count }) => {
              const active = activeStatuses.has(status);
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleStatus(status)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] transition-colors ${
                    active ? "bg-ink text-paper" : "bg-kraft text-ink hover:bg-surface-hover"
                  }`}
                >
                  <span>{label}</span>
                  <span className="tnum text-[11px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] text-secondary" aria-live="polite">
            Showing {shown} of {total} people
          </p>
          {isFiltering && (
            <button type="button" onClick={clearFilters} className="text-[12px] underline text-ink">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {shown === 0 ? (
        <div className="py-14 text-center">
          {nothingAtAll ? (
            <>
              <p className="font-serif text-[1.5rem] leading-tight">No people yet.</p>
              <p className="mx-auto mt-2 max-w-[44ch] text-[13px] text-secondary">
                Import Luma signups or an X follower list, and everyone lands here.
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-[1.5rem] leading-tight">No matches for this filter.</p>
              <p className="mx-auto mt-2 max-w-[44ch] text-[13px] text-secondary">
                Try a different search or clear the filters to see everyone.
              </p>
              <button type="button" onClick={clearFilters} className="pill-btn-secondary mt-5">
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <caption className="sr-only">People in the Clubs funnel</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.01em] text-ink-soft">
                  Name
                </th>
                <th scope="col" className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.01em] text-ink-soft">
                  Source
                </th>
                <th scope="col" className="py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.01em] text-ink-soft">
                  Status
                </th>
                <th scope="col" className="hidden py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.01em] text-ink-soft md:table-cell">
                  Company
                </th>
                <th scope="col" className="hidden py-2 pr-3 font-mono text-[10px] uppercase tracking-[0.01em] text-ink-soft md:table-cell">
                  Events
                </th>
                <th scope="col" className="py-2 pr-0 text-right font-mono text-[10px] uppercase tracking-[0.01em] text-ink-soft">
                  Last seen
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => {
                const events = clubsEventLabels(person.events).join(", ");
                return (
                  <tr key={person.id} className="border-b border-line align-top">
                    <td className="py-3 pr-3">
                      <div className="font-medium text-ink">{person.name}</div>
                      {person.handle && (
                        <div className="font-mono text-[12px] text-ink-soft">@{person.handle}</div>
                      )}
                      {/* Mobile: company + events fold under the name instead of scrolling wide. */}
                      <div className="mt-1 text-[12px] text-secondary md:hidden">
                        {person.company && <div>{person.company}</div>}
                        {events && (
                          <div className="truncate" title={events}>
                            {events}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="inline-flex items-center rounded-full bg-kraft px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.01em] text-ink-soft">
                        {SOURCE_LABELS[person.source]}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${statusBadgeClass(
                          person.status,
                        )}`}
                      >
                        {STATUS_LABELS[person.status]}
                      </span>
                    </td>
                    <td className="hidden py-3 pr-3 text-ink-2 md:table-cell">
                      {person.company || <span className="text-secondary">—</span>}
                    </td>
                    <td className="hidden max-w-[22ch] py-3 pr-3 text-ink-2 md:table-cell">
                      {events ? (
                        <span className="block truncate" title={events}>
                          {events}
                        </span>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
                    </td>
                    <td className="tnum py-3 pr-0 text-right text-ink-2">{formatDate(person.lastSeen)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default PeopleTable;
