// Photo detail ("/photo/p1"). [id] folder = dynamic route: ek hi file har photo ke liye.
// Client component hai, kyunki session mein upload ki gayi photos bhi yahan dikhni chahiye.
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ReportButton from "@/components/ReportButton";
import { filmDate, formatDate, getEventName } from "@/lib/helpers";
import { useSession } from "@/lib/session";

const inks = ["text-rust", "text-teal", "text-plum", "text-ink"];

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>(); // URL se id
  const { collegePhotos } = useSession();

  // Sirf apne college ki photos mein dhoondo — dusre college ki photo nahi khulegi
  const photo = collegePhotos.find((p) => p.id === id);

  if (!photo) {
    return (
      <EmptyState title="Print not found" message="This photo doesn't exist, or belongs to another campus.">
        <Link href="/gallery" className="btn">Back to gallery</Link>
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/gallery" className="text-sm font-bold uppercase tracking-wider text-muted hover:text-ink">
        ← Back to the archive
      </Link>

      <div className="mt-10 grid items-start gap-14 md:grid-cols-[3fr_2fr]">
        {/* Badi polaroid */}
        <div className="relative -rotate-1">
          <span className="absolute -top-3 left-10 z-10 h-7 w-24 -rotate-6 bg-mustard/50" aria-hidden="true" />
          <div className="polaroid p-4 pb-6">
            <div className="relative overflow-hidden bg-ink/10">
              <img src={photo.imageUrl} alt={photo.caption} className="w-full object-cover sepia-15" />
              <span className="date-stamp absolute bottom-3 right-4 text-base">{filmDate(photo.uploadedAt)}</span>
            </div>
            <p className="mt-4 font-hand text-4xl leading-none">{photo.caption}</p>
          </div>
        </div>

        {/* Details — typewriter wali "back of the photo" feel */}
        <div className="border-2 border-ink bg-paper-light p-6 shadow-[6px_6px_0_var(--color-ink)]">
          <p className="label">On the back of this print</p>
          <h1 className="font-serif text-3xl leading-tight">{getEventName(photo.eventId)}</h1>

          <dl className="mt-6 space-y-3 border-t border-dashed border-ink/40 pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Taken by</dt>
              <dd className="text-right">{photo.uploaderName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Developed</dt>
              <dd>{formatDate(photo.uploadedAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Roll</dt>
              <dd>{photo.year}</dd>
            </div>
          </dl>

          {/* Tag pe click → gallery usi tag ke search ke saath khulti hai */}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-dashed border-ink/40 pt-5">
            {photo.hashtags.map((tag, index) => (
              <Link
                key={tag}
                href={`/gallery?tag=${encodeURIComponent(tag)}`}
                className={`rubber-stamp ${inks[index % inks.length]} ${index % 2 ? "rotate-1" : "-rotate-1"} hover:rotate-0`}
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <ReportButton />
          </div>
        </div>
      </div>
    </div>
  );
}
