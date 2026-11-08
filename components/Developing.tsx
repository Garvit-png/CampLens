// ============================================================
// FILE: components/Developing.tsx — LOADING PLACEHOLDER
// ============================================================
// Jab data load ho raha ho ya redirect ho raha ho — yeh dikhata hai.
//
// DESIGN:
//   - Ek khaali polaroid (gradient fill, pulsing animation)
//   - "Developing…" text (film camera metaphor)
//
// USE CASES:
//   - RequireSession: jab localStorage load ho raha hai
//   - Home page: jab redirect check ho raha hai
//   - Login page: jab college nahi mila
// ============================================================

export default function Developing({ text = "Developing…" }: { text?: string }) {
  // text? → optional prop, default "Developing…"
  // Caller custom text pass kar sakta hai

  return (
    <div className="flex flex-col items-center py-32" role="status">
      {/* role="status" → screen reader ko batao: loading state hai */}

      <div className="polaroid w-36 -rotate-2">
        {/* w-36 → 144px width polaroid */}
        {/* -rotate-2 → thoda tilted (scattered photo feel) */}

        <div className="aspect-square animate-pulse bg-gradient-to-br from-ink/80 via-plum/60 to-rust/50" />
        {/* animate-pulse → Tailwind animation: opacity fade in/out (loading feel) */}
        {/* bg-gradient-to-br → gradient from top-left to bottom-right */}
        {/* from-ink/80 → dark (top-left) */}
        {/* via-plum/60 → purple (middle) */}
        {/* to-rust/50 → orange (bottom-right) */}
        {/* Result: ek "developing photo" jaisa look — colors gradually appearing */}

        {/* Caption placeholder line */}
        <div className="mt-3 h-3 w-20 bg-line" />
        {/* h-3 → 12px height (thin line) */}
        {/* w-20 → 80px width (short line — caption placeholder) */}
        {/* bg-line → custom color (light gray) */}
      </div>

      <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-muted">
        {text}
        {/* "Developing…" → loading text */}
        {/* tracking-[0.3em] → extra letter spacing (stamp/typewriter feel) */}
      </p>
    </div>
  );
}
