/** Collage asset map — everything the paper system needs in one place. */

export type PaperKind = "kraft" | "news" | "cream";

export const papers: Record<
  PaperKind,
  { label: string; className: string; hex: string; src: string }
> = {
  kraft: {
    label: "Kraft",
    className: "tex-kraft",
    hex: "#D9B98C",
    src: "/collage/paper-kraft.jpg",
  },
  news: {
    label: "Newsprint",
    className: "tex-news",
    hex: "#EFE4CD",
    src: "/collage/paper-newsprint.jpg",
  },
  cream: {
    label: "Cream stock",
    className: "bg-paper",
    hex: "#F4EDE1",
    src: "/collage/paper-kraft.jpg",
  },
};

/** Each club's die-cut sticker. Assets were shot on their own paper scrap. */
export const clubStickers: Record<string, string> = {
  cars: "/collage/sticker-cars.webp",
  basketball: "/collage/sticker-hoops.webp",
  hardware: "/collage/sticker-hardware.webp",
  paintball: "/collage/sticker-paintball.webp",
};

export const stickerOptions = [
  { id: "cars", label: "Racing helmet", src: "/collage/sticker-cars.jpg" },
  { id: "basketball", label: "Chain hoop", src: "/collage/sticker-hoops.jpg" },
  { id: "run", label: "Running shoe", src: "/collage/sticker-run.jpg" },
  { id: "hardware", label: "Soldering iron", src: "/collage/sticker-hardware.jpg" },
  { id: "paintball", label: "Paintball mask", src: "/collage/sticker-paintball.jpg" },
] as const;

export function stickerFor(slug: string): string | undefined {
  return clubStickers[slug];
}

/* ---------- the wall's scrap → destination map ---------- */

/**
 * Every scrap on the clubhouse wall knows where it goes when it is carried off
 * the paper. The empty wall means "nothing chosen"; the taped edge drop-zones
 * in `dragZones` are the explicit targets.
 */
export type ScrapId =
  | "wordmark"
  | "note"
  | "helmet"
  | "sneaker"
  | "badge-cars"
  | "badge-hoops"
  | "badge-hardware"
  | "badge-paintball"
  | "charter";

export const scrapLabels: Record<ScrapId, string> = {
  wordmark: "Founders, Inc. Clubs wordmark",
  note: "Handwritten track day note",
  helmet: "Racing helmet magazine cut-out",
  sneaker: "Running shoe magazine cut-out",
  "badge-cars": "Car Club sticker",
  "badge-hoops": "Basketball Club sticker",
  "badge-hardware": "Hardware Club sticker",
  "badge-paintball": "Paintball Club sticker",
  charter: "Start a club card",
};

/** Where each scrap lands when it is dropped past the wall edge. */
export const scrapHrefs: Record<ScrapId, string> = {
  wordmark: "/clubs",
  note: "/clubs/calendar",
  helmet: "/clubs/cars",
  sneaker: "/clubs/basketball",
  "badge-cars": "/clubs/cars",
  "badge-hoops": "/clubs/basketball",
  "badge-hardware": "/clubs/hardware",
  "badge-paintball": "/clubs/paintball",
  charter: "/clubs/apply",
};

export type DragZone = {
  id: "calendar" | "club" | "roster" | "charter";
  label: string;
  hint: string;
  href: string;
};

/** Taped zones that appear around the wall while a scrap is being carried. */
export const dragZones: DragZone[] = [
  { id: "charter", label: "Start a club", hint: "the studio", href: "/clubs/apply" },
  { id: "calendar", label: "Calendar", hint: "every date", href: "/clubs/calendar" },
  { id: "club", label: "Club page", hint: "Car Club", href: "/clubs/cars" },
  { id: "roster", label: "Roster", hint: "four clubs pinned", href: "/clubs#roster" },
];
