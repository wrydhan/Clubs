import type { Metadata } from "next";
import { ClubhouseWall } from "@/components/collage/clubhouse-wall";
import { getEvents } from "@/lib/clubs";

export const metadata: Metadata = {
  title: "Founders, Inc. — Clubs | The wall",
  description:
    "Member-run clubs at Founders, Inc. Fort Mason Pier 2, San Francisco. Flagship Car Club track days at Sonoma Raceway, Hardware Workshop, Basketball, and Paintball.",
  alternates: { canonical: "/clubs/wall" },
};

/** The landing page is the wall and nothing else: the board fills the first
    screen under the 64px sticky header, every club is a sticker on it. */
export default function ClubsPage() {
  const nextEvent = getEvents(new Date())[0];

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <ClubhouseWall nextEvent={nextEvent} />
    </main>
  );
}
