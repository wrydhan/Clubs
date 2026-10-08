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
    tagline: "Track days for people who actually drive.",
    description:
      "Track days out of San Francisco. The next one is a full day at Sonoma Raceway. The convoy leaves the Fort Mason parking lot at 7am, check-in on site is at 8, and the day runs until about 5. Bring a helmet. Drivers sign up as drivers and need approval. If you don't have a car, RSVP as a passenger. Space is limited.",
    cadence: "A few times a year",
    location: "Sonoma Raceway · convoy from Fort Mason",
    heroImage: "/images/clubs/cars/cover.jpg",
    galleryImages: [
      {
        src: "/images/clubs/cars/01.jpg",
        alt: "A person pulling on a white helmet beside the track",
        caption: "Between sessions",
      },
      {
        src: "/images/clubs/cars/02.jpg",
        alt: "The nose of a blue Porsche in the paddock",
        caption: "Paddock",
      },
      {
        src: "/images/clubs/cars/03.jpg",
        alt: "A white car waiting at the starter stand",
        caption: "Starter stand",
      },
      {
        src: "/images/clubs/cars/04.jpg",
        alt: "Cars ahead on track, seen from the driver's seat",
        caption: "On track",
      },
      {
        src: "/images/clubs/cars/05.jpg",
        alt: "The drivers meeting in front of a map of the track",
        caption: "Drivers meeting",
      },
      {
        src: "/images/clubs/cars/06.jpg",
        alt: "A driver in a helmet at the wheel, hills through the windshield",
        caption: "At the wheel",
      },
    ],
    status: "active",
    chat: "whatsapp",
  },
  {
    slug: "hardware",
    name: "Hardware Club",
    tagline: "Make the part instead of ordering it.",
    description:
      "CNC, the laser, and the Fort Mason workshop in San Francisco. This one isn't running yet.",
    cadence: "Coming soon",
    location: "Fort Mason workshop, San Francisco",
    heroImage: "/images/clubs/hardware-hero.jpg",
    galleryImages: [],
    status: "coming-soon",
  },
  {
    slug: "basketball",
    name: "Basketball Club",
    tagline: "Pickup on Tuesdays. That's the whole pitch.",
    description:
      "Founder basketball at the Fort Mason gym in San Francisco. This one isn't running yet.",
    cadence: "Coming soon",
    location: "Fort Mason gym, San Francisco",
    heroImage: "/images/clubs/basketball-hero.jpg",
    galleryImages: [],
    status: "coming-soon",
  },
  {
    slug: "paintball",
    name: "Paintball Club",
    tagline: "A field day. Paint on your clothes.",
    description:
      "A few times a season, a field outside San Francisco. This one isn't running yet.",
    cadence: "Coming soon",
    location: "A Bay Area field",
    heroImage: "/images/clubs/paintball-hero.jpg",
    galleryImages: [],
    status: "coming-soon",
  },
];

const eventSeeds: EventSeed[] = [
  {
    id: "sonoma-2026-10-26",
    clubSlug: "cars",
    title: "Founders Track Day",
    date: { year: 2026, month: 10, day: 26, hour: 7, minute: 0 },
    location: "Sonoma Raceway",
    rsvpUrl: "https://luma.com/founderstrackday",
    description:
      "Convoy leaves the Fort Mason parking lot at 7:00am. At Sonoma, driver check-in is 8:00, the drivers meeting is 8:30, and the first run goes out at 9:00. Lunch is noon to 1. Done around 5. Helmet required. Drivers and passengers both RSVP. Drivers need approval.",
  },
];

export const hubHero = {
  src: "/images/clubs/hub-hero.jpg",
  alt: "A white Porsche in the lot as the sun drops",
  label: "Car Club",
  caption: "Sonoma Raceway, October 26.",
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
