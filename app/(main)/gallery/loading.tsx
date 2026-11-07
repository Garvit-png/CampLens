// Gallery khulte waqt (server se data aane tak) ye skeleton dikhta hai.
// Next.js ki special file: page ko automatically <Suspense> mein wrap karti hai.

import PhotoGridSkeleton from "@/components/PhotoGridSkeleton";

export default function GalleryLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16" role="status" aria-label="Loading photos">
      <div className="h-5 w-64 rounded-full bg-sky" />
      <div className="halftone mt-4 h-20 rounded-3xl border-[3px] border-ink/30 md:h-28" />
      <div className="mt-8 flex flex-wrap gap-3">
        {[90, 120, 80, 110, 96].map((w, i) => (
          <div key={i} className="h-9 rounded-lg bg-sky" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-16 border-b-2 border-ink/30 pb-5">
        <div className="h-9 w-72 rounded-full bg-sky" />
      </div>
      <div className="mt-10">
        <PhotoGridSkeleton />
      </div>
    </div>
  );
}
