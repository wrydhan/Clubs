import type { Metadata } from "next";
import { ClubStudio } from "@/components/collage/club-studio";

export const metadata: Metadata = {
  title: "Charter a Club — Founders, Inc. Clubs",
  description:
    "Sit down at the charter desk and start a Founders, Inc. club in San Francisco. A cadence, a first date, ten names — we provide budgets, track bookings at Sonoma, workshop space at Fort Mason, and media production.",
  alternates: { canonical: "/clubs/apply" },
};

/** The start-a-club flow is the desk: wall, charter, and the sticker sheet. */
export default function ApplyPage() {
  return (
    <main className="min-h-screen">
      <ClubStudio />
    </main>
  );
}
