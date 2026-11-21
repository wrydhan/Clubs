import {
  FUNNEL_STAGES,
  SOURCE_LABELS,
  STAGE_LABELS,
  STATUS_LABELS,
  type FunnelStage,
  type PeopleDataset,
  type Person,
  type PersonSource,
  type PersonStatus,
  type SourceSummary,
  type StageSummary,
} from "./types";

export interface SummarizeOptions {
  generatedAt?: string;
  isPlaceholder?: boolean;
  note?: string;
}

/** Derive the funnel, source, and status summaries the dashboard renders. */
export function summarizePeople(
  people: Person[],
  opts: SummarizeOptions = {},
): PeopleDataset {
  const funnel: StageSummary[] = [];
  let previous: number | null = null;

  for (const stage of FUNNEL_STAGES) {
    const count = people.filter((p) => p.stages.includes(stage)).length;
    funnel.push({
      stage: stage as FunnelStage,
      label: STAGE_LABELS[stage],
      count,
      ratioFromPrevious:
        previous === null || previous === 0 ? null : count / previous,
    });
    previous = count;
  }

  const sourceCounts = new Map<PersonSource, number>();
  for (const person of people) {
    sourceCounts.set(person.source, (sourceCounts.get(person.source) ?? 0) + 1);
  }
  const sources: SourceSummary[] = [...sourceCounts.entries()]
    .map(([source, count]) => ({
      source,
      label: SOURCE_LABELS[source],
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const statusCounts = new Map<PersonStatus, number>();
  for (const person of people) {
    statusCounts.set(person.status, (statusCounts.get(person.status) ?? 0) + 1);
  }

  return {
    generatedAt: opts.generatedAt ?? new Date().toISOString(),
    isPlaceholder: opts.isPlaceholder ?? false,
    note: opts.note,
    people,
    funnel,
    sources,
    statusCounts: [...statusCounts.entries()]
      .map(([status, count]) => ({
        status,
        label: STATUS_LABELS[status],
        count,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
