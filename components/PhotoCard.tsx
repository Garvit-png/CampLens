// Ek photo, polaroid style mein: white frame, handwritten caption, orange date stamp.
// Har card thoda tircha (tilted) hai jaise table pe photos bikhri hon. Hover pe seedha ho jaata hai.

import Link from "next/link";
import { filmDate, getEventName } from "@/lib/helpers";
import type { Photo } from "@/types";

// Tailwind ko poori class names chahiye, isliye list mein likhi hain (string jod ke nahi bana sakte)
const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0", "-rotate-[1.5deg]"];

interface PhotoCardProps {
  photo: Photo;
  index: number; // position se tilt aur tape decide hota hai
}

export default function PhotoCard({ photo, index }: PhotoCardProps) {
  const tilt = tilts[index % tilts.length];
  const hasTape = index % 3 === 0; // har teesre card pe tape ka tukda

  return (
    <Link
      href={`/photo/${photo.id}`}
      className={`group relative block ${tilt} transition duration-300 hover:z-10 hover:-translate-y-1 hover:rotate-0`}
    >
      {hasTape && (
        <span className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 bg-mustard/45" aria-hidden="true" />
      )}

      <div className="polaroid">
        <div className="relative aspect-square overflow-hidden bg-ink/10">
          <img
            src={photo.imageUrl}
            alt={photo.caption}
            loading="lazy"
            className="h-full w-full object-cover contrast-105 sepia-30 transition duration-500 group-hover:sepia-0"
          />
          <span className="date-stamp absolute bottom-2 right-2 text-xs">{filmDate(photo.uploadedAt)}</span>
        </div>

        <p className="mt-3 truncate font-hand text-2xl leading-none">{photo.caption}</p>
        <p className="mt-1.5 truncate text-[11px] uppercase tracking-widest text-muted">
          {getEventName(photo.eventId)}
        </p>
      </div>
    </Link>
  );
}
