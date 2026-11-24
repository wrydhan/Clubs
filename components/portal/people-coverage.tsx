import { SOURCE_STATE_LABELS, type SourceStatus } from "@/data/clubs-portal/sources";

/**
 * What each source is actually feeding the dashboard.
 *
 * The funnel shows counts; this strip shows provenance, so a stage that reads 0
 * because nothing happened (no check-ins yet) is visibly different from a stage
 * that reads 0 because the source was never connected (X).
 */
export function PeopleCoverage({ statuses }: { statuses: SourceStatus[] }) {
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
    </section>
  );
}
