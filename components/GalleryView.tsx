// ============================================================
// FILE: components/GalleryView.tsx — GALLERY KA POORA UI
// ============================================================
// Yeh component Gallery page ka ASLI kaam karta hai:
//   - Upar search bar (hashtag search)
//   - Popular hashtags (stamp style) — click karo to search
//   - Year aur Event filters (dropdowns)
//   - Photos ki grid (polaroid cards)
//   - "Load more" button (pagination)
//   - Empty state (jab koi photo nahi mili)
// ============================================================

"use client";

import { useState } from "react";

import EmptyState from "@/components/EmptyState";
import PhotoCard from "@/components/PhotoCard";
import Postmark from "@/components/Postmark";
import TagStamp from "@/components/TagStamp";

import {
  cleanHashtag,
  // "#Damru26 " → "Damru26" (clean for comparison)

  filterPhotos,
  // Teen filters ek saath: year, event, search
  // College ID → College object (naam + city ke liye)
  // College ke events list (event filter dropdown ke liye)

  getPopularTags,
  // Sabse zyada use hone wale hashtags (popular stamps section)

  sortNewestFirst,
  // Photos ko newest pehle sort karo
} from "@/lib/helpers";

import { useSession } from "@/lib/session";
// Session se collegeId aur collegePhotos


const PHOTOS_PER_PAGE = 12;
// Ek page pe kitni photos dikhengi — "Load more" click pe 12 aur add hongi


export default function GalleryView({ initialSearch }: { initialSearch: string }) {
  // initialSearch → URL se aaya tag (jaise "?tag=Damru26")
  // Gallery page se yeh prop aata hai

  const { collegePhotos, collegeEvents, college } = useSession();
  // college       → DB se college (name, city)
  // collegeEvents → DB se is college ke events (filter dropdown)
  // collegePhotos → sirf is college ki photos (session se filtered)

  
  // College object — naam aur city ke liye

  const [search, setSearch] = useState(initialSearch);
  // Search text — URL se initialize hota hai

  const [year, setYear] = useState("all");
  // Year filter: "all" = sab saal, "2026" = sirf 2026

  const [eventId, setEventId] = useState("all");
  // Event filter: "all" = sab events, "damru-2026" = sirf Damru

  const [visibleCount, setVisibleCount] = useState(PHOTOS_PER_PAGE);
  // Kitni photos dikh rahi hain — "Load more" se badhta hai


  // ----------------------------------------------------------
  // DERIVED VALUES (har render pe calculate hote hain)
  // ----------------------------------------------------------

  const popularTags = getPopularTags(collegePhotos);
  // Sabse zyada use wale hashtags — "Popular stamps" section ke liye

  const years = [...new Set(collegePhotos.map((p) => p.year))].sort((a, b) => b - a);
  // Unique years nikaalo:
  //   collegePhotos.map(p => p.year) → [2026, 2026, 2025, 2024, ...]
  //   new Set(...) → unique values: [2026, 2025, 2024]
  //   [...new Set()] → Set ko wapas array mein convert karo
  //   .sort((a,b) => b-a) → descending (newest year pehle)

  const eventOptions = collegeEvents.filter(
    (e) => year === "all" || e.year === Number(year)
  );
  // Events list filter karo:
  // Agar year "all" hai → sab events dikhao
  // Agar year "2026" hai → sirf 2026 ke events dikhao
  // Taaki event filter mein sirf relevant events aayein

  // FILTERED + SORTED PHOTOS
  const matchingPhotos = sortNewestFirst(
    filterPhotos(collegePhotos, { search, year, eventId })
  );
  // 1. filterPhotos → teen filters lagao (year, event, search)
  // 2. sortNewestFirst → naye photos pehle

  const photosToShow = matchingPhotos.slice(0, visibleCount);
  // Sirf utni photos dikhao jitni visibleCount hai
  // "Load more" → visibleCount += 12 → 12 aur photos dikhegi

  const searchedTag = cleanHashtag(search);
  // Search text ko clean karo: "#Damru26 " → "Damru26"
  // Isse header mein "#Damru26" sahi dikh sakta hai

  const isSearching = searchedTag !== "";
  // Kya user ne search ki hai? (empty search = nahi)


  // ----------------------------------------------------------
  // HANDLER FUNCTIONS
  // ----------------------------------------------------------

  function updateSearch(value: string) {
    setSearch(value);
    setVisibleCount(PHOTOS_PER_PAGE);
    // Naya search → "Load more" reset karo (pehle 12 photos se start)
  }

  function handleTagClick(tag: string) {
    // Same tag dobara click → search hata do (toggle behavior)
    if (searchedTag.toLowerCase() === tag.toLowerCase()) {
      updateSearch("");
    } else {
      updateSearch(tag);
    }
  }

  function clearAll() {
    // Sab filters clear karo
    updateSearch("");
    setYear("all");
    setEventId("all");
  }


  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">

      {/* ===== HEADER + SEARCH ===== */}
      <section className="relative">
        <p className="label">The archive · {college?.city}</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] md:text-6xl">
          {college?.name}
        </h1>

        {/* Decorative postmark (top right) */}
        <Postmark
          label={`${(college?.city ?? "").toUpperCase()} • CAMPUSLENS • ARCHIVE •`}
          center={`'${String(new Date().getFullYear()).slice(2)}`}
          className="absolute -top-2 right-0 hidden w-32 -rotate-12 text-teal/60 md:block"
        />

        {/* Search bar — har key press pe results update (live search) */}
        <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex max-w-2xl gap-3">
          {/* onSubmit prevent → form submit pe page reload na ho */}

          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-serif text-2xl text-rust">
              #
              {/* Decorative # symbol inside search input */}
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Search a hashtag — try Damru26"
              aria-label="Search by hashtag"
              className="field py-3.5 pl-10 text-base"
              // pl-10 → padding-left 40px (# symbol ke liye space)
            />
          </div>
          <button type="submit" className="btn">Search</button>
        </form>

        {/* Popular hashtags — stamp style */}
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
                  // Active tag → highlighted dikhao
                  onClick={() => handleTagClick(item.tag)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ===== SECTION TITLE + FILTERS ===== */}
      <section className="mt-14 flex flex-col justify-between gap-4 border-y-2 border-ink py-4 md:flex-row md:items-center">
        <h2 className="font-serif text-3xl">
          {isSearching ? (
            <>
              {matchingPhotos.length} {matchingPhotos.length === 1 ? "print" : "prints"} stamped{" "}
              <span className="text-rust">#{searchedTag}</span>
              {/* "5 prints stamped #Damru26" */}
            </>
          ) : (
            "Fresh from the darkroom"
          )}
        </h2>

        {/* Filter dropdowns */}
        <div className="flex w-full gap-3 md:w-auto">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setEventId("all");
              // Naya year select → purana event reset (events us year ke hisaab se change honge)
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

      {/* ===== PHOTOS GRID ===== */}
      {matchingPhotos.length === 0 ? (
        <EmptyState
          title={isSearching ? `No prints for #${searchedTag}` : "No photos here yet"}
          message="Try another stamp, change the filters — or be the first to upload one."
        >
          <button type="button" onClick={clearAll} className="btn-ghost">
            Clear search
          </button>
        </EmptyState>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {/* grid-cols-2 → mobile: 2 columns */}
          {/* md:grid-cols-3 → tablet: 3 columns */}
          {/* lg:grid-cols-4 → desktop: 4 columns */}
          {/* gap-y-12 → rows ke beech zyada space (polaroids need room) */}

          {photosToShow.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} />
          ))}
        </div>
      )}

      {/* ===== LOAD MORE BUTTON ===== */}
      {matchingPhotos.length > visibleCount && (
        // Agar total photos > visible photos → "Load more" dikhao
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount(visibleCount + PHOTOS_PER_PAGE)}
            // Click → 12 aur photos add karo
            className="btn-ghost"
          >
            Load more prints
          </button>
        </div>
      )}
    </div>
  );
}
