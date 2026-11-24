import type { Metadata } from "next";
import { Card, Chip, Kpi, Meter, PageTitle } from "@/components/portal/dark/ui";
import { BarList, Donut } from "@/components/portal/dark/charts";
import { loadPeopleDataset } from "@/lib/clubs-portal/people/load";
import { SOURCE_STATE_LABELS } from "@/data/clubs-portal/sources";

export const metadata: Metadata = {
  title: "Funnel",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "America/Los_Angeles",
});

/**
 * Funnel tab. Charts first, one-line labels only: stage counts, the funnel
 * bars, and where the rows came from. The long "stages are cohorts" caveat is
 * kept to a single footnote instead of a paragraph per section.
 */
export default function FunnelPage() {
  const data = loadPeopleDataset();
  const total = data.people.length;
  const widest = data.funnel.reduce((m, stage) => Math.max(m, stage.count), 0);

  return (
    <>
      <PageTitle
        eyebrow="Clubs · reach"
        title="Funnel"
        right={
          <>
            <Chip>{`${total} ${total === 1 ? "person" : "people"}`}</Chip>
            <Chip tone="outline">{`imported ${dateFormatter.format(new Date(data.generatedAt))}`}</Chip>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.funnel.map((stage, index) => (
          <Kpi
            key={stage.stage}
            label={stage.label}
            value={stage.count.toLocaleString("en-US")}
            note={widest > 0 ? `${Math.round((stage.count / widest) * 100)}% of widest` : "no data"}
            tone={index === 0 ? "strong" : "plain"}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card title="Stages, widest first" hint="cohort counts">
          <BarList
            rows={data.funnel.map((stage) => ({
              label: stage.label,
              value: stage.count,
              note:
                stage.ratioFromPrevious !== null && Number.isFinite(stage.ratioFromPrevious)
                  ? `${stage.ratioFromPrevious.toFixed(2)}× above`
                  : undefined,
            }))}
          />
          <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
            Stages overlap — the ratio compares each stage to the one above it, not a conversion rate.
          </p>
        </Card>

        <Card title="Where they came from" hint={`${total} rows`}>
          <Donut
            slices={data.sources.map((source) => ({ label: source.label, value: source.count }))}
            centerValue={String(total)}
            centerLabel="people"
          />
        </Card>
      </div>

      <Card title="Source health" hint="per feed">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.sourceStatus.map((entry) => (
            <li key={entry.source} className="rounded-[10px] bg-white/4 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] text-ink">{entry.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${
                    entry.state === "live"
                      ? "bg-white text-[#0b0b0c]"
                      : entry.state === "partial"
                        ? "bg-white/25 text-ink"
                        : "border border-white/25 text-ink-soft"
                  }`}
                >
                  {SOURCE_STATE_LABELS[entry.state]}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Meter
            value={data.funnel.find((stage) => stage.stage === "signups")?.count ?? 0}
            max={Math.max(widest, 1)}
          />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">
            signups against the widest stage
          </p>
        </div>
      </Card>
    </>
  );
}
