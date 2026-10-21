import s from "./desk.module.css";

/**
 * Desk props, drawn as SVG so they scale with the viewport and stay crisp.
 * All decorative: `aria-hidden`, no focus targets, nothing to tab through
 * before the charter itself.
 */

/** Coffee mug, seen from a chair: rim ellipse, thick wall, cast shadow. */
export function Mug() {
  return (
    <svg viewBox="0 0 200 170" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="mugBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbf4e6" />
          <stop offset="38%" stopColor="#eee1cb" />
          <stop offset="100%" stopColor="#b9a488" />
        </linearGradient>
        <linearGradient id="mugInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e7dac2" />
          <stop offset="100%" stopColor="#c9b696" />
        </linearGradient>
        <radialGradient id="mugCoffee" cx="42%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#4a2f1c" />
          <stop offset="100%" stopColor="#180e07" />
        </radialGradient>
        <radialGradient id="mugShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(20,12,7,0.6)" />
          <stop offset="70%" stopColor="rgba(20,12,7,0.22)" />
          <stop offset="100%" stopColor="rgba(20,12,7,0)" />
        </radialGradient>
      </defs>

      {/* steam, drifting up out of frame */}
      <g fill="none" stroke="#f8ecd6" strokeWidth="3.4" strokeLinecap="round" opacity="0.42">
        <path className={s.steam} d="M72 60c-7-11 7-17 0-28" />
        <path className={`${s.steam} ${s.steam2}`} d="M98 62c-7-11 7-18 0-30" />
      </g>

      {/* shadow on the desk, offset away from the lamp */}
      <ellipse cx="104" cy="148" rx="74" ry="15" fill="url(#mugShadow)" />

      {/* handle */}
      <path d="M139 78c22-3 32 9 32 22s-11 24-32 22" fill="none" stroke="#d9c9ae" strokeWidth="13" strokeLinecap="round" />
      <path d="M139 78c22-3 32 9 32 22s-11 24-32 22" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round" />

      {/* body */}
      <path d="M44 62h84l-7 74a12 12 0 0 1-12 11H63a12 12 0 0 1-12-11z" fill="url(#mugBody)" />
      {/* shaded right wall of the cylinder */}
      <path d="M112 62h16l-7 74a12 12 0 0 1-12 11h-9z" fill="rgba(90,66,42,0.14)" />

      {/* rim: wall thickness, then the coffee */}
      <ellipse cx="86" cy="62" rx="42" ry="14" fill="url(#mugInner)" />
      <ellipse cx="86" cy="63" rx="36" ry="10.5" fill="url(#mugCoffee)" />
      <ellipse cx="74" cy="60" rx="13" ry="3.4" fill="rgba(255,242,216,0.14)" />

      {/* the club's own sticker, half-peeled on the side */}
      <g transform="rotate(-6 88 112)">
        <rect x="66" y="100" width="34" height="24" rx="2" fill="#f4ede1" stroke="rgba(36,26,21,0.25)" strokeWidth="1" />
        <text x="83" y="116" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill="#b1412c" letterSpacing="1">F.INC</text>
      </g>
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

/** Roll of masking tape on its side, layers showing, tape tail running off. */
export function TapeRoll() {
  return (
    <svg viewBox="0 0 170 120" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="tapeWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2e6cf" />
          <stop offset="55%" stopColor="#e0d0b2" />
          <stop offset="100%" stopColor="#b9a482" />
        </linearGradient>
        <linearGradient id="tapeCore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8855a" />
          <stop offset="100%" stopColor="#6f5333" />
        </linearGradient>
      </defs>

      <ellipse cx="66" cy="106" rx="56" ry="9" fill="rgba(20,12,7,0.42)" />

      {/* the tape tail, peeling off toward the paper */}
      <path d="M116 52c22 6 34 16 44 24-9 6-20 8-31 5-9-2-16-8-19-15z" fill="#efe4cd" opacity="0.95" />
      <path d="M116 52c22 6 34 16 44 24" fill="none" stroke="rgba(120,96,62,0.35)" strokeWidth="1" />

      {/* the roll, on its side: two rings and a hole */}
      <path d="M16 62a50 40 0 1 0 100 0a50 40 0 1 0-100 0z" fill="url(#tapeWall)" />
      <ellipse cx="16" cy="62" rx="18" ry="15" fill="#d4c1a0" />
      <ellipse cx="16" cy="62" rx="11" ry="9" fill="url(#tapeCore)" />
      <ellipse cx="16" cy="62" rx="11" ry="9" fill="none" stroke="rgba(60,42,26,0.5)" strokeWidth="1.5" />

      {/* wound layers along the side wall */}
      <g stroke="rgba(120,96,62,0.28)" strokeWidth="1.2" fill="none">
        <path d="M30 26c6 22 6 50 0 72" />
        <path d="M46 20c7 24 7 60 0 84" />
        <path d="M62 17c7 26 7 64 0 90" />
        <path d="M78 17c7 26 7 64 0 90" />
        <path d="M94 20c7 24 7 60 0 84" />
      </g>
      <path d="M16 62a50 40 0 0 0 100 0" fill="none" stroke="rgba(36,26,21,0.22)" strokeWidth="1.4" />
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
