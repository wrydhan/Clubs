import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const tones: Record<string, string> = {
  hardware: "bg-[#3c342c] text-[#f6f1e8]",
  basketball: "bg-[#2d3531] text-[#f4f1ea]",
  cars: "bg-[#3a2e2c] text-[#f6f1e8]",
  paintball: "bg-[#2c3324] text-[#f4f1ea]",
  hub: "bg-[#2a2724] text-[#f6f1e8]",
  lead: "bg-[#3a342c] text-[#f6f1e8]",
};

function fileExists(src: string): boolean {
  if (!src.startsWith("/")) return false;
  const file = path.join(process.cwd(), "public", decodeURIComponent(src));
  try {
    return fs.existsSync(file);
  } catch {
    return false;
  }
}

function initials(label: string): string {
  return label
    .split(" ")
    .filter((part) => /[A-Za-z]/.test(part[0] ?? ""))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ClubImage({
  src,
  alt,
  label,
  tone = "hub",
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 80vw",
  mark = "large",
}: {
  src: string;
  alt: string;
  label: string;
  tone?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  mark?: "large" | "corner" | "initials";
}) {
  const present = fileExists(src);
  const toneClass = tones[tone] ?? tones.hub;

  return (
    <div className={`relative overflow-hidden ${toneClass} ${className}`}>
      {present ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div role="img" aria-label={alt} className="absolute inset-0">
          {mark === "initials" ? (
            <div className="flex h-full w-full items-center justify-center font-serif text-xl">
              {initials(label)}
            </div>
          ) : mark === "corner" ? (
            <span className="absolute left-3 top-3 text-[10px] uppercase tracking-[0.18em] opacity-70">
              Photo
            </span>
          ) : (
            <div className="flex h-full flex-col justify-between p-3">
              <span className="text-[10px] uppercase tracking-[0.18em] opacity-60">Photo</span>
              <span className="max-w-[14ch] font-serif text-[1.65rem] leading-[0.95]">{label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
