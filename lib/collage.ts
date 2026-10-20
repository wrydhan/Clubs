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
