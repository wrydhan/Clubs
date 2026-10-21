export type HallwayClub = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cadence: string;
  location: string;
  tag: string;
  status: "active" | "coming-soon";
  lead?: { name: string; role: string };
  nextEvent?: { title: string; when: string; href: string };
};
