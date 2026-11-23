import type { Photo } from "@/types";

// Upload rules
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// College naam se initials — "Rishihood University" → "RU"
export function getInitials(name: string): string {
  return name.split(" ").filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join("").slice(0, 3);
}

// "2026-03-15" → "15 Mar 2026"
export function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// "2026-03-15" → "'26 3 15" (film camera style)
export function filmDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `'${year?.slice(2)} ${Number(month)} ${day}`;
}

// "#Damru26 " → "Damru26"
export function cleanHashtag(rawTag: string): string {
  return rawTag.trim().replace(/^#+/, "");
}

// "#Damru26 #Night" → ["Damru26", "Night"]
export function parseHashtags(text: string): string[] {
  const tags: string[] = [];
  for (const piece of text.split(/[\s,]+/)) {
    const tag = cleanHashtag(piece);
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

// Newest photos first
export function sortNewestFirst(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

// Popular hashtags with count
export function getPopularTags(photos: Photo[], limit = 10) {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const photo of photos) {
    for (const tag of photo.hashtags) {
      const key = tag.toLowerCase();
      const ex = counts.get(key);
      if (ex) ex.count++;
      else counts.set(key, { tag, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export interface PhotoFilters {
  search: string;
  year: string;
  eventId: string;
}

// Apply all 3 filters at once
export function filterPhotos(photos: Photo[], filters: PhotoFilters): Photo[] {
  const search = cleanHashtag(filters.search).toLowerCase();
  return photos.filter(photo => {
    if (filters.year !== "all" && photo.year !== Number(filters.year)) return false;
    if (filters.eventId !== "all" && photo.eventId !== filters.eventId) return false;
    if (search !== "") {
      const hasTag = photo.hashtags.some(tag => tag.toLowerCase().startsWith(search));
      if (!hasTag) return false;
    }
    return true;
  });
}
