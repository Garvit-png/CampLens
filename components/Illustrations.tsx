// Haath se bane jaise illustrations (SVG). Sab riso colors use karte hain:
// neeli line (ink), fill mein pink / yellow / green.
// Koi image file nahi — sab code mein hai, isliye fast load hote hain.

const INK = "var(--color-ink)";
const PINK = "var(--color-pink)";
const SUN = "var(--color-sun)";
const LEAF = "var(--color-leaf)";
const WHITE = "var(--color-white)";
const SKY = "var(--color-sky)";

const line = {
  stroke: INK,
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type Props = { className?: string };

// Chaar kone wala chamakta tara
function Sparkle({ x, y, size = 12, fill = SUN, className = "" }: { x: number; y: number; size?: number; fill?: string; className?: string }) {
  const s = size;
  return (
    <path
      className={className}
      d={`M${x} ${y - s} C${x + s * 0.15} ${y - s * 0.15} ${x + s * 0.15} ${y - s * 0.15} ${x + s} ${y} C${x + s * 0.15} ${y + s * 0.15} ${x + s * 0.15} ${y + s * 0.15} ${x} ${y + s} C${x - s * 0.15} ${y + s * 0.15} ${x - s * 0.15} ${y + s * 0.15} ${x - s} ${y} C${x - s * 0.15} ${y - s * 0.15} ${x - s * 0.15} ${y - s * 0.15} ${x} ${y - s}Z`}
      fill={fill}
      {...line}
      strokeWidth={2.5}
    />
  );
}

/* ------------------------------------------------------------
   Hero: purana camera (flash ke saath), damru, film roll, taare
   ------------------------------------------------------------ */
export function HeroScene({ className }: Props) {
  return (
    <svg viewBox="0 0 440 400" className={className} aria-hidden="true">
      {/* peeche pink "misprint" blob */}
      <path d="M78 150c10-52 70-80 150-74s150 40 152 108-34 140-140 146S60 292 66 222c2-28 6-50 12-72Z" fill={PINK} opacity="0.9" />

      {/* camera strap */}
      <path d="M70 196c-34 10-50 52-30 92 16 32 52 44 70 70" fill="none" {...line} strokeDasharray="1 9" strokeWidth={5} />

      <g transform="rotate(-6 220 220)">
        {/* viewfinder bump */}
        <rect x="128" y="104" width="96" height="44" rx="10" fill={WHITE} {...line} />
        <rect x="150" y="116" width="34" height="18" rx="4" fill={SKY} {...line} strokeWidth={2.5} />
        {/* shutter button */}
        <rect x="282" y="112" width="40" height="26" rx="6" fill={PINK} {...line} />
        {/* body */}
        <rect x="74" y="138" width="292" height="178" rx="22" fill={SUN} {...line} />
        {/* leather band */}
        <path d="M74 186h292M74 276h292" {...line} strokeWidth={2.5} />
        {/* flash */}
        <rect x="94" y="152" width="56" height="26" rx="5" fill={WHITE} {...line} />
        <path d="M102 158l40 14M102 172l40-14" stroke={INK} strokeWidth={1.5} opacity="0.4" />
        {/* lens */}
        <circle cx="222" cy="230" r="72" fill={WHITE} {...line} />
        <circle cx="222" cy="230" r="52" fill={INK} {...line} />
        <circle cx="222" cy="230" r="30" fill="#1d2766" />
        <path d="M200 208a30 30 0 0 1 24-10" stroke={WHITE} strokeWidth={6} strokeLinecap="round" fill="none" />
        <circle cx="246" cy="250" r="5" fill={PINK} />
        {/* little dial */}
        <circle cx="330" cy="168" r="14" fill={WHITE} {...line} />
        <path d="M330 158v10" {...line} strokeWidth={2.5} />
      </g>

      {/* flash burst (animate) — flash ke upar pankhe jaisi lines */}
      <g style={{ transformOrigin: "112px 150px" }} className="animate-flash">
        {[-160, -135, -110, -85, -60].map((deg) => (
          <path
            key={deg}
            d="M112 150m30 0h26"
            transform={`rotate(${deg} 112 150)`}
            stroke={PINK}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* damru (fest ka naam bhi Damru hai) */}
      <g transform="translate(352 308) rotate(18)">
        <path d="M-28 -34h56L4 0l24 34h-56L-4 0Z" fill={PINK} {...line} />
        <path d="M-28 -34h56M-28 34h56" {...line} strokeWidth={5} />
        <path d="M-4 0c-18 4-30 14-38 26" fill="none" {...line} strokeWidth={2} />
        <circle cx="-44" cy="28" r="6" fill={SUN} {...line} strokeWidth={2} />
        <path d="M4 0c18-4 30-14 38-26" fill="none" {...line} strokeWidth={2} />
        <circle cx="44" cy="-28" r="6" fill={SUN} {...line} strokeWidth={2} />
      </g>

      {/* film roll strip */}
      <g transform="translate(36 336) rotate(-8)">
        <rect x="0" y="0" width="150" height="40" rx="3" fill={INK} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <g key={i}>
            <rect x={6 + i * 18} y="4" width="8" height="6" rx="1.5" fill={WHITE} />
            <rect x={6 + i * 18} y="30" width="8" height="6" rx="1.5" fill={WHITE} />
          </g>
        ))}
        <rect x="10" y="13" width="36" height="14" fill={PINK} />
        <rect x="56" y="13" width="36" height="14" fill={SUN} />
        <rect x="102" y="13" width="36" height="14" fill={LEAF} />
      </g>

      <Sparkle x={390} y={70} size={16} />
      <Sparkle x={52} y={110} size={10} fill={WHITE} />
      <Sparkle x={406} y={200} size={9} fill={PINK} />
      <Sparkle x={250} y={46} size={11} fill={LEAF} />
    </svg>
  );
}

/* ------------------------------------------------------------
   Bunting: fest wali jhandiyan, page ke upar
   ------------------------------------------------------------ */
export function Bunting({ className }: Props) {
  const colors = [PINK, SUN, LEAF, WHITE, PINK, SUN, SKY];
  const flags = Array.from({ length: 22 }, (_, i) => i);
  // rassi ka curve: y = 10 + sag
  const yAt = (x: number) => 8 + 26 * Math.sin((x / 1200) * Math.PI);
  return (
    <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={`M0 8 Q600 60 1200 8`} fill="none" stroke={INK} strokeWidth={2} />
      {flags.map((i) => {
        const x = 20 + i * 54;
        const y = yAt(x);
        return (
          <path
            key={i}
            d={`M${x} ${y} L${x + 36} ${y + 1} L${x + 18} ${y + 38} Z`}
            fill={colors[i % colors.length]}
            stroke={INK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------
   Footer: concert crowd — upar uthe haath, kuch ke haath mein phone
   ------------------------------------------------------------ */
export function CrowdHands({ className }: Props) {
  const people = Array.from({ length: 26 }, (_, i) => i);
  return (
    <svg viewBox="0 0 1200 150" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true">
      {people.map((i) => {
        const x = 20 + i * 46 + (i % 3) * 6;
        const reach = 30 + ((i * 37) % 40); // haath kitna upar
        const tilt = ((i * 13) % 30) - 15;
        const hasPhone = i % 4 === 1;
        const headY = 150 - 10;
        return (
          <g key={i}>
            {/* arm */}
            <g transform={`rotate(${tilt} ${x} ${headY - 20})`}>
              <path d={`M${x} ${headY - 20} L${x} ${headY - 20 - reach}`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
              {hasPhone ? (
                <>
                  <rect x={x - 11} y={headY - 46 - reach} width="22" height="34" rx="4" fill={WHITE} stroke={INK} strokeWidth={3} />
                  <circle cx={x} cy={headY - 40 - reach} r="3" fill={PINK} />
                </>
              ) : (
                <circle cx={x} cy={headY - 24 - reach} r="11" fill={INK} />
              )}
            </g>
            {/* head */}
            <circle cx={x + 22} cy={headY} r="22" fill={INK} />
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------
   Loader: chhota camera, flash baar baar chamakta hai
   ------------------------------------------------------------ */
export function FlashCamera({ className }: Props) {
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden="true">
      <g style={{ transformOrigin: "44px 40px" }} className="animate-flash">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <path key={deg} d="M44 20v-14" transform={`rotate(${deg} 44 40)`} stroke={PINK} strokeWidth={5} strokeLinecap="round" />
        ))}
      </g>
      <rect x="62" y="38" width="40" height="18" rx="5" fill={WHITE} {...line} />
      <rect x="20" y="52" width="122" height="76" rx="14" fill={SUN} {...line} />
      <rect x="30" y="60" width="28" height="14" rx="3" fill={WHITE} {...line} strokeWidth={2.5} />
      <circle cx="84" cy="92" r="28" fill={WHITE} {...line} />
      <g className="origin-[84px_92px] animate-[spin_2.4s_linear_infinite]">
        <circle cx="84" cy="92" r="18" fill={INK} />
        <path d="M84 74v10M98 100l-8-5M70 100l8-5" stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------
   Khaali frame: jab koi photo na mile
   ------------------------------------------------------------ */
export function EmptyFrame({ className }: Props) {
  return (
    <svg viewBox="0 0 220 200" className={className} aria-hidden="true">
      <g transform="rotate(-5 110 100)">
        <rect x="40" y="30" width="140" height="150" rx="6" fill={WHITE} {...line} />
        <rect x="54" y="44" width="112" height="98" fill={SKY} {...line} strokeWidth={2.5} strokeDasharray="7 7" />
        <path d="M60 136l30-34 22 22 16-16 32 28" fill="none" {...line} strokeWidth={2.5} opacity="0.5" />
        <circle cx="138" cy="72" r="10" fill="none" {...line} strokeWidth={2.5} opacity="0.5" />
        <path d="M70 162h60" {...line} strokeWidth={2.5} opacity="0.4" />
      </g>
      {/* tape */}
      <rect x="86" y="18" width="52" height="20" fill={PINK} opacity="0.85" transform="rotate(4 112 28)" />
      {/* question doodles */}
      <text x="186" y="58" fontFamily="var(--font-shrikhand)" fontSize="30" fill={PINK} stroke={INK} strokeWidth="1.5">?</text>
      <text x="16" y="120" fontFamily="var(--font-shrikhand)" fontSize="22" fill={SUN} stroke={INK} strokeWidth="1.5">?</text>
    </svg>
  );
}

/* ------------------------------------------------------------
   Upload: prints ka dher + upar jaata teer
   ------------------------------------------------------------ */
export function PrintStack({ className }: Props) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden="true">
      <rect x="40" y="48" width="78" height="88" rx="4" fill={LEAF} {...line} transform="rotate(-12 79 92)" />
      <rect x="62" y="40" width="78" height="88" rx="4" fill={SUN} {...line} transform="rotate(4 101 84)" />
      <rect x="82" y="44" width="78" height="88" rx="4" fill={WHITE} {...line} transform="rotate(14 121 88)" />
      <rect x="90" y="54" width="62" height="54" fill={PINK} transform="rotate(14 121 88)" />
      {/* arrow up */}
      <path d="M178 96c8-30 2-60-16-80" fill="none" {...line} />
      <path d="M150 22l12-8 8 14" fill="none" {...line} />
      <Sparkle x={26} y={30} size={10} />
    </svg>
  );
}

/* ------------------------------------------------------------
   Success: flash burst ke beech mein tick
   ------------------------------------------------------------ */
export function DoneBurst({ className }: Props) {
  const points = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 === 0 ? 80 : 62;
    const a = (i / 24) * Math.PI * 2;
    return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <polygon points={points} fill={SUN} {...line} />
      <circle cx="100" cy="100" r="44" fill={PINK} {...line} />
      <path d="M80 102l14 14 28-32" fill="none" stroke={WHITE} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <Sparkle x={178} y={30} size={12} fill={LEAF} />
      <Sparkle x={24} y={168} size={10} fill={PINK} />
    </svg>
  );
}

/* ------------------------------------------------------------
   Haath se bani teer (annotation ke liye)
   ------------------------------------------------------------ */
export function ScribbleArrow({ className }: Props) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden="true" fill="none">
      <path d="M8 10c30-6 62 4 78 22s14 28 4 30" {...line} />
      <path d="M80 50l12 13 10-15" {...line} />
    </svg>
  );
}

/* Active nav link ke neeche pink lehar */
export function Squiggle({ className }: Props) {
  return (
    <svg viewBox="0 0 60 8" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M2 5c6-5 10 3 16-1s10-4 16 0 10 3 16-1 6-2 8-1" fill="none" stroke={PINK} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/* Logo: chhota lens */
export function LensMark({ className = "h-9 w-9" }: Props) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill={SUN} {...line} />
      <circle cx="20" cy="20" r="9" fill={INK} />
      <circle cx="17" cy="17" r="2.5" fill={WHITE} />
      <circle cx="31" cy="9" r="4" fill={PINK} {...line} strokeWidth={2} />
    </svg>
  );
}
