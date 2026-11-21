import type { Metadata } from "next";
import { FunnelSection, PeopleSection } from "@/components/portal/funnel-section";
import { PlanningSection, SpendSection } from "@/components/portal/spend-planning-sections";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function PortalDashboardPage() {
  return (
    <main className="flex flex-col gap-12">
      <FunnelSection />
      <PeopleSection />
      <SpendSection />
      <PlanningSection />
    </main>
  );
}
