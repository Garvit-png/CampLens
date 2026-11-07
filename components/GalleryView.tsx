// Gallery ka asli kaam:
//   - Upar bada search bar (hashtag dhoondo)
//   - Neeche trending hashtags (stickers) — click karo to search ho jaata hai
//   - Search khaali → naye uploads dikhte hain
//   - Search kiya → sirf us hashtag wali photos
//   - Year / event filter aur "Load more"
"use client";

import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import HashtagSticker from "@/components/HashtagSticker";
import { XIcon } from "@/components/Icons";
import PhotoCard from "@/components/PhotoCard";
import Spinner from "@/components/Spinner";
import { cleanHashtag, filterPhotos, getCollege, getEventsForCollege, getPopularTags, sortNewestFirst } from "@/lib/helpers";
import { useSession } from "@/lib/session";

const PHOTOS_PER_PAGE = 12;

export default function GalleryView({ initialSearch }: { initialSearch: string }) {
  const { collegeId, collegePhotos } = useSession();
  const college = getCollege(collegeId);

  const [search, setSearch] = useState(initialSearch);
  const [year, setYear] = useState("all");
  const [eventId, setEventId] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PHOTOS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Is college ke data se banaye gaye options
  const popularTags = getPopularTags(collegePhotos);
  const years = [...new Set(collegePhotos.map((p) => p.year))].sort((a, b) => b - a);
  const eventOptions = getEventsForCollege(collegeId ?? "").filter(
    (e) => year === "all" || e.year === Number(year)
  );

  // Filter lagao, phir naye pehle
  const matchingPhotos = sortNewestFirst(filterPhotos(collegePhotos, { search, year, eventId }));
  const photosToShow = matchingPhotos.slice(0, visibleCount);

  const searchedTag = cleanHashtag(search);
  const isSearching = searchedTag !== "";

  // Koi bhi filter badle to wapas pehle page se
  function updateSearch(value: string) {
    setSearch(value);
    setVisibleCount(PHOTOS_PER_PAGE);
  }

  // Sticker pe click: same tag dobara dabaya to search hata do
  function handleTagClick(tag: string) {
    updateSearch(searchedTag.toLowerCase() === tag.toLowerCase() ? "" : tag);
  }

  function clearAll() {
    updateSearch("");
    setYear("all");
    setEventId("all");
  }

  // "Load more": thoda ruk ke (baad mein yahan API call hogi) aur photos dikhao
  async function loadMore() {
    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setVisibleCount((count) => count + PHOTOS_PER_PAGE);
    setIsLoadingMore(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* ---------- Header + bada search ---------- */}
      <section>
        <p className="text-lg font-semibold text-ink-soft">
          {college?.name}, {collegePhotos.length} photos so far
        </p>

        {/* Search bar — har key press pe results update (live search) */}
        <form onSubmit={(e) => e.preventDefault()} role="search" className="relative mt-4">
          <label htmlFor="tag-search" className="sr-only">Search by hashtag</label>
          <div className="flex max-w-2xl items-center rounded-2xl border-2 border-ink bg-white pl-4 pr-2 shadow-[4px_4px_0_var(--color-pink)] transition-shadow focus-within:shadow-[5px_5px_0_var(--color-sun)]">
            <span className="font-display text-2xl text-pink md:text-3xl" aria-hidden="true">#</span>
            <input
              id="tag-search"
              type="text"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Damru26"
              autoComplete="off"
              className="h-14 w-full min-w-0 bg-transparent px-2 font-display text-xl outline-none placeholder:text-ink/25 md:h-16 md:text-2xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => updateSearch("")}
                aria-label="Clear search"
                className="grid h-9 w-9 shrink-0 animate-pop place-items-center rounded-full border-2 border-ink bg-sun transition hover:rotate-90"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Trending hashtags */}
        {popularTags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="mr-1 font-semibold text-ink-soft">Trending</span>
            {popularTags.map((item, index) => (
              <HashtagSticker
                key={item.tag}
                tag={item.tag}
                count={item.count}
                index={index}
                isActive={searchedTag.toLowerCase() === item.tag.toLowerCase()}
                onClick={() => handleTagClick(item.tag)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Section title + filters ---------- */}
      <section className="mt-16 flex flex-col justify-between gap-4 border-b-2 border-ink pb-5 md:flex-row md:items-end">
        <h1 className="font-display text-4xl leading-tight">
          {isSearching
            ? `${matchingPhotos.length} ${matchingPhotos.length === 1 ? "photo" : "photos"} tagged #${searchedTag}`
            : "Fresh off the press"}
        </h1>

        <div className="flex w-full gap-3 md:w-auto">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setEventId("all"); // naya year → purana event reset
              setVisibleCount(PHOTOS_PER_PAGE);
            }}
            aria-label="Filter by year"
            className="field h-11 min-w-0 flex-1 rounded-full md:w-auto md:flex-none"
          >
            <option value="all">Every year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setVisibleCount(PHOTOS_PER_PAGE);
            }}
            aria-label="Filter by event"
            className="field h-11 min-w-0 flex-1 rounded-full md:w-auto md:flex-none"
          >
            <option value="all">Every event</option>
            {eventOptions.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ---------- Photos (masonry) ---------- */}
      {matchingPhotos.length === 0 ? (
        <EmptyState
          title={isSearching ? `Nobody's tagged #${searchedTag} yet` : "This wall is empty"}
          message="Check the spelling, try a different year or event, or upload the first photo yourself."
        >
          <button type="button" onClick={clearAll} className="btn-ghost">Clear search and filters</button>
        </EmptyState>
      ) : (
        <div className="mt-10 columns-2 gap-6 md:columns-3 lg:columns-4">
          {photosToShow.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} />
          ))}
        </div>
      )}

      {matchingPhotos.length > visibleCount && (
        <div className="mt-10 text-center">
          <button type="button" onClick={loadMore} disabled={isLoadingMore} className="btn-ghost min-w-44">
            {isLoadingMore ? (
              <>
                <Spinner /> Loading
              </>
            ) : (
              "Show more photos"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
