import { SectionFrame, SectionPlaceholder } from "@/components/portal/section-frame";

/**
 * TRACK 2 OWNS THIS FILE — reach → signups funnel, the people table, and the
 * charts behind it. Replace the placeholder with real components; keep
 * SectionFrame as the outer shell so the page keeps its rhythm, and keep the
 * section id ("reach") so the nav link still lands here.
 *
 * Data arrives through a server loader (lib/portal/…), never fetched in the
 * browser, so the shared password is the only thing standing between a reader
 * and the numbers.
 */
export function FunnelSection() {
  return (
    <SectionFrame
      id="reach"
      owner="Section 01"
      title="Reach → signups"
      blurb="How many people saw the club, and how many of them turned up. One funnel per platform, plus the people behind the numbers."
    >
      <SectionPlaceholder
        headline="Funnel + graphs land here"
        lines={[
          "Impressions → profile visits → follows → RSVPs → checked-in, per channel (X, Luma, in-person)",
          "Trend lines by week, and a per-club comparison for the current season",
          "The people table: who attended, who signed up, who only commented, with source and last-seen",
        ]}
      />
    </SectionFrame>
  );
}

/** The people table underneath the funnel — same track, separate slot. */
export function PeopleSection() {
  return (
    <SectionFrame
      id="people"
      owner="Section 02"
      title="People"
      blurb="Every name the portal knows about, where it came from, and how warm it is."
    >
      <SectionPlaceholder
        headline="The roster view lands here"
        lines={[
          "One row per person: attended / signed up / reacted / commented / follows",
          "Source channel, first seen, last seen, and which club brought them in",
          "Search + filter, and a CSV export so the list leaves the portal cleanly",
        ]}
      />
    </SectionFrame>
  );
}
