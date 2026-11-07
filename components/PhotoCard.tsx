// Gallery ki ek photo + caption.

import Link from "next/link";
import PhotoImage from "@/components/PhotoImage";
import { formatDate, getEventName } from "@/lib/helpers";
import type { Photo } from "@/types";

// Masonry grid mein alag alag height — zine collage jaisa
const shapes = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/4]", "aspect-[4/5]", "aspect-[2/3]"];

interface PhotoCardProps {
  photo: Photo;
  index: number;
}

export default function PhotoCard({ photo, index }: PhotoCardProps) {
  const shape = shapes[index % shapes.length];

  return (
    <Link href={`/photo/${photo.id}`} className="group mb-8 block break-inside-avoid">
      <div className="rounded-2xl border-2 border-ink bg-white p-2 transition-[transform,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:shadow-[5px_5px_0_var(--color-ink)]">
        <PhotoImage src={photo.imageUrl} alt={photo.caption} className={`${shape} rounded-xl`} />
      </div>
      <p className="mt-3 px-1 font-semibold leading-snug">{photo.caption}</p>
      <p className="mt-0.5 px-1 text-sm text-ink-soft">
        {getEventName(photo.eventId)}, {formatDate(photo.uploadedAt)}
      </p>
    </Link>
  );
}
