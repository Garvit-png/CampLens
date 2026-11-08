// ============================================================
// FILE: components/PhotoCard.tsx — EK PHOTO KA POLAROID CARD
// ============================================================
// Gallery mein har photo yeh component se dikhayi jaati hai.
//
// DESIGN:
//   - White polaroid frame (vintage photo look)
//   - Handwritten caption (Caveat font)
//   - Orange date stamp (film camera style)
//   - Har card thoda tircha (tilted) — jaise table pe bikhri photos
//   - Hover pe seedha ho jaata hai (interactive feel)
//   - Click → photo detail page pe jao
// ============================================================

import Link from "next/link";

import { filmDate, getEventName } from "@/lib/helpers";
// filmDate    → "'26 3 15" (film camera date stamp)
// getEventName → event ID se event ka naam

import type { Photo } from "@/types";

// Tailwind ko POORI class names chahiye (dynamic string nahi bana sakte)
// Isliye list mein likhi hain — index se cyclic access karenge
const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0", "-rotate-[1.5deg]"];
// 6 different tilts — har photo ka alag angle (scattered look)

interface PhotoCardProps {
  photo: Photo;   // Konsi photo dikhani hai
  index: number;  // Grid mein position — tilt aur tape decide karta hai
}

export default function PhotoCard({ photo, index }: PhotoCardProps) {
  const tilt = tilts[index % tilts.length];
  // index % tilts.length → 0,1,2,3,4,5, 0,1,2,3,4,5... (cyclic)
  // Har photo ka alag tilt angle

  const hasTape = index % 3 === 0;
  // Har teesre card pe tape ka tukda dikhao (decorative element)
  // index 0, 3, 6, 9... → tape dikhega

  return (
    <Link
      href={`/photo/${photo.id}`}
      // Click → photo detail page pe jao

      className={`group relative block ${tilt} transition duration-300 hover:z-10 hover:-translate-y-1 hover:rotate-0`}
      // group → hover effects child elements pe bhi apply kar sakte hain
      // hover:z-10 → hover pe upar aata hai (other photos ke upar)
      // hover:-translate-y-1 → hover pe 4px upar uthta hai
      // hover:rotate-0 → hover pe seedha ho jaata hai (tilt fix)
    >
      {/* Tape piece (har teesre card pe) */}
      {hasTape && (
        <span
          className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 bg-mustard/45"
          aria-hidden="true"
          // aria-hidden → decorative hai, screen reader skip karo
        />
      )}

      <div className="polaroid">
        {/* polaroid → custom CSS class (white frame, shadow) */}

        <div className="relative aspect-square overflow-hidden bg-ink/10">
          {/* aspect-square → 1:1 ratio (square thumbnail) */}
          {/* overflow-hidden → square ke bahar image crop ho jaaye */}
          {/* bg-ink/10 → placeholder background (image load hone tak) */}

          <img
            src={photo.imageUrl}
            alt={photo.caption}
            loading="lazy"
            // lazy → jab tak scroll karke yahan nahi aate, image load nahi hogi
            // Performance: 50 photos ek saath load nahi honge
            className="h-full w-full object-cover contrast-105 sepia-30 transition duration-500 group-hover:sepia-0"
            // object-cover → image ko crop karke square fill karo
            // contrast-105 → thoda zyada contrast (vintage feel)
            // sepia-30 → 30% sepia tint (old photo look)
            // group-hover:sepia-0 → hover pe sepia hatao (color photo dikhe)
          />

          {/* Date stamp (film camera style) */}
          <span className="date-stamp absolute bottom-2 right-2 text-xs">
            {filmDate(photo.uploadedAt)}
            {/* "'26 3 15" → orange date stamp bottom right */}
          </span>
        </div>

        {/* Caption (handwriting style) */}
        <p className="mt-3 truncate font-hand text-2xl leading-none">
          {photo.caption}
          {/* font-hand → Caveat handwriting font */}
          {/* truncate → bahut lamba caption → "..." lagao */}
        </p>

        {/* Event name (small uppercase text) */}
        <p className="mt-1.5 truncate text-[11px] uppercase tracking-widest text-muted">
          {getEventName(photo.eventId)}
          {/* Event ID → event naam ("Damru 2026") */}
        </p>
      </div>
    </Link>
  );
}
