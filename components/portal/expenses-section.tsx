import { SectionFrame, SectionPlaceholder } from "@/components/portal/section-frame";

/**
 * TRACK 3 OWNS THIS FILE — spend against the club budget, and the forward event
 * plan (starting with Dec 14 basketball and Dec 17 the holiday party). Replace
 * the placeholders with real components; keep SectionFrame and the section ids
 * ("spend", "planning") so the nav keeps landing in the right place.
 */
export function SpendSection() {
  return (
    <SectionFrame
      id="spend"
      owner="Section 03"
      title="Spend"
      blurb="What each club has cost so far this season, against the budget it was given."
    >
      <SectionPlaceholder
        headline="The ledger lands here"
        lines={[
          "Line items by club and by event: date, vendor, amount, who approved it, receipt link",
          "Budget remaining per club, and the burn line for the season",
          "A running total so nobody has to open a spreadsheet before a purchase",
        ]}
      />
    </SectionFrame>
  );
}

export function PlanningSection() {
  return (
    <SectionFrame
      id="planning"
      owner="Section 03"
      title="What's next"
      blurb="The forward calendar: the next event per club, what it still needs, and what it is expected to cost."
    >
      <SectionPlaceholder
        headline="The event plan lands here"
        lines={[
          "Dec 14 — 3v3 basketball, Moscone Rec: run sheet, roster, shirt order, headcount",
          "Dec 17 — black-tie holiday party, Fort Mason Building C: build-out, vendors, budget",
          "Per-event checklist with owners and dates, and a straight line from plan to spend",
        ]}
      />
    </SectionFrame>
  );
}
