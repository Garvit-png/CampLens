// Gallery ka asli kaam:
//   - Upar search bar (hashtag dhoondo)
//   - Neeche popular hashtags (stamps) — click karo to search ho jaata hai
//   - Search khaali → naye uploads dikhte hain
//   - Search kiya → sirf us hashtag wali photos
//   - Year / event filter aur "Load more"
"use client";

import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import PhotoCard from "@/components/PhotoCard";
import Postmark from "@/components/Postmark";
import TagStamp from "@/components/TagStamp";
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

  // Tag stamp pe click: same tag dobara dabaya to search hata do
  function handleTagClick(tag: string) {
    updateSearch(searchedTag.toLowerCase() === tag.toLowerCase() ? "" : tag);
  }

  function clearAll() {
    updateSearch("");
    setYear("all");
    setEventId("all");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* ---------- Header + search ---------- */}
      <section className="relative">
        <p className="label">The archive · {college?.city}</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] md:text-6xl">{college?.name}</h1>

        <Postmark
          label={`${college?.city.toUpperCase()} • CAMPUSLENS • ARCHIVE •`}
          center={`'${String(new Date().getFullYear()).slice(2)}`}
          className="absolute -top-2 right-0 hidden w-32 -rotate-12 text-teal/60 md:block"
        />

        {/* Search bar — har key press pe results update (live search) */}
        <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex max-w-2xl gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-serif text-2xl text-rust">#</span>
            <input
              type="search"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Search a hashtag — try Damru26"
              aria-label="Search by hashtag"
              className="field py-3.5 pl-10 text-base"
            />
          </div>
          <button type="submit" className="btn">Search</button>
        </form>

        {/* Popular hashtags */}
        {popularTags.length > 0 && (
          <div className="mt-7">
            <p className="label">Popular stamps on campus</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {popularTags.map((item, index) => (
                <TagStamp
                  key={item.tag}
                  tag={item.tag}
                  count={item.count}
                  index={index}
                  isActive={searchedTag.toLowerCase() === item.tag.toLowerCase()}
                  onClick={() => handleTagClick(item.tag)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------- Section title + filters ---------- */}
      <section className="mt-14 flex flex-col justify-between gap-4 border-y-2 border-ink py-4 md:flex-row md:items-center">
        <h2 className="font-serif text-3xl">
          {isSearching ? (
            <>
              {matchingPhotos.length} {matchingPhotos.length === 1 ? "print" : "prints"} stamped{" "}
              <span className="text-rust">#{searchedTag}</span>
            </>
          ) : (
            "Fresh from the darkroom"
          )}
        </h2>

        <div className="flex w-full gap-3 md:w-auto">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setEventId("all"); // naya year → purana event reset
              setVisibleCount(PHOTOS_PER_PAGE);
            }}
            aria-label="Filter by year"
            className="field min-w-0 flex-1 py-2 md:w-auto md:flex-none"
          >
            <option value="all">All years</option>
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
            className="field min-w-0 flex-1 py-2 md:w-auto md:flex-none"
          >
            <option value="all">All events</option>
            {eventOptions.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ---------- Photos ---------- */}
      {matchingPhotos.length === 0 ? (
        <EmptyState
          title={isSearching ? `No prints for #${searchedTag}` : "No photos here yet"}
          message="Try another stamp, change the filters — or be the first to upload one."
        >
          <button type="button" onClick={clearAll} className="btn-ghost">Clear search</button>
        </EmptyState>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {photosToShow.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} />
          ))}
        </div>
      )}

      {matchingPhotos.length > visibleCount && (
        <div className="mt-16 text-center">
          <button type="button" onClick={() => setVisibleCount(visibleCount + PHOTOS_PER_PAGE)} className="btn-ghost">
            Load more prints
          </button>
        </div>
      )}
    </div>
  );
}
