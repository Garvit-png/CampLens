// ============================================================
// FILE: lib/helpers.ts
// ============================================================
// Yahan woh chhote utility functions hain jo kai alag alag
// pages aur components mein baar baar use hote hain.
//
// "DRY PRINCIPLE" — Don't Repeat Yourself.
// Ek function ek baar yahan likho, sab jagah import karo.
// Agar kuch change karna ho — sirf ek jagah change karo.
// ============================================================

import { colleges, events } from "@/lib/mockData";
// mockData se colleges aur events lists import kar rahe hain
// Yeh functions unhe use karte hain

import type { Photo } from "@/types";
// Photo type sirf type-checking ke liye chahiye
// "import type" — runtime pe koi code load nahi hoga, sirf TypeScript ke liye


// ----------------------------------------------------------
// UPLOAD RULES — ek jagah define karo, sab jagah use karo
// ----------------------------------------------------------
// Agar limit change karni ho (jaise 5MB → 10MB), sirf yahan change karo
// Upload page aur validation dono yahi values use karenge — sync rahega
// ----------------------------------------------------------
export const MAX_FILES_PER_UPLOAD = 10;
// Ek baar mein maximum 10 photos upload ho sakti hain

export const MAX_FILE_SIZE_MB = 5;
// Har file maximum 5MB ki honi chahiye

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Sirf yeh teen file types allowed hain
// "image/jpeg" → .jpg aur .jpeg files
// "image/png"  → .png files
// "image/webp" → .webp files (modern compressed format)
// PDF, video, Word files → blocked rahenge


// ----------------------------------------------------------
// getCollege(collegeId)
// ----------------------------------------------------------
// College ID se poora College object dhundhta hai.
//
// Kahan use hota hai: Login page, Onboarding, Gallery header
//
// Example:
//   getCollege("rishihood")
//   → { id: "rishihood", name: "Rishihood University", ... }
//
//   getCollege("xyz-nahi-hai")
//   → undefined (agar nahi mila)
// ----------------------------------------------------------
export function getCollege(collegeId: string | null) {
  return colleges.find((c) => c.id === collegeId);
  // .find() → array mein pehla matching element return karta hai
  // (c) => c.id === collegeId → har college check karo, ID match karo
  // null pass karo → undefined milega (safely handle hota hai)
}


// ----------------------------------------------------------
// getInitials(name)
// ----------------------------------------------------------
// College naam se 2-3 bade letters (initials) nikalta hai.
// Postage stamp pe bade initials dikhate hain — "RU", "NIT"
//
// Example:
//   getInitials("Rishihood University")     → "RU"
//   getInitials("Northfield Institute of Technology") → "NIT"
//   getInitials("St. Aurelia College")      → "SAC"
// ----------------------------------------------------------
export function getInitials(name: string): string {
  return name
    .split(" ")
    // "Rishihood University" → ["Rishihood", "University"]
    // .split(" ") → space se tod ke array banao

    .filter((word) => /^[A-Z]/.test(word))
    // sirf woh words rakho jo capital letter se shuru hon
    // /^[A-Z]/ → regex: string ka pehla character A-Z mein hai?
    // "of", "the", "and" → filter ho jayenge (lowercase se start)
    // "Rishihood", "University" → rakhenge

    .map((word) => word[0])
    // har word ka sirf pehla character lo
    // ["Rishihood", "University"] → ["R", "U"]

    .join("")
    // array ko ek string mein jodo (bina separator ke)
    // ["R", "U"] → "RU"

    .slice(0, 3);
    // maximum 3 characters rakho
    // "NSUT" → "NSU" (3 tak)
}


// ----------------------------------------------------------
// getEventsForCollege(collegeId)
// ----------------------------------------------------------
// Ek college ke saare events return karta hai.
// Upload page mein event dropdown ke liye use hota hai.
//
// Example:
//   getEventsForCollege("rishihood")
//   → [{ id: "damru-2026", name: "Damru 2026" }, ...]
// ----------------------------------------------------------
export function getEventsForCollege(collegeId: string) {
  return events.filter((e) => e.collegeId === collegeId);
  // .filter() → array mein se sirf matching elements rakho
  // Rishihood select kiya → sirf Rishihood ke events milenge
}


// ----------------------------------------------------------
// getEventName(eventId)
// ----------------------------------------------------------
// Event ID se event ka naam dhundhta hai.
// PhotoCard mein caption ke neeche event naam dikhane ke liye.
//
// Example:
//   getEventName("damru-2026") → "Damru 2026"
//   getEventName("xyz")        → "Unknown event" (agar nahi mila)
// ----------------------------------------------------------
export function getEventName(eventId: string): string {
  return events.find((e) => e.id === eventId)?.name ?? "Unknown event";
  // .find() → matching event dhundho
  // ?. (optional chaining) → agar event na mile to crash na karo
  // ?? "Unknown event" → agar undefined mile to fallback value use karo
}


// ----------------------------------------------------------
// formatDate(isoDate)
// ----------------------------------------------------------
// ISO date string ko readable format mein convert karta hai.
// Photo detail page mein "Developed: 15 Mar 2026" dikhane ke liye.
//
// Example:
//   formatDate("2026-03-15") → "15 Mar 2026"
//   formatDate("2025-10-01") → "1 Oct 2025"
// ----------------------------------------------------------
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    // new Date("2026-03-15") → Date object banao
    // .toLocaleDateString() → locale-specific string format
    // "en-IN" → English (India) format
    day: "numeric",    // 15 (number, no padding)
    month: "short",    // "Mar" (3 letter abbreviation)
    year: "numeric",   // 2026
  });
  // Output: "15 Mar 2026"
}


// ----------------------------------------------------------
// filmDate(isoDate)
// ----------------------------------------------------------
// Purane film camera style mein date dikhata hai.
// PhotoCard aur detail page pe "date stamp" look ke liye.
//
// Example:
//   filmDate("2026-03-15") → "'26 3 15"
//   filmDate("2025-10-01") → "'25 10 1"
// ----------------------------------------------------------
export function filmDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  // "2026-03-15".split("-") → ["2026", "03", "15"]
  // Destructuring: pehla → year, doosra → month, teesra → day

  return `'${year.slice(2)} ${Number(month)} ${day}`;
  // year.slice(2) → "2026" → "26" (last 2 digits)
  // Number(month) → "03" → 3 (leading zero hatao)
  // Template literal backticks: `...` → variables directly daal sakte hain
  // Result: "'26 3 15"
}


// ----------------------------------------------------------
// cleanHashtag(rawTag)
// ----------------------------------------------------------
// Search input se # sign aur extra spaces hatata hai.
// Gallery search bar mein user "#Damru26" ya "Damru26" kuch bhi likhe —
// hum clean version se compare karenge.
//
// Example:
//   cleanHashtag("#Damru26 ")  → "Damru26"
//   cleanHashtag("  #Night")   → "Night"
//   cleanHashtag("Khatam")     → "Khatam" (# nahi tha, koi problem nahi)
// ----------------------------------------------------------
export function cleanHashtag(rawTag: string): string {
  return rawTag.trim().replace(/^#+/, "");
  // .trim() → shuru aur end ke spaces hatao
  //   "  #Damru26 " → "#Damru26"
  // .replace(/^#+/, "") → shuru ke ek ya zyada # signs hatao
  //   /^#+/ → regex: ^ = string start, # = hash, + = ek ya zyada
  //   "#Damru26" → "Damru26"
  //   "##test"   → "test" (multiple # bhi handle)
}


// ----------------------------------------------------------
// parseHashtags(text)
// ----------------------------------------------------------
// Caption ya input se saare hashtags nikaalta hai — clean list mein.
// Upload page mein hashtag input field yeh use karta hai.
//
// Example:
//   parseHashtags("#Damru26 #Night Music")  → ["Damru26", "Night", "Music"]
//   parseHashtags("#IITD, #Fest2026")       → ["IITD", "Fest2026"]
//   parseHashtags("")                        → []
// ----------------------------------------------------------
export function parseHashtags(text: string): string[] {
  const tags: string[] = [];
  // Khaali array se start karo jisme results jayenge

  for (const piece of text.split(/[\s,]+/)) {
    // text ko spaces aur commas pe split karo
    // /[\s,]+/ → regex: [\s,] = space ya comma, + = ek ya zyada
    // "#Damru26 #Night, Music" → ["#Damru26", "#Night", "Music"]

    const tag = cleanHashtag(piece);
    // Har piece ko clean karo: "#Damru26" → "Damru26"

    if (tag !== "" && !tags.includes(tag)) {
      tags.push(tag);
      // Sirf tab add karo:
      // 1. tag khaali nahi hai (empty string check)
      // 2. Already array mein nahi hai (duplicate prevent)
    }
  }
  return tags;
  // Clean hashtags ki list return karo
}


// ----------------------------------------------------------
// sortNewestFirst(photos)
// ----------------------------------------------------------
// Photos ko newest first order mein sort karta hai.
// Gallery mein sabse nayi photos upar dikhti hain.
//
// IMPORTANT: Original array ko change NAHI karta.
// [...photos] se pehle copy banata hai, phir sort karta hai.
//
// Example:
//   Photos: ["2026-03-15", "2024-01-01", "2025-06-10"]
//   After:  ["2026-03-15", "2025-06-10", "2024-01-01"]
// ----------------------------------------------------------
export function sortNewestFirst(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  // [...photos] → spread operator se array ki copy banao
  //   Original array badalne se bugs ho sakte hain isliye copy zaroori
  // .sort() → in-place sort — comparator function leta hai
  // b.uploadedAt.localeCompare(a.uploadedAt)
  //   → b pehle, a baad (descending/newest first)
  //   → Agar a aur b swap karo → ascending (oldest first) hoga
  // "2026-03-15" vs "2024-01-01"
  //   "2026-03-15".localeCompare("2024-01-01") → positive (b > a → b pehle)
}


// ----------------------------------------------------------
// getPopularTags(photos, limit)
// ----------------------------------------------------------
// Sabse zyada use hone wale hashtags count ke saath return karta hai.
// Gallery page pe "Popular stamps on campus" section ke liye.
//
// Example:
//   getPopularTags(photos, 5)
//   → [
//       { tag: "Damru26", count: 4 },
//       { tag: "Night",   count: 3 },
//       { tag: "Friends", count: 2 },
//       ...
//     ]
//
// "damru26" aur "Damru26" ek hi maana jaayenge (case-insensitive)
// ----------------------------------------------------------
export function getPopularTags(photos: Photo[], limit = 10) {
  // limit = 10 → default value, agar caller specify na kare to 10 return karo

  const counts = new Map<string, { tag: string; count: number }>();
  // Map = key-value pairs store karne ka data structure
  // Key: lowercase tag "damru26" → Value: { tag: "Damru26", count: 4 }
  // Map isliye kyunki object se fast lookup hota hai

  for (const photo of photos) {
    // Har photo ke liye loop
    for (const tag of photo.hashtags) {
      // Us photo ke har hashtag ke liye loop
      const key = tag.toLowerCase();
      // "Damru26" → "damru26" — case insensitive comparison ke liye

      const existing = counts.get(key);
      // Map mein check karo: kya yeh tag pehle se hai?

      if (existing) {
        existing.count += 1;
        // Pehle se hai → count badhao
      } else {
        counts.set(key, { tag, count: 1 });
        // Naya tag → Map mein add karo, count = 1
      }
    }
  }

  return [...counts.values()]
    // Map ki values ko array mein convert karo
    .sort((a, b) => b.count - a.count)
    // Count ke hisaab se sort karo — zyada count wala pehle
    .slice(0, limit);
    // Sirf top `limit` tags return karo (default 10)
}


// ----------------------------------------------------------
// PhotoFilters INTERFACE
// ----------------------------------------------------------
// Gallery mein teen filters hain — yeh interface unki shape define karta hai.
// filterPhotos() function yeh interface leta hai.
// ----------------------------------------------------------
export interface PhotoFilters {
  search: string;
  // Hashtag search text, jaise "Damru26" ya ""
  // "" (khaali) = koi search nahi — sab photos dikhao

  year: string;
  // "all" = sab saal, ya specific saal "2026"
  // string type isliye kyunki <select> element string return karta hai

  eventId: string;
  // "all" = sab events, ya specific event ID "damru-2026"
}


// ----------------------------------------------------------
// filterPhotos(photos, filters)
// ----------------------------------------------------------
// Teen filters ek saath lagate hain — year, event, aur hashtag search.
// Photo tabhi dikhegi jab TEENO filters pass ho.
//
// Gallery mein har filter change pe yeh function dobara chalti hai.
//
// Example:
//   filters = { year: "2026", eventId: "damru-2026", search: "Night" }
//   → sirf woh photos jo 2026 ki hain, Damru event ki hain,
//     aur "Night" hashtag wali hain
//
// Search "starts with" style hai:
//   search = "dam" → "Damru26" aur "Damru24" dono match honge
// ----------------------------------------------------------
export function filterPhotos(photos: Photo[], filters: PhotoFilters): Photo[] {
  const search = cleanHashtag(filters.search).toLowerCase();
  // Search text ko clean karo: "#Damru" → "damru" (lowercase for comparison)

  return photos.filter((photo) => {
    // .filter() → sirf woh photos rakho jinke liye function true return kare

    // --- YEAR FILTER ---
    if (filters.year !== "all" && photo.year !== Number(filters.year)) {
      return false;
      // "all" nahi hai AND photo ka year match nahi karta → yeh photo mat dikhao
      // Number(filters.year): "2026" string → 2026 number (comparison ke liye)
    }

    // --- EVENT FILTER ---
    if (filters.eventId !== "all" && photo.eventId !== filters.eventId) {
      return false;
      // "all" nahi hai AND photo ka eventId match nahi karta → mat dikhao
    }

    // --- SEARCH FILTER ---
    if (search !== "") {
      // Sirf tab check karo jab search khaali na ho
      const hasTag = photo.hashtags.some((tag) =>
        tag.toLowerCase().startsWith(search)
      );
      // .some() → koi ek bhi match kare to true
      // .startsWith() → "dam" likhne pe "Damru26" aur "Damru24" match honge
      // "Khatam".startsWith("dam") → false
      // "Damru26".startsWith("dam") → true

      if (!hasTag) return false;
      // Koi bhi tag match nahi kiya → photo mat dikhao
    }

    return true;
    // Teeno filters pass ho gaye → yeh photo dikhao
  });
}
