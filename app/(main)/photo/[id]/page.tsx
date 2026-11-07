// Photo detail ("/photo/p1"). [id] folder = dynamic route: ek hi file har photo ke liye.
// Client component hai, kyunki session mein upload ki gayi photos bhi yahan dikhni chahiye.
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { ArrowLeftIcon } from "@/components/Icons";
import ReportButton from "@/components/ReportButton";
import PhotoImage from "@/components/PhotoImage";
import { formatDate, getEventName } from "@/lib/helpers";
import { useSession } from "@/lib/session";

const stickerColors = ["bg-sun", "bg-pink-soft", "bg-white", "bg-sky"];

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>(); // URL se id
  const { collegePhotos } = useSession();

  // Sirf apne college ki photos mein dhoondo — dusre college ki photo nahi khulegi
  const photo = collegePhotos.find((p) => p.id === id);

  if (!photo) {
    return (
      <EmptyState title="Photo not found" message="It may have been removed, or it belongs to another campus.">
        <Link href="/gallery" className="btn">Back to the wall</Link>
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
      <Link href="/gallery" className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> Back to the wall
      </Link>

      <div className="mt-8 grid items-start gap-10 md:grid-cols-[3fr_2fr] lg:gap-14">
        {/* Badi photo */}
        <div>
          <div className="rounded-3xl border-[3px] border-ink bg-white p-3 shadow-[8px_8px_0_var(--color-ink)]">
            <PhotoImage src={photo.imageUrl} alt={photo.caption} lazy={false} className="aspect-square rounded-2xl" />
          </div>
        </div>

        {/* Details */}
        <div className="md:sticky md:top-28">
          <p className="text-lg font-semibold text-pink">{getEventName(photo.eventId)}</p>
          <h1 className="mt-2 font-display text-4xl leading-[1.05] md:text-5xl">{photo.caption}</h1>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y-2 border-dashed border-ink/30 py-5">
            <div className="col-span-2">
              <dt className="text-sm text-ink-soft">Shot by</dt>
              <dd className="text-lg font-semibold">{photo.uploaderName}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Uploaded</dt>
              <dd className="font-semibold">{formatDate(photo.uploadedAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Year</dt>
              <dd className="font-semibold">{photo.year}</dd>
            </div>
          </dl>

          {/* Tag pe click → gallery usi tag ke search ke saath khulti hai */}
          <div className="mt-6 flex flex-wrap gap-3">
            {photo.hashtags.map((tag, index) => (
              <Link
                key={tag}
                href={`/gallery?tag=${encodeURIComponent(tag)}`}
                className={`sticker ${stickerColors[index % stickerColors.length]} ${index % 2 ? "rotate-1" : "-rotate-1"}`}
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <ReportButton />
          </div>
        </div>
      </div>
    </div>
  );
}
