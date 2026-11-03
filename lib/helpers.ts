// Chhote functions jo kai pages mein use hote hain.

import { colleges, events } from "@/lib/mockData";
import type { Photo } from "@/types";

// Upload rules — ek jagah rakhe hain taaki badalna easy ho
export const MAX_FILES_PER_UPLOAD = 10;
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function getCollege(collegeId: string | null) {
  return colleges.find((c) => c.id === collegeId);
}

// "Rishihood University" → "RU" (postage stamp pe bade letters)
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((word) => /^[A-Z]/.test(word)) // sirf capital letter se shuru hone wale words
    .map((word) => word[0])
    .join("")
    .slice(0, 3);
}

export function getEventsForCollege(collegeId: string) {
  return events.filter((e) => e.collegeId === collegeId);
}

export function getEventName(eventId: string): string {
  return events.find((e) => e.id === eventId)?.name ?? "Unknown event";
}

// "2026-03-15" → "15 Mar 2026"
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// "2026-03-15" → "'26 3 15"  (purane film camera wali date)
export function filmDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `'${year.slice(2)} ${Number(month)} ${day}`;
}

// "  #Damru26 " → "Damru26"
export function cleanHashtag(rawTag: string): string {
  return rawTag.trim().replace(/^#+/, "");
}

// "#Damru26, #Night Music" → ["Damru26", "Night", "Music"]  (duplicate aur khaali hata deta hai)
export function parseHashtags(text: string): string[] {
  const tags: string[] = [];
  for (const piece of text.split(/[\s,]+/)) {
    const tag = cleanHashtag(piece);
    if (tag !== "" && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  return tags;
}

// Naye photos pehle. (sort original list ko badal deta hai, isliye pehle copy [...photos] banate hain)
export function sortNewestFirst(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

/**
 * Sabse zyada use hone wale hashtags, count ke saath.
 * Example: [{ tag: "Damru26", count: 4 }, { tag: "Khatam", count: 3 }, ...]
 * "damru26" aur "Damru26" ko ek hi maana jaata hai (lowercase se compare).
 */
export function getPopularTags(photos: Photo[], limit = 10) {
  const counts = new Map<string, { tag: string; count: number }>();

  for (const photo of photos) {
    for (const tag of photo.hashtags) {
      const key = tag.toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { tag, count: 1 });
      }
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export interface PhotoFilters {
  search: string; // hashtag search, "" = koi search nahi
  year: string; // "all" ya "2026"
  eventId: string; // "all" ya event id
}

// Teeno filters ek saath lagte hain. Photo tabhi dikhegi jab teeno pass ho.
// Search "starts with" hai: "#dam" likhne pe Damru26 aur Damru24 dono milenge.
export function filterPhotos(photos: Photo[], filters: PhotoFilters): Photo[] {
  const search = cleanHashtag(filters.search).toLowerCase();

  return photos.filter((photo) => {
    if (filters.year !== "all" && photo.year !== Number(filters.year)) return false;
    if (filters.eventId !== "all" && photo.eventId !== filters.eventId) return false;
    if (search !== "") {
      const hasTag = photo.hashtags.some((tag) => tag.toLowerCase().startsWith(search));
      if (!hasTag) return false;
    }
    return true;
  });
}
