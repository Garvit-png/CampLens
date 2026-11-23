"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import PhotoCard from "@/components/features/gallery/PhotoCard";
import TagStamp from "@/components/ui/TagStamp";
import { cleanHashtag, filterPhotos, getPopularTags, sortNewestFirst } from "@/lib/utils/helpers";
import { useSession } from "@/lib/services/session";
import type { Photo } from "@/types";

const PER_PAGE = 12;

export default function GalleryView({ initialSearch }: { initialSearch: string }) {
  const { photos: collegePhotos, events: rawEvents, college, collegeId } = useSession();
  const collegeEvents = rawEvents as { id: string; collegeId: string; name: string; year: number }[];
  const router = useRouter();

  const [search, setSearch] = useState(initialSearch);
  const [year, setYear] = useState("all");
  const [eventId, setEventId] = useState("all");
  const [visible, setVisible] = useState(PER_PAGE);

  // No college selected → back to home
  useEffect(() => {
    if (!collegeId) router.replace("/");
  }, [collegeId, router]);

  const popularTags = getPopularTags(collegePhotos);
  const years = [...new Set(collegePhotos.map((p: Photo) => p.year))].sort((a: number, b: number) => b - a);
  const eventOptions = collegeEvents.filter((e: { year: number }) => year === "all" || e.year === Number(year));

  const filtered = sortNewestFirst(filterPhotos(collegePhotos, { search, year, eventId }));
  const shown = filtered.slice(0, visible);
  const searchedTag = cleanHashtag(search);
  const isSearching = searchedTag !== "";

  function updateSearch(val: string) { setSearch(val); setVisible(PER_PAGE); }
  function clearAll() { updateSearch(""); setYear("all"); setEventId("all"); }

  if (!collegeId) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="label">{college?.city} · Archive</p>
          <h1 className="font-serif text-4xl md:text-5xl">{college?.name}</h1>
        </div>
        <button onClick={() => { router.push("/") }}
          className="text-sm text-muted border border-dashed border-ink/30 px-3 py-1.5 rounded hover:border-rust hover:text-rust transition-colors">
          Change College ✕
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={e => e.preventDefault()} className="flex gap-3 max-w-2xl mb-6">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-serif text-xl text-rust">#</span>
          <input
            type="search"
            value={search}
            onChange={e => updateSearch(e.target.value)}
            placeholder="Search hashtag — try Damru26"
            className="field py-3 pl-8 w-full"
          />
        </div>
        <button type="submit" className="btn px-5">Search</button>
      </form>

      {/* Popular tags */}
      {popularTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {popularTags.slice(0, 8).map((item, i) => (
            <TagStamp key={item.tag} tag={item.tag} count={item.count} index={i}
              isActive={searchedTag.toLowerCase() === item.tag.toLowerCase()}
              onClick={() => updateSearch(searchedTag.toLowerCase() === item.tag.toLowerCase() ? "" : item.tag)}
            />
          ))}
        </div>
      )}

      {/* Filters + count */}
      <div className="flex flex-wrap items-center gap-3 border-y-2 border-ink py-3 mb-8">
        <span className="font-serif text-xl">
          {isSearching
            ? <>{filtered.length} prints · <span className="text-rust">#{searchedTag}</span></>
            : "Fresh from the darkroom"
          }
        </span>
        <div className="ml-auto flex gap-2">
          <select value={year} onChange={e => { setYear(e.target.value); setEventId("all"); setVisible(PER_PAGE); }}
            className="field py-1.5 text-sm">
            <option value="all">All years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={eventId} onChange={e => { setEventId(e.target.value); setVisible(PER_PAGE); }}
            className="field py-1.5 text-sm">
            <option value="all">All events</option>
            {eventOptions.map((e: { id: string; name: string }) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {/* Photos grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title={isSearching ? `No prints for #${searchedTag}` : "No photos yet"}
          message="Try different filters, or check back later."
        >
          <button onClick={clearAll} className="btn-ghost">Clear filters</button>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((photo, i) => <PhotoCard key={photo.id} photo={photo} index={i} />)}
          </div>

          {/* Load more */}
          {filtered.length > visible && (
            <div className="mt-14 text-center">
              <button onClick={() => setVisible(v => v + PER_PAGE)} className="btn-ghost">
                Load more prints ({filtered.length - visible} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
