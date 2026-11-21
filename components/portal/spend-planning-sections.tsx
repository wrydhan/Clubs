import { ExpensesSection as ExpensesEditor } from "@/components/portal/expenses-section";
import { PlanningSection as PlanningEditor } from "@/components/portal/planning-section";
import { SectionFrame } from "@/components/portal/section-frame";
import { readEvents, readExpenses } from "@/lib/portal/store";

/**
 * Server half of Track 3. The editable views are client components (they POST
 * changes back), so these wrappers are the only place that reads the store:
 * the first paint is rendered on the server with real figures and the client
 * takes over from that snapshot. That keeps the numbers out of the browser
 * bundle and behind the same password as the rest of the portal.
 */

async function loadSnapshot() {
  const [expenses, events] = await Promise.all([readExpenses(), readEvents()]);
  return { expenses, events };
}

export async function SpendSection() {
  const initial = await loadSnapshot();

  return (
    <SectionFrame
      id="spend"
      owner="Section 03"
      title="Spend"
      blurb="Every line item against the budget it was planned under, by event and by category. A blank actual means no invoice has landed yet, not that the line cost nothing."
    >
      <ExpensesEditor initial={initial} showEventRollup={false} />
    </SectionFrame>
  );
}

export async function PlanningSection() {
  const initial = await loadSnapshot();

  return (
    <SectionFrame
      id="planning"
      owner="Section 04"
      title="What's next"
      blurb="The forward calendar, the owner on each date, and what the event is expected to cost against what it has spent so far."
    >
      <PlanningEditor initial={initial} />
    </SectionFrame>
  );
}
