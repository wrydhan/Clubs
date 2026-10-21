import s from "./desk.module.css";

/**
 * Desk props, drawn as SVG so they scale with the viewport and stay crisp.
 * All decorative: `aria-hidden`, no focus targets, nothing to tab through
 * before the charter itself.
 */

/** Coffee mug, three-quarter view, steam going up behind the paper. */
export function Mug() {
  return (
    <svg viewBox="0 0 160 150" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="mugBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f2e9d8" />
          <stop offset="46%" stopColor="#d9c9b0" />
          <stop offset="100%" stopColor="#b8a48a" />
        </linearGradient>
        <linearGradient id="mugCoffee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2417" />
          <stop offset="100%" stopColor="#1c1109" />
        </linearGradient>
        <radialGradient id="mugShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* steam: two wisps, CSS-animated, gone under reduced motion */}
      <g fill="none" stroke="#f6e7cd" strokeWidth="3" strokeLinecap="round" opacity="0.5">
        <path className={s.steam} d="M58 52c-6-9 6-14 0-23" />
        <path className={`${s.steam} ${s.steam2}`} d="M82 54c-6-9 6-15 0-25" />
      </g>

      {/* contact shadow */}
      <ellipse cx="80" cy="136" rx="58" ry="11" fill="url(#mugShadow)" />

      {/* handle */}
      <path
        d="M112 62c18-2 26 8 26 18s-9 20-26 19"
        fill="none"
        stroke="#cbb99f"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* body */}
      <path d="M32 52h74l-6 74a10 10 0 0 1-10 9H48a10 10 0 0 1-10-9z" fill="url(#mugBody)" />
      {/* rim */}
      <ellipse cx="69" cy="52" rx="37" ry="11" fill="#efe5d3" />
      <ellipse cx="69" cy="53" rx="31" ry="8.5" fill="url(#mugCoffee)" />
      <ellipse cx="60" cy="51" rx="12" ry="3.4" fill="rgba(255,240,214,0.16)" />
      {/* ring stripe */}
      <path d="M35 96h69" stroke="#b1412c" strokeWidth="5" opacity="0.55" />
    </svg>
  );
}

/** Fountain pen, capped, lying across the desk at an angle. */
export function Pen() {
  return (
    <svg viewBox="0 0 220 44" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="penBarrel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3a30" />
          <stop offset="38%" stopColor="#201712" />
          <stop offset="100%" stopColor="#0d0907" />
        </linearGradient>
        <linearGradient id="penCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a87c" />
          <stop offset="45%" stopColor="#8d6c43" />
          <stop offset="100%" stopColor="#4a3421" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="30" rx="104" ry="7" fill="rgba(0,0,0,0.4)" />
      <rect x="18" y="10" width="164" height="17" rx="8.5" fill="url(#penBarrel)" />
      <rect x="18" y="12" width="164" height="4" rx="2" fill="rgba(255,255,255,0.14)" />
      <rect x="150" y="9" width="42" height="19" rx="9" fill="url(#penCap)" />
      <rect x="150" y="11" width="42" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="188" y="16" width="12" height="5" rx="2.5" fill="#2a1d14" />
      <rect x="10" y="15" width="16" height="7" rx="3.5" fill="#2a1d14" />
      <circle cx="160" cy="18.5" r="2.6" fill="#efe4cd" opacity="0.8" />
    </svg>
  );
}

/** Roll of masking tape, seen from above at a tilt, with a loose end. */
export function TapeRoll() {
  return (
    <svg viewBox="0 0 140 128" className="h-auto w-full" aria-hidden>
      <defs>
        <radialGradient id="tapeRim" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f6eddc" />
          <stop offset="70%" stopColor="#e2d3b8" />
          <stop offset="100%" stopColor="#bda98b" />
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="112" rx="52" ry="10" fill="rgba(0,0,0,0.4)" />
      <ellipse cx="70" cy="64" rx="54" ry="50" fill="url(#tapeRim)" />
      <ellipse cx="70" cy="64" rx="54" ry="50" fill="none" stroke="rgba(120,96,62,0.35)" strokeWidth="1" />
      <ellipse cx="70" cy="64" rx="27" ry="25" fill="#5b3f26" />
      <ellipse cx="70" cy="64" rx="27" ry="25" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="3" />
      <ellipse cx="70" cy="66" rx="24" ry="22" fill="rgba(0,0,0,0.35)" />
      <path d="M124 70c10 4 14 12 10 20-4 8-14 8-22 2" fill="none" stroke="#ece0c8" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

/** A bulldog clip, for the corner of the frame. */
export function BulldogClip() {
  return (
    <svg viewBox="0 0 100 110" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="clipMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9c9188" />
          <stop offset="45%" stopColor="#4d453e" />
          <stop offset="100%" stopColor="#211d1a" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="100" rx="38" ry="7" fill="rgba(0,0,0,0.35)" />
      <path d="M28 76c-8-6-10-16-6-26 4-11 16-18 28-18s24 7 28 18c4 10 2 20-6 26z" fill="url(#clipMetal)" />
      <rect x="20" y="70" width="60" height="16" rx="4" fill="#2d2622" />
      <rect x="24" y="73" width="52" height="4" rx="2" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
}
