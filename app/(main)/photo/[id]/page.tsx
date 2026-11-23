"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { filmDate, formatDate } from "@/lib/helpers";
import { useSession } from "@/lib/session";

const inks = ["text-rust", "text-teal", "text-plum", "text-ink"];

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { photos } = useSession();
  const photo = photos.find(p => p.id === id);

  if (!photo) {
    return (
      <EmptyState title="Print not found" message="This photo doesn't exist.">
        <Link href="/gallery" className="btn">Back to gallery</Link>
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/gallery" className="text-sm font-bold uppercase tracking-wider text-muted hover:text-ink">
        ← Back to the archive
      </Link>

      <div className="mt-10 grid items-start gap-10 md:grid-cols-[3fr_2fr]">

        {/* Photo */}
        <div className="polaroid p-3 pb-5 -rotate-1">
          <div className="relative overflow-hidden bg-ink/10">
            <img src={photo.imageUrl} alt={photo.caption} className="w-full object-cover" />
            <span className="date-stamp absolute bottom-2 right-3 text-sm">
              {filmDate(photo.uploadedAt)}
            </span>
          </div>
          <p className="mt-3 font-hand text-3xl leading-tight">{photo.caption}</p>
        </div>

        {/* Details */}
        <div className="border-2 border-ink bg-paper-light p-5 shadow-[4px_4px_0_var(--color-ink)]">
          <p className="label">Details</p>
          <h1 className="font-serif text-2xl">{photo.eventName ?? 'College Memory'}</h1>

          <dl className="mt-5 space-y-3 border-t border-dashed border-ink/30 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Date</dt>
              <dd>{formatDate(photo.uploadedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Year</dt>
              <dd>{photo.year}</dd>
            </div>
          </dl>

          {/* Hashtags */}
          {photo.hashtags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-dashed border-ink/30 pt-4">
              {photo.hashtags.map((tag, i) => (
                <Link key={tag} href={`/gallery?tag=${encodeURIComponent(tag)}`}
                  className={`rubber-stamp ${inks[i % inks.length]} ${i % 2 ? "rotate-1" : "-rotate-1"} hover:rotate-0`}>
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
