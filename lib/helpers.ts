// ─────────────────────────────────────────────
// helpers.ts — Chhote useful functions
// ─────────────────────────────────────────────
// Yeh file sirf pure utility functions rakhti hai.
// Koi database nahi, koi React nahi — bas simple JS.
// ─────────────────────────────────────────────

import type { Photo } from "@/types"

// Max file size for admin uploads
export const MAX_FILE_SIZE_MB = 10

// Allowed image types
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

// "Rishihood University" → "RU"
export function getInitials(name: string) {
  return name.split(" ").filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join("").slice(0, 3)
}

// "2026-03-15" → "15 Mar 2026"
export function formatDate(d: string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

// "2026-03-15" → "'26 3 15" (film camera look)
export function filmDate(d: string) {
  if (!d) return ""
  const [y, m, day] = d.split("-")
  return `'${y?.slice(2)} ${Number(m)} ${day}`
}

// "#Damru26 " → "Damru26"
export function cleanTag(raw: string) {
  return raw.trim().replace(/^#+/, "")
}

// "#Damru26 #Night" → ["Damru26", "Night"]
export function parseTags(text: string) {
  const tags: string[] = []
  for (const piece of text.split(/[\s,]+/)) {
    const t = cleanTag(piece)
    if (t && !tags.includes(t)) tags.push(t)
  }
  return tags
}

// Extract hashtags from caption text
export function extractTags(caption: string) {
  const matches = caption.match(/#(\w+)/g)
  if (!matches) return []
  return [...new Set(matches.map(t => t.slice(1)))]
}

// Sort photos: newest first
export function newestFirst(photos: Photo[]) {
  return [...photos].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
}

// Most-used hashtags across photos
export function popularTags(photos: Photo[], limit = 10) {
  const map = new Map<string, { tag: string; count: number }>()
  for (const p of photos) {
    for (const tag of p.hashtags) {
      const k = tag.toLowerCase()
      const ex = map.get(k)
      if (ex) ex.count++
      else map.set(k, { tag, count: 1 })
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit)
}

// Filter photos by year + event + hashtag search
export function filterPhotos(photos: Photo[], year: string, eventId: string, search: string) {
  const q = cleanTag(search).toLowerCase()
  return photos.filter(p => {
    if (year !== "all" && p.year !== Number(year)) return false
    if (eventId !== "all" && p.eventId !== eventId) return false
    if (q && !p.hashtags.some(t => t.toLowerCase().startsWith(q))) return false
    return true
  })
}
