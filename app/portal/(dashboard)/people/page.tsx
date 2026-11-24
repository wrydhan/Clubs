import type { Metadata } from "next";
import { Card, Kpi, PageTitle } from "@/components/portal/dark/ui";
import { BarList } from "@/components/portal/dark/charts";
import { PeopleTable } from "@/components/clubs-portal/people-table/people-table";
import { loadPeopleDataset } from "@/lib/clubs-portal/people/load";

export const metadata: Metadata = {
  title: "People",
  robots: { index: false, follow: false },
};

/** People tab: the counts strip, then the searchable table on its own page. */
export default function PeoplePage() {
  const data = loadPeopleDataset();
  const total = data.people.length;
  const signedUp = data.statusCounts.find((row) => row.status === "signed_up")?.count ?? 0;
  const attended = data.statusCounts.find((row) => row.status === "attended")?.count ?? 0;
  const declined = data.statusCounts.find((row) => row.status === "declined")?.count ?? 0;

  return (
    <>
      <PageTitle eyebrow="Clubs · roster" title="People" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="On file" value={String(total)} tone="strong" />
        <Kpi label="Signed up" value={String(signedUp)} />
        <Kpi label="Attended" value={String(attended)} note="check-ins" tone="dim" />
        <Kpi label="Declined" value={String(declined)} tone="dim" />
      </div>

      <Card title="Relationship mix">
        <BarList
          rows={data.statusCounts.map((row) => ({ label: row.label, value: row.count }))}
        />
      </Card>

      <Card>
        <PeopleTable people={data.people} statusCounts={data.statusCounts} />
      </Card>
    </>
  );
}
