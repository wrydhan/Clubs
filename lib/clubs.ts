import { addCalendarWeeks, nextOccurrence, pacificToUtc } from "@/lib/dates";

/**
 * All club content lives here.
 * Adding a club means one object in `clubs`, plus `eventSeeds` rows if it has dates.
 * Drop image files in /public at the paths below. Missing files render a labeled placeholder.
 * Don't use the slugs "apply" or "calendar" — those routes already exist.
 */

export type ClubStatus = "active" | "coming-soon";

export type Socials = {
  discord?: string;
  x?: string;
  strava?: string;
  github?: string;
};

export type Lead = {
  name: string;
  role: string;
  photo: string;
  contact: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
  headcount?: number;
  caption?: string;
};

export type ClubTheme = {
  accent: string;
  bgLight: string;
  border: string;
  tag: string;
};

export type Club = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cadence: string;
  location: string;
  lead?: Lead;
  heroImage: string;
  galleryImages: GalleryImage[];
  status: ClubStatus;
  theme: ClubTheme;
  socials?: Socials;
  /** Group chat is never a public link. The president adds people. */
  chat?: "whatsapp";
};

export type ClubEvent = {
  id: string;
  clubSlug: string;
  title: string;
  datetime: string;
  location: string;
  rsvpUrl: string;
  description: string;
  capacity?: number;
};

type EventSeed = {
  id: string;
  clubSlug: string;
  title: string;
  location: string;
  description: string;
  rsvpUrl: string;
  capacity?: number;
} & (
  | {
      /** A real date. Drops off after the day ends. */
      date: { year: number; month: number; day: number; hour: number; minute: number };
    }
  | {
      /** 0 Sunday … 6 Saturday */
      weekday: number;
      hour: number;
      minute: number;
      /** Weeks after the next occurrence. 0 is the soonest one. */
      weekOffset: number;
    }
);

export const clubs: Club[] = [
  {
    slug: "cars",
    name: "Car Club",
    tagline: "Track days for founders who love driving.",
    description:
      "Full-day private track sessions at Sonoma Raceway and Thunderhill. We organize morning convoys leaving Fort Mason at 7:00 AM, with paddock hospitality, run groups for novice through advanced drivers, and shared technical support. Bring your own car and approved helmet, or RSVP for passenger ride-alongs with seasoned drivers.",
    cadence: "Seasonal track days",
    location: "Sonoma Raceway · Convoy from Fort Mason Pier 2",
    heroImage: "/images/clubs/cars-hero.jpg",
    galleryImages: [
      {
        src: "/images/clubs/cars/cover.jpg",
        alt: "Paddock lineup of performance cars at sunrise",
        caption: "Morning paddock staging",
      },
      {
        src: "/images/clubs/cars/01.jpg",
        alt: "Driver gearing up in the paddock",
        caption: "Driver prep",
      },
      {
        src: "/images/clubs/cars/02.jpg",
        alt: "Front three-quarter view of a track-prepped sports car",
        caption: "Paddock inspection",
      },
      {
        src: "/images/clubs/cars/03.jpg",
        alt: "Cars lined up at pit exit awaiting green flag",
        caption: "Pit lane departure",
      },
      {
        src: "/images/clubs/cars/04.jpg",
        alt: "Cockpit perspective entering turn two at Sonoma",
        caption: "Sonoma Raceway circuit",
      },
      {
        src: "/images/clubs/cars/05.jpg",
        alt: "Driver briefing and track walkthrough map",
        caption: "Morning driver briefing",
      },
      {
        src: "/images/clubs/cars/06.jpg",
        alt: "Driver navigating high-speed elevation changes",
        caption: "Main straightaway",
      },
      {
        src: "/images/clubs/cars/07.jpg",
        alt: "Passing through the carousel bend",
        caption: "Turn 6 carousel",
      },
      {
        src: "/images/clubs/cars/08.jpg",
        alt: "Convoy gathering in the paddock post-session",
        caption: "Post-session cooldown",
      },
    ],
    status: "active",
    theme: {
      accent: "#1900ff",
      bgLight: "#eff2ff",
      border: "#c7d2fe",
      tag: "Motorsport",
    },
    chat: "whatsapp",
  },
  {
    slug: "hardware",
    name: "Hardware Club",
    tagline: "Machine the custom parts yourself.",
    description:
      "Rapid fabrication and prototyping at the Fort Mason workshop. CNC milling, precision laser cutting, 3D printing farms, electronics rework stations, and assembly benches. A collective workshop for founders building physical products, robotics, and experimental devices.",
    cadence: "Bi-weekly workshop nights",
    location: "Pier 2 Workshop, Fort Mason",
    heroImage: "/images/clubs/workshop-still.jpg",
    galleryImages: [],
    status: "coming-soon",
    theme: {
      accent: "#ea580c",
      bgLight: "#fff7ed",
      border: "#fed7aa",
      tag: "Prototyping",
    },
  },
  {
    slug: "basketball",
    name: "Basketball Club",
    tagline: "Competitive weekly pickup. High pace, no talk.",
    description:
      "Fast-paced full-court runs at the Fort Mason indoor gym. Founder, operator, and builder community games. Clean rotations, no refs, competitive energy, and zero pitch decks allowed on the floor.",
    cadence: "Every Tuesday evening",
    location: "Fort Mason Gymnasium, San Francisco",
    heroImage: "/images/clubs/paddock-still.jpg",
    galleryImages: [],
    status: "coming-soon",
    theme: {
      accent: "#16a34a",
      bgLight: "#f0fdf4",
      border: "#bbf7d0",
      tag: "Athletics",
    },
  },
  {
    slug: "paintball",
    name: "Paintball Club",
    tagline: "Tactical woodsball field days across the Bay.",
    description:
      "Full-day outdoor woodsball and scenario games at premier Bay Area fields. Team strategy, high-intensity rounds, gear rentals covered by Founders, Inc., and transport organized from Fort Mason.",
    cadence: "Monthly field trips",
    location: "Bay Area Outdoor Fields · Van convoy from Pier 2",
    heroImage: "/images/clubs/hub-hero.jpg",
    galleryImages: [],
    status: "coming-soon",
    theme: {
      accent: "#dc2626",
      bgLight: "#fef2f2",
      border: "#fecaca",
      tag: "Field Days",
    },
  },
];

const eventSeeds: EventSeed[] = [
  {
    id: "sonoma-2026-10-26",
    clubSlug: "cars",
    title: "Founders Track Day at Sonoma",
    date: { year: 2026, month: 10, day: 26, hour: 7, minute: 0 },
    location: "Sonoma Raceway",
    rsvpUrl: "https://luma.com/founderstrackday",
    description:
      "Convoy departs Fort Mason Pier 2 parking at 7:00 AM sharp. Sonoma check-in opens at 8:00 AM, mandatory driver meeting at 8:30 AM, with first run group on circuit at 9:00 AM. Lunch and paddock refreshments provided. Full safety gear and Snell/DOT helmet required. Both drivers and passengers must RSVP.",
  },
];

export const hubHero = {
  src: "/images/clubs/hub-hero.jpg",
  alt: "Track prepped sports car at Sonoma Raceway",
  label: "Car Club",
  caption: "Sonoma Raceway private track day.",
};

export function getClubs(): Club[] {
  return clubs;
}

export function getClub(slug: string): Club | undefined {
  return clubs.find((club) => club.slug === slug);
}

function seedWhen(seed: EventSeed, now: Date): Date | null {
  if ("date" in seed) {
    const when = pacificToUtc(seed.date.year, seed.date.month, seed.date.day, seed.date.hour, seed.date.minute);
    const dayOver = when.getTime() + 10 * 60 * 60 * 1000;
    if (dayOver < now.getTime()) return null;
    return when;
  }
  const first = nextOccurrence(seed.weekday, seed.hour, seed.minute, now);
  return addCalendarWeeks(first, seed.weekOffset);
}

export function getEvents(now = new Date()): ClubEvent[] {
  return eventSeeds
    .flatMap((seed) => {
      const when = seedWhen(seed, now);
      if (!when) return [];
      return [
        {
          id: seed.id,
          clubSlug: seed.clubSlug,
          title: seed.title,
          datetime: when.toISOString(),
          location: seed.location,
          rsvpUrl: seed.rsvpUrl,
          description: seed.description,
          capacity: seed.capacity,
        },
      ];
    })
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

export function getNextEvent(slug: string, now = new Date()): ClubEvent | undefined {
  return getEvents(now).find((event) => event.clubSlug === slug);
}

/** Next few events for the hub. Fills past seven days if the week would look dead. */
export function getThisWeek(now = new Date()): ClubEvent[] {
  const upcoming = getEvents(now);
  const horizon = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  const soon = upcoming.filter((event) => new Date(event.datetime).getTime() <= horizon);
  if (soon.length >= 3) return soon.slice(0, 5);
  return upcoming.slice(0, Math.min(4, upcoming.length));
}

export function sortClubs(now = new Date()): Club[] {
  const events = getEvents(now);
  return [...clubs].sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    const aNext = events.find((event) => event.clubSlug === a.slug);
    const bNext = events.find((event) => event.clubSlug === b.slug);
    const aTime = aNext ? new Date(aNext.datetime).getTime() : Number.POSITIVE_INFINITY;
    const bTime = bNext ? new Date(bNext.datetime).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
}

export function otherClubs(slug: string, now = new Date()): Club[] {
  return sortClubs(now)
    .filter((club) => club.slug !== slug)
    .slice(0, 3);
}

const socialLabels: Record<keyof Socials, string> = {
  discord: "Discord",
  x: "X",
  strava: "Strava",
  github: "GitHub",
};

export function socialEntries(club: Club): { key: string; label: string; href: string }[] {
  if (!club.socials) return [];
  return (Object.keys(socialLabels) as (keyof Socials)[])
    .filter((key) => Boolean(club.socials?.[key]))
    .map((key) => ({
      key,
      label: socialLabels[key],
      href: club.socials?.[key] as string,
    }));
}
