import type { StageSummary } from "@/lib/clubs-portal/people/types";

export interface FunnelChartProps {
  /** Funnel stages, widest first (from `PeopleDataset["funnel"]`). */
  funnel: StageSummary[];
  /** Micro-label above the chart. */
  heading?: string;
  /** Optional footnote explaining that stages are cohorts, not conversions. */
  caption?: string;
}

/**
 * Horizontal bar per funnel stage, scaled to the widest stage. The stage-to-
 * stage figure is a ratio (this count / previous count), never a "% converted" —
 * stages are overlapping cohorts and the ratio can exceed 1.
 *
 * Server component: pure presentational, no client hooks, no chart library.
 */
export function FunnelChart({ funnel, heading = "Funnel", caption }: FunnelChartProps) {
  const max = funnel.reduce((m, stage) => (stage.count > m ? stage.count : m), 0);

  return (
    <section aria-labelledby="funnel-chart-heading" className="finc-card px-5 py-6 sm:px-7 sm:py-8">
      <header className="flex items-baseline justify-between gap-3">
        <span id="funnel-chart-heading" className="label">
          {heading}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">cohort counts</span>
      </header>

      {funnel.length === 0 ? (
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">No funnel data yet.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {funnel.map((stage) => {
            const width = max > 0 ? (stage.count / max) * 100 : 0;
            const people = stage.count === 1 ? "person" : "people";
            const ratioText =
              stage.ratioFromPrevious !== null && Number.isFinite(stage.ratioFromPrevious)
                ? `, ${stage.ratioFromPrevious.toFixed(2)} times previous stage`
                : "";
            const ariaLabel = `${stage.label}: ${stage.count} ${people}${ratioText}`;

            return (
              <li key={stage.stage}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="label">{stage.label}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-serif tnum text-[1.6rem] leading-none">
                      {stage.count.toLocaleString("en-US")}
                    </span>
                    {stage.ratioFromPrevious !== null && Number.isFinite(stage.ratioFromPrevious) && (
                      <span className="font-mono text-[10px] tracking-[0.02em] text-ink-soft">
                        {stage.ratioFromPrevious.toFixed(2)}× previous stage
                      </span>
                    )}
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={ariaLabel}
                  className="mt-2 h-3 w-full overflow-hidden rounded-[2px] bg-surface"
                >
                  <div className="h-full rounded-[2px] bg-ink" style={{ width: `${width}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {caption && <p className="mt-5 text-[11px] leading-relaxed text-ink-soft">{caption}</p>}
    </section>
  );
}
