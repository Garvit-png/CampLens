// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// lib/utils.ts — SHARED (browser + server dono)
// Pure functions — koi DB nahi, koi React nahi
// Koi bhi import kar sakta hai
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import type { Photo } from "@/types"

export const MAX_FILE_SIZE_MB = 10
export const ALLOWED_TYPES    = ["image/jpeg", "image/png", "image/webp"]

// "2026-03-15" → "15 Mar 2026"
export function formatDate(d: string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

// "2026-03-15" → "'26 3 15" (film camera style)
export function filmDate(d: string) {
  if (!d) return ""
  const [y, m, day] = d.split("-")
  return `'${y?.slice(2)} ${Number(m)} ${day}`
}

// "Rishihood University" → "RU"
export function getInitials(name: string) {
  return name.split(" ").filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join("").slice(0, 3)
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

// Caption se hashtags extract karo — "best night #Damru26" → ["Damru26"]
export function extractTags(caption: string) {
  const matches = caption.match(/#(\w+)/g)
  if (!matches) return []
  return [...new Set(matches.map(t => t.slice(1)))]
}

// Photos newest pehle
export function newestFirst(photos: Photo[]) {
  return [...photos].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
}

// Most used hashtags
export function popularTags(photos: Photo[], limit = 10) {
  const map = new Map<string, { tag: string; count: number }>()
  for (const p of photos)
    for (const tag of p.hashtags) {
      const k = tag.toLowerCase()
      const ex = map.get(k)
      if (ex) ex.count++
      else map.set(k, { tag, count: 1 })
    }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit)
}

// Gallery filters: year + event + hashtag search
export function filterPhotos(photos: Photo[], year: string, eventId: string, search: string) {
  const q = cleanTag(search).toLowerCase()
  return photos.filter(p => {
    if (year !== "all" && p.year !== Number(year)) return false
    if (eventId !== "all" && p.eventId !== eventId) return false
    if (q && !p.hashtags.some(t => t.toLowerCase().startsWith(q))) return false
    return true
  })
}
