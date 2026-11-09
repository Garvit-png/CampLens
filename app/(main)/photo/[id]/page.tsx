// ============================================================
// FILE: app/(main)/photo/[id]/page.tsx — PHOTO DETAIL ("/photo/p1")
// ============================================================
// [id] = DYNAMIC ROUTE — square brackets ka matlab URL se ID aata hai.
//   /photo/p1   → id = "p1"
//   /photo/p2   → id = "p2"
//   /photo/xyz  → id = "xyz"
// Ek hi file hazaron photos ke pages handle karti hai!
//
// Yahan ek photo ki PURI detail dikhti hai:
//   - Badi polaroid image
//   - Caption (handwriting style)
//   - Event naam, uploader, date
//   - Hashtag stamps (click → gallery search)
//   - Report button
// ============================================================

"use client";
// Client component: useParams (browser API) use kar rahe hain

import Link from "next/link";

import { useParams } from "next/navigation";
// useParams → URL se dynamic parameters nikaalta hai
// /photo/p1 → { id: "p1" }

import EmptyState from "@/components/EmptyState";
import ReportButton from "@/components/ReportButton";

import { filmDate, formatDate, getEventName } from "@/lib/helpers";
// filmDate    → "'26 3 15" (film camera date stamp)
// formatDate  → "15 Mar 2026" (readable date)
// getEventName → event ID se event ka naam

import { useSession } from "@/lib/session";
// Session se collegePhotos — isme se dhundna hai

const inks = ["text-rust", "text-teal", "text-plum", "text-ink"];
// Tag stamp colors — cyclic: 4 colors repeat hote hain


export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>();
  // URL se "id" parameter nikaalo
  // <{ id: string }> → TypeScript generic: id ek string hai

  const { collegePhotos } = useSession();
  // Session se photos lo — sirf apne college ki

  const photo = collegePhotos.find((p) => p.id === id);
  // ID se photo dhundho — agar nahi mili to undefined

  // ----------------------------------------------------------
  // PHOTO NOT FOUND
  // ----------------------------------------------------------
  if (!photo) {
    return (
      <EmptyState
        title="Print not found"
        message="This photo doesn't exist, or belongs to another campus."
        // Do possible reasons:
        // 1. Galat ID di → photo exist nahi karti
        // 2. Doosre college ki photo → collegePhotos mein nahi hogi
      >
        <Link href="/gallery" className="btn">Back to gallery</Link>
      </EmptyState>
    );
  }


  // ----------------------------------------------------------
  // PHOTO DETAIL VIEW
  // ----------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">

      {/* Back link */}
      <Link
        href="/gallery"
        className="text-sm font-bold uppercase tracking-wider text-muted hover:text-ink"
      >
        ← Back to the archive
      </Link>

      <div className="mt-10 grid items-start gap-14 md:grid-cols-[3fr_2fr]">
        {/* 3:2 ratio — image badi, details chhoti */}

        {/* --- BIG POLAROID IMAGE --- */}
        <div className="relative -rotate-1">
          {/* -rotate-1 → thoda tilted (realistic photo feel) */}

          {/* Tape piece (decorative) */}
          <span className="absolute -top-3 left-10 z-10 h-7 w-24 -rotate-6 bg-mustard/50" aria-hidden="true" />

          <div className="polaroid p-4 pb-6">
            {/* polaroid → white frame CSS class */}

            <div className="relative overflow-hidden bg-ink/10">
              <img
                src={photo.imageUrl}
                alt={photo.caption}
                className="w-full object-cover sepia-15"
                // sepia-15 → 15% sepia tint (vintage photo feel)
              />

              {/* Date stamp on photo (film camera style) */}
              <span className="date-stamp absolute bottom-3 right-4 text-base">
                {filmDate(photo.uploadedAt)}
                {/* "'26 3 15" → orange date stamp bottom right */}
              </span>
            </div>

            {/* Caption (handwriting style) */}
            <p className="mt-4 font-hand text-4xl leading-none">
              {photo.caption}
              {/* font-hand → Caveat handwriting font */}
            </p>
          </div>
        </div>

        {/* --- DETAILS (back of the photo) --- */}
        <div className="border-2 border-ink bg-paper-light p-6 shadow-[6px_6px_0_var(--color-ink)]">
          {/* shadow-[6px_6px_0_var(--color-ink)] → hard shadow (retro look) */}

          <p className="label">On the back of this print</p>
          <h1 className="font-serif text-3xl leading-tight">
            {photo.eventName ?? getEventName(photo.eventId)}
            {/* Event ID → event naam ("Damru 2026") */}
          </h1>

          {/* Metadata list */}
          <dl className="mt-6 space-y-3 border-t border-dashed border-ink/40 pt-5 text-sm">
            {/* dl = definition list — dt (term) + dd (description) pairs */}

            <div className="flex justify-between gap-4">
              <dt className="text-muted">Taken by</dt>
              <dd className="text-right">{photo.uploaderName}</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted">Developed</dt>
              <dd>{formatDate(photo.uploadedAt)}</dd>
              {/* "15 Mar 2026" — readable format */}
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-muted">Roll</dt>
              <dd>{photo.year}</dd>
              {/* Year = "roll" in film camera terminology */}
            </div>
          </dl>

          {/* Hashtag stamps — click → gallery search */}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-dashed border-ink/40 pt-5">
            {photo.hashtags.map((tag, index) => (
              <Link
                key={tag}
                href={`/gallery?tag=${encodeURIComponent(tag)}`}
                // Click → gallery khulti hai us tag ke search ke saath
                className={`rubber-stamp ${inks[index % inks.length]} ${index % 2 ? "rotate-1" : "-rotate-1"} hover:rotate-0`}
                // ink colors cyclic: rust, teal, plum, ink
                // hover:rotate-0 → hover pe seedha ho jaata hai
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Report button */}
          <div className="mt-8">
            <ReportButton />
          </div>
        </div>
      </div>
    </div>
  );
}
