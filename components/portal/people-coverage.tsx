import type { ClubsEventCoverage } from "@/data/clubs-portal/clubs-events";
import { SOURCE_STATE_LABELS, type SourceStatus } from "@/data/clubs-portal/sources";

/**
 * What each source is actually feeding the dashboard.
 *
 * The funnel shows counts; this strip shows provenance, so a stage that reads 0
 * because nothing happened (no check-ins yet) is visibly different from a stage
 * that reads 0 because the source was never connected (X).
 *
 * The per-event block below it does the same job for the people rows: the portal
 * only carries Clubs events, and an event with no Luma export yet stays at 0 and
 * says so, instead of looking like an event nobody signed up for.
 */
export function PeopleCoverage({
  statuses,
  events,
}: {
  statuses: SourceStatus[];
  events?: ClubsEventCoverage[];
}) {
  return (
    <section aria-labelledby="people-coverage-heading" className="finc-card px-5 py-5 sm:px-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span id="people-coverage-heading" className="label">
          Where these numbers come from
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
          per source
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {statuses.map((entry) => (
          <li key={entry.source} className="flex items-start gap-3">
            <span
              className={`mt-1 inline-flex shrink-0 items-center px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${
                entry.state === "live"
                  ? "bg-ink text-paper"
                  : entry.state === "partial"
                    ? "bg-kraft text-ink"
                    : "border border-ink/30 text-ink-soft"
              }`}
            >
              {SOURCE_STATE_LABELS[entry.state]}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] leading-tight text-ink">{entry.label}</span>
              <span className="mt-0.5 block text-[11.5px] leading-relaxed text-ink-soft">
                {entry.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {events && events.length > 0 ? (
        <div className="mt-6 border-t border-ink/15 pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="label">People per Clubs event</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
              clubs events only
            </span>
          </div>

          <ul className="mt-3 flex flex-col gap-2">
            {events.map((event) => (
              <li
                key={event.slug}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-ink/10 pb-2 last:border-b-0 last:pb-0"
              >
                <span className="min-w-[10rem] text-[13px] leading-tight text-ink">
                  {event.name}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-ink">
                  {event.rows} {event.rows === 1 ? "person" : "people"}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${
                    event.state === "imported"
                      ? "bg-ink text-paper"
                      : "border border-ink/30 text-ink-soft"
                  }`}
                >
                  {event.state === "imported" ? "Imported" : "Awaiting export"}
                </span>
                <span className="w-full text-[11.5px] leading-relaxed text-ink-soft sm:w-auto sm:flex-1">
                  {event.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
