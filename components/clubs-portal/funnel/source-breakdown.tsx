import type { SourceSummary } from "@/lib/clubs-portal/people/types";

export interface SourceBreakdownProps {
  /** Source mix (from `PeopleDataset["sources"]`). */
  sources: SourceSummary[];
  /** Micro-label above the list. */
  heading?: string;
}

/**
 * Source mix as a small row list: each row shows the source label, its row
 * count, its share of all rows, and a bar scaled to the largest source.
 * Server component.
 */
export function SourceBreakdown({ sources, heading = "Where they came from" }: SourceBreakdownProps) {
  const max = sources.reduce((m, source) => (source.count > m ? source.count : m), 0);
  const total = sources.reduce((sum, source) => sum + source.count, 0);

  return (
    <section aria-labelledby="source-breakdown-heading" className="finc-card px-5 py-6 sm:px-7">
      <header className="flex items-baseline justify-between gap-3">
        <span id="source-breakdown-heading" className="label">
          {heading}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
          {total.toLocaleString("en-US")} rows
        </span>
      </header>

      {sources.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">No source data yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sources.map((source) => {
            const width = max > 0 ? (source.count / max) * 100 : 0;
            const share = total > 0 ? Math.round((source.count / total) * 100) : 0;
            const rows = source.count === 1 ? "row" : "rows";
            return (
              <li key={source.source}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-ink">{source.label}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-serif tnum text-[1.15rem] leading-none">
                      {source.count.toLocaleString("en-US")}
                    </span>
                    <span className="font-mono text-[10px] text-ink-soft">{share}%</span>
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={`${source.label}: ${source.count} ${rows}`}
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-[2px] bg-surface"
                >
                  <div className="h-full rounded-[2px] bg-ink" style={{ width: `${width}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
