// ============================================================
// FILE: lib/validateUpload.ts — FILE VALIDATION (JAPINDER KA KAAM)
// ============================================================
// Jab user koi file upload kare, pehle check karo ki sahi file hai.
// Yeh file dono cheezein provide karti hai:
//   1. Constants (rules) — MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES
//   2. validateUpload() function — file check karo
//
// GARVIT KI UPLOAD API YEH USE KARTI HAI:
//   const error = validateUpload(file)
//   if (error) → reject karo
//   if (null)  → sahi hai, upload karo
// ============================================================


// ----------------------------------------------------------
// CONSTANTS (Upload Rules)
// ----------------------------------------------------------
// Ek jagah define karo — baaki sab files import kar ke use karenge
// Agar limit change karni ho — sirf yahan change karo
// ----------------------------------------------------------

export const MAX_FILE_SIZE_MB = 5;
// Maximum file size = 5 MB
// 5MB = 5 * 1024 * 1024 = 5,242,880 bytes

export const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",   // .jpg aur .jpeg files
    "image/png",    // .png files
    "image/webp",   // .webp files (modern compressed format)
];
// Sirf yeh teen file types allowed hain
// PDF, video, Word, GIF → blocked rahenge


// ----------------------------------------------------------
// FUNCTION: validateUpload
// ----------------------------------------------------------
// Ek file check karo — sahi hai ya nahi.
//
// Input:  File object (browser API)
// Output: string → error message (agar galat)
//         null   → sab theek (agar sahi)
//
// Example:
//   validateUpload(pdfFile) → "Only JPEG, PNG and WEBP images are allowed"
//   validateUpload(10mbJpg) → "File size must be less than 5 MB"
//   validateUpload(2mbJpg) → null (sahi hai, upload karo)
// ----------------------------------------------------------
export function validateUpload(file: File): string | null {
    // string | null → ya to error message string hoga ya null (sahi)

    // --- CHECK 1: File type sahi hai? ---
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return "Only JPEG, PNG and WEBP images are allowed";
        // .includes() → array mein yeh value hai ya nahi
        // file.type → "image/jpeg", "application/pdf", etc.
        // Agar allowed list mein nahi hai → error message return karo
    }

    // --- CHECK 2: File size limit ke andar hai? ---
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return "File size must be less than 5 MB";
        // file.size → bytes mein aata hai
        // 5 * 1024 * 1024 → 5MB ko bytes mein convert karo
        // Agar file badi hai → error message return karo
    }

    return null;
    // Dono checks pass → null return karo (matlab sab theek hai)
    // null = green signal, upload kar sakte hain
}
