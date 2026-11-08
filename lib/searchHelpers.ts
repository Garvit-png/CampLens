// ============================================================
// FILE: lib/searchHelpers.ts — SEARCH UTILITIES (JAPINDER KA KAAM)
// ============================================================
// Search functionality ke liye helper functions.
// Vansh ki Search API aur Gallery search dono yeh use karte hain.
//
// TEEN FUNCTIONS:
//   1. cleanSearchQuery() → "#Damru26 " → "damru26" (clean for comparison)
//   2. isValidSearch()    → check karo search valid hai ya nahi
//   3. highlightMatch()   → matching text ko highlight karo (UI ke liye)
// ============================================================


// ----------------------------------------------------------
// FUNCTION 1: cleanSearchQuery
// ----------------------------------------------------------
// Search input ko clean karta hai:
//   - # signs hatao
//   - Extra spaces hatao
//   - Lowercase mein convert karo (case-insensitive search)
//
// Input:  "#Damru26 " ya "  Damru26" ya "#damru26"
// Output: "damru26" (sab same — clean + lowercase)
//
// KYUN ZAROORI?
// User "#Damru26" type kare ya "damru26" — dono se same results aane chahiye
// Isliye sab clean karke lowercase mein compare karte hain
// ----------------------------------------------------------
export function cleanSearchQuery(query: string): string {
    return query
        .trim()                    // "  #Damru26  " → "#Damru26" (spaces hatao)
        .replace(/^#+/, "")        // "#Damru26" → "Damru26" (shuru ke # hatao)
        .replace(/#+$/, "")        // "Damru26#" → "Damru26" (end ke # hatao)
        .trim()                    // extra spaces jo # removal ke baad aayi
        .toLowerCase();            // "Damru26" → "damru26" (case-insensitive)
    // Chain: ek operation ka output agle mein jaata hai
}


// ----------------------------------------------------------
// FUNCTION 2: isValidSearch
// ----------------------------------------------------------
// Search query valid hai ya nahi check karta hai.
// Sirf khaali spaces ya sirf # wali query → invalid
//
// Input:  "#Damru26" → true (valid)
//         "   "      → false (invalid — sirf spaces)
//         "#"        → false (invalid — sirf hash)
//         ""         → false (invalid — empty)
// ----------------------------------------------------------
export function isValidSearch(query: string): boolean {
    // boolean → true ya false return karta hai

    const cleaned = cleanSearchQuery(query);
    // Pehle clean karo

    return cleaned.length > 0;
    // Agar clean karne ke baad kuch bacha → valid (true)
    // Agar khaali → invalid (false)
}


// ----------------------------------------------------------
// FUNCTION 3: highlightMatch
// ----------------------------------------------------------
// Caption mein search query match kar raha hai ya nahi check karta hai.
// "Starts with" search hai — "dam" likhne pe "Damru26" match hoga.
//
// Input:  hashtags = ["Damru26", "Night", "Music"]
//         query = "dam"
// Output: true (Damru26 starts with "dam")
//
// Kahan use hota hai: Gallery filterPhotos() function mein
// ----------------------------------------------------------
export function highlightMatch(
    hashtags: string[],
    query: string
): boolean {
    // hashtags → photo ke hashtags array
    // query → search text (already cleaned + lowercased)

    if (!query) return true;
    // Khaali search → sab match (sab dikhao)

    return hashtags.some(tag =>
        tag.toLowerCase().startsWith(query)
    );
    // .some() → koi ek bhi match kare to true
    // .startsWith() → "damru26".startsWith("dam") → true
    // .toLowerCase() → case-insensitive comparison
}
