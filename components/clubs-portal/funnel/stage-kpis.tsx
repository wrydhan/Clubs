import type { StageSummary } from "@/lib/clubs-portal/people/types";

export interface StageKpisProps {
  /** Funnel stages, widest first (from `PeopleDataset["funnel"]`). */
  funnel: StageSummary[];
}

/**
 * Four compact stat tiles: stage label, count, and that stage's share of the
 * widest stage. The widest stage therefore always reads 100%. Server component.
 */
export function StageKpis({ funnel }: StageKpisProps) {
  const max = funnel.reduce((m, stage) => (stage.count > m ? stage.count : m), 0);

  return (
    <section aria-label="Stage totals" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {funnel.length === 0 ? (
        <p className="col-span-full text-sm leading-relaxed text-ink-soft">No stage data yet.</p>
      ) : (
        funnel.map((stage) => {
          const share = max > 0 ? Math.round((stage.count / max) * 100) : 0;
          return (
            <div key={stage.stage} className="finc-card px-4 py-4">
              <span className="label">{stage.label}</span>
              <div className="mt-2 font-serif tnum text-[1.9rem] leading-none">
                {stage.count.toLocaleString("en-US")}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                {share}% of widest
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
