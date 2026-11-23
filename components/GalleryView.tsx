"use client"
// ─────────────────────────────────────────────
// GalleryView — Gallery ka poora UI
// ─────────────────────────────────────────────
// - Search bar (hashtag)
// - Popular tag stamps
// - Year + Event filter dropdowns
// - Photos grid (polaroid cards)
// - Load more button
// ─────────────────────────────────────────────

import { useState } from "react"
import { useRouter } from "next/navigation"
import PhotoCard from "@/components/PhotoCard"
import TagStamp from "@/components/TagStamp"
import EmptyState from "@/components/EmptyState"
import { cleanTag, filterPhotos, popularTags as getPopular, newestFirst } from "@/lib/helpers"
import { useSession } from "@/lib/session"
import type { Photo } from "@/types"

const PER_PAGE = 12

export default function GalleryView({ initialSearch }: { initialSearch: string }) {
  const { photos, events, college, collegeId } = useSession()
  const router = useRouter()

  const [search, setSearch] = useState(initialSearch)
  const [year, setYear]     = useState("all")
  const [eventId, setEventId] = useState("all")
  const [visible, setVisible] = useState(PER_PAGE)

  // No college → go home
  if (!collegeId) { router.replace("/"); return null }

  const tags    = getPopular(photos)
  const years   = [...new Set(photos.map(p => p.year))].sort((a, b) => b - a)
  const evtOpts = events.filter(e => year === "all" || e.year === Number(year))
  const filtered = newestFirst(filterPhotos(photos, year, eventId, search))
  const shown    = filtered.slice(0, visible)
  const q        = cleanTag(search)

  function doSearch(val: string) { setSearch(val); setVisible(PER_PAGE) }
  function clearAll() { doSearch(""); setYear("all"); setEventId("all") }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">{college?.city} · Archive</p>
          <h1 className="font-serif text-4xl md:text-5xl">{college?.name}</h1>
        </div>
        <button onClick={() => { router.push("/") }}
          className="text-sm text-muted border border-dashed border-ink/30 px-3 py-1.5 rounded hover:border-rust hover:text-rust transition-colors">
          Change College ✕
        </button>
      </div>

      {/* Search */}
      <form onSubmit={e => e.preventDefault()} className="flex gap-3 max-w-2xl mb-6">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-serif text-xl text-rust">#</span>
          <input type="search" value={search} onChange={e => doSearch(e.target.value)}
            placeholder="Search hashtag — try Damru26" className="field py-3 pl-8 w-full" />
        </div>
        <button type="submit" className="btn px-5">Search</button>
      </form>

      {/* Popular tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.slice(0, 8).map((item, i) => (
            <TagStamp key={item.tag} tag={item.tag} count={item.count} index={i}
              isActive={q.toLowerCase() === item.tag.toLowerCase()}
              onClick={() => doSearch(q.toLowerCase() === item.tag.toLowerCase() ? "" : item.tag)}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-y-2 border-ink py-3 mb-8">
        <span className="font-serif text-xl">
          {q ? <>{filtered.length} prints · <span className="text-rust">#{q}</span></> : "Fresh from the darkroom"}
        </span>
        <div className="ml-auto flex gap-2">
          <select value={year} onChange={e => { setYear(e.target.value); setEventId("all"); setVisible(PER_PAGE) }}
            className="field py-1.5 text-sm">
            <option value="all">All years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={eventId} onChange={e => { setEventId(e.target.value); setVisible(PER_PAGE) }}
            className="field py-1.5 text-sm">
            <option value="all">All events</option>
            {evtOpts.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState title={q ? `No prints for #${q}` : "No photos yet"} message="Try different filters.">
          <button onClick={clearAll} className="btn-ghost">Clear filters</button>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((photo, i) => <PhotoCard key={photo.id} photo={photo} index={i} />)}
          </div>
          {filtered.length > visible && (
            <div className="mt-14 text-center">
              <button onClick={() => setVisible(v => v + PER_PAGE)} className="btn-ghost">
                Load more ({filtered.length - visible} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
