import { FunnelChart, PlaceholderBanner, SourceBreakdown, StageKpis } from "@/components/clubs-portal/funnel";
import { PeopleTable } from "@/components/clubs-portal/people-table/people-table";
import { PeopleCoverage } from "@/components/portal/people-coverage";
import { SectionFrame } from "@/components/portal/section-frame";
import { loadPeopleDataset } from "@/lib/clubs-portal/people/load";

/**
 * TRACK 2 OWNS THIS FILE — the reach → signups funnel and the people table.
 *
 * Data is read on the server through `loadPeopleDataset()`; nothing is fetched
 * from the browser, so the portal password is the only thing between a reader
 * and the names. Components are presentational and unchanged from their slices.
 */

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "America/Los_Angeles",
});

export function FunnelSection() {
  const data = loadPeopleDataset();
  const total = data.people.length;

  return (
    <SectionFrame
      id="reach"
      owner="Section 01"
      title="Reach → signups"
      blurb="How many people saw the club, and how many of them turned up. Each stage is a cohort: someone can be a follower and never sign up, or sign up without following. The ratio under each stage is its count over the stage above, not a conversion rate."
      meta={
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
          {total} {total === 1 ? "person" : "people"} on file · imported{" "}
          {dateFormatter.format(new Date(data.generatedAt))}
        </p>
      }
    >
      <div className="flex flex-col gap-4">
        <PlaceholderBanner isPlaceholder={data.isPlaceholder} note={data.note} />
        <StageKpis funnel={data.funnel} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FunnelChart
            funnel={data.funnel}
            heading="The funnel"
            caption="Stages overlap, so the ratio can be above 1. It compares this stage to the one above, and is not a headline conversion rate."
          />
          <SourceBreakdown sources={data.sources} />
        </div>
        <PeopleCoverage statuses={data.sourceStatus} />
      </div>
    </SectionFrame>
  );
}

/** The people table underneath the funnel — same track, separate slot. */
export function PeopleSection() {
  const data = loadPeopleDataset();

  return (
    <SectionFrame
      id="people"
      owner="Section 02"
      title="People"
      blurb="Every name the portal knows about, where it came from, and how warm it is. Search and filter here; the export button hands you the same rows as a CSV."
    >
      <PeopleTable people={data.people} statusCounts={data.statusCounts} />
    </SectionFrame>
  );
}
