// ============================================================
// FILE: lib/formatDate.ts — DATE FORMATTING (JAPINDER KA KAAM)
// ============================================================
// ISO date strings ko readable formats mein convert karta hai.
// Gallery, Photo Card, aur Photo Detail page pe use hota hai.
//
// TEEN FUNCTIONS:
//   1. formatDate()   → "2026-03-15" → "15 Mar 2026"
//   2. timeAgo()      → "2026-03-15" → "8 months ago"
//   3. formatMonth() → "2026-03-15" → "March 2026"
// ============================================================


// ----------------------------------------------------------
// FUNCTION 1: formatDate
// ----------------------------------------------------------
// ISO date ko readable format mein convert karta hai.
//
// Input:  "2026-03-15" (ISO format: YYYY-MM-DD)
// Output: "15 Mar 2026"
//
// Kahan use hota hai: Photo Detail page ("Developed: 15 Mar 2026")
// ----------------------------------------------------------
export function formatDate(isoDate: string): string {
    // new Date("2026-03-15") → Date object banao
    // .toLocaleDateString() → locale-specific readable format
    return new Date(isoDate).toLocaleDateString("en-IN", {
        // "en-IN" → English (India) format
        day: "numeric",    // 15 (number, no leading zero)
        month: "short",     // "Mar" (3-letter abbreviation)
        year: "numeric",    // 2026
    });
    // Result: "15 Mar 2026"
}


// ----------------------------------------------------------
// FUNCTION 2: timeAgo
// ----------------------------------------------------------
// Kitna time pehle upload hui — relative time dikhata hai.
//
// Input:  "2026-03-15"
// Output: "8 months ago" ya "3 days ago" ya "just now"
//
// Kahan use hota hai: Photo Card pe (jab naye uploads dikh rahe hain)
// ----------------------------------------------------------
export function timeAgo(isoDate: string): string {
    const date = new Date(isoDate);
    // Date object banao

    const now = new Date();
    // Current date/time

    const diffMs = now.getTime() - date.getTime();
    // .getTime() → milliseconds since Jan 1, 1970
    // diffMs = difference in milliseconds (positive = past)

    const seconds = Math.floor(diffMs / 1000);
    // Milliseconds → seconds
    // Math.floor → decimal hatao (round down)

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // --- Decide output based on time difference ---
    if (seconds < 60) return "just now";
    // Less than 1 minute → "just now"

    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    // 1-59 minutes → "5 minutes ago" (plural "s" if > 1)

    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    // 1-23 hours → "3 hours ago"

    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    // 1-29 days → "2 days ago"

    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    // 1-11 months → "8 months ago"

    return `${years} year${years > 1 ? "s" : ""} ago`;
    // 1+ years → "1 year ago"
}


// ----------------------------------------------------------
// FUNCTION 3: formatMonth
// ----------------------------------------------------------
// Month aur year dikhata hai (longer format).
//
// Input:  "2026-03-15"
// Output: "March 2026"
//
// Kahan use hota hai: Gallery header ya filters mein
// ----------------------------------------------------------
export function formatMonth(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString("en-IN", {
        month: "long",     // "March" (full month name)
        year: "numeric",   // 2026
    });
    // Result: "March 2026"
}
