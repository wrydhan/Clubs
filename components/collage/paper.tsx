import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/** A scrap of paper on the board. Rotation is deliberate: nothing sits square. */
export function Scrap({
  children,
  className = "",
  tone = "cream",
  torn = "torn-soft",
  rotate,
  style,
  lift = false,
  id,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  tone?: "kraft" | "news" | "cream";
  torn?: "torn" | "torn-soft" | "none";
  rotate?: number;
  style?: CSSProperties;
  lift?: boolean;
  id?: string;
  as?: "div" | "aside";
}) {
  const texture = tone === "kraft" ? "tex-kraft" : tone === "news" ? "tex-news" : "bg-paper";
  return (
    <Tag
      id={id}
      className={`relative isolate ${texture} ${torn === "none" ? "" : torn} ${
        lift ? "shadow-[var(--shadow-lift)]" : "shadow-[var(--shadow-scrap)]"
      } ${className}`}
      style={{ transform: rotate === undefined ? undefined : `rotate(${rotate}deg)`, ...style }}
    >
      {children}
    </Tag>
  );
}

/** Strip of masking tape across a paper edge. */
export function Tape({
  className = "",
  rotate = -3,
  width = 120,
  height = 34,
}: {
  className?: string;
  rotate?: number;
  width?: number;
  height?: number;
}) {
  return (
    <span
      aria-hidden
      className={`tape absolute ${className}`}
      style={{ width, height, transform: `rotate(${rotate}deg)` }}
    />
  );
}

export function Pin({ className = "", size }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden
      className={`pin absolute ${className}`}
      style={size ? { width: size, height: size } : undefined}
    />
  );
}

export function Stamp({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`stamp inline-block text-[10px] ${className}`}>{children}</span>;
}

/** Typed label above a heading, as on a notice card. */
export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`label block ${className}`}>{children}</span>;
}

/** Die-cut sticker asset, laid on paper. The asset carries its own scrap. */
export function Sticker({
  src,
  alt,
  className = "",
  size = 220,
  rotate = 0,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  rotate?: number;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size, transform: `rotate(${rotate}deg)` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 45vw, 260px"
        className="sticker-img object-contain"
      />
    </div>
  );
}

/** Magazine cut-out: white ground, dropped in with multiply. */
export function Cutout({
  src,
  alt,
  className = "",
  rotate = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, aspectRatio: "1 / 1" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 40vw, 300px"
        className="sticker-img object-contain"
      />
    </div>
  );
}
