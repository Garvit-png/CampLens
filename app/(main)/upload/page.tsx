// ============================================================
// FILE: app/(main)/upload/page.tsx — UPLOAD PAGE ("/upload")
// ============================================================
// Yahan user photos upload karta hai — caption, event, hashtags ke saath.
//
// FLOW:
//   1. Files choose karo (max 10, max 5MB each, JPG/PNG/WEBP only)
//   2. Event select karo (dropdown se)
//   3. Hashtags daalo: #Damru26 #Night
//   4. Caption likho (max 120 chars)
//   5. Submit → "Developing..." → photos gallery mein appear ho jaati hain
//
// ABHI: Photos sirf browser session mein rehti hain (refresh = gone)
// REAL MEIN: Cloudinary pe upload + Supabase database mein save hongi
// ============================================================

"use client";
// 'use client' zaroori: useState, file input, event handlers — sab browser mein

import Link from "next/link";
// Link → Next.js ka smart anchor tag (page reload nahi hota)

import { useState } from "react";

import {
  ALLOWED_IMAGE_TYPES,
  // ["image/jpeg", "image/png", "image/webp"] — allowed file types

  MAX_FILES_PER_UPLOAD,
  // 10 — maximum photos per upload

  MAX_FILE_SIZE_MB,
  // 5 — maximum file size in MB

  getEventsForCollege,
  // College ID se events list return karta hai (dropdown ke liye)

  parseHashtags,
  // "#Damru26 #Night" → ["Damru26", "Night"] — text se tags nikaalta hai
} from "@/lib/helpers";

import { useSession } from "@/lib/session";
// Session se: collegeId, user, addPhotos

import type { Photo } from "@/types";
// Photo type — naye Photo objects banane ke liye


// ----------------------------------------------------------
// SelectedPhoto INTERFACE
// ----------------------------------------------------------
// Ek chosen photo = asli file + preview ke liye temporary browser URL
// ----------------------------------------------------------
interface SelectedPhoto {
  file: File;
  // Asli file object — browser se choose ki gayi file
  // File ek browser API type hai

  previewUrl: string;
  // URL.createObjectURL(file) se bana URL — browser mein preview dikhane ke liye
  // Temporary hai — refresh pe chali jayegi
}


export default function UploadPage() {
  const { collegeId, user, addPhotos } = useSession();
  // collegeId → kis college ki photo hai
  // user      → kisne upload kiya (naam ke liye)
  // addPhotos → session mein naye photos add karne ka function

  const collegeEvents = getEventsForCollege(collegeId ?? "");
  // Is college ke saare events — dropdown options ke liye
  // collegeId ?? "" → agar null hai toh khaali string (safe access)

  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  // User ne kaunsi files choose ki — array mein store hote hain

  const [eventId, setEventId] = useState("");
  // Kaunsa event select kiya — dropdown ki value

  const [caption, setCaption] = useState("");
  // Caption text — photo ke neeche likhi description

  const [hashtagText, setHashtagText] = useState("");
  // Hashtag input text — "#Damru26 #Night" jaisa

  const [errorMessage, setErrorMessage] = useState("");
  // Validation error message

  const [isUploading, setIsUploading] = useState(false);
  // true = upload ho raha hai (button disable + "Developing..." text)

  const [uploadedTags, setUploadedTags] = useState<string[] | null>(null);
  // null = abhi upload nahi hua
  // string[] = upload successful, in tags ke saath (success screen ke liye)

  const hashtags = parseHashtags(hashtagText);
  // Live preview ke liye — har keystroke pe parse ho jaate hain
  // "#Damru26 #Night" → ["Damru26", "Night"] (real-time tag preview)


  // ----------------------------------------------------------
  // FILE SELECTION HANDLER
  // ----------------------------------------------------------
  // User ne files choose ki — validate karo, galat wali skip karo
  // ----------------------------------------------------------
  function handleFilesChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // event.target.files → FileList object (array jaisa but not exactly array)
    // Array.from() → proper array mein convert karo
    // ?? [] → agar null hai toh khaali array

    const validPhotos: SelectedPhoto[] = [];
    // Sahi files yahan jayenge

    const problems: string[] = [];
    // Galat files ki error messages yahan jayenge

    for (const file of files) {
      // Har file ek ek karke check karo

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        problems.push(`${file.name} isn't a JPG, PNG or WEBP.`);
        continue;
        // File type galat hai → error message + skip (continue)
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        // file.size bytes mein hota hai
        // 5 * 1024 * 1024 = 5,242,880 bytes = 5MB
        problems.push(`${file.name} is larger than ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }

      validPhotos.push({ file, previewUrl: URL.createObjectURL(file) });
      // Sahi file → validPhotos mein add karo
      // URL.createObjectURL → browser mein temporary preview URL banao
    }

    const spaceLeft = MAX_FILES_PER_UPLOAD - selectedPhotos.length;
    // Kitni aur files add ho sakti hain (10 - already selected)

    if (validPhotos.length > spaceLeft) {
      problems.push(`You can upload up to ${MAX_FILES_PER_UPLOAD} photos at a time.`);
      // Limit exceeded → error message
      validPhotos.slice(spaceLeft).forEach((p) => URL.revokeObjectURL(p.previewUrl));
      // Extra files ke preview URLs clean karo (memory free karo)
    }

    setSelectedPhotos([...selectedPhotos, ...validPhotos.slice(0, spaceLeft)]);
    // Valid photos add karo (sirf space jitni hai)

    setErrorMessage(problems.join(" "));
    // Error messages ko ek string mein jodo — space se separate

    event.target.value = "";
    // Input reset karo — taaki same file dobara choose kar saken
    // (Agar value="" na karo → same file dubara select nahi hoti)
  }


  // ----------------------------------------------------------
  // REMOVE PHOTO FROM SELECTION
  // ----------------------------------------------------------
  function removePhoto(indexToRemove: number) {
    URL.revokeObjectURL(selectedPhotos[indexToRemove].previewUrl);
    // Preview URL clean karo — memory leak prevent

    setSelectedPhotos(selectedPhotos.filter((_, index) => index !== indexToRemove));
    // .filter() → sirf woh photos rakho jiska index match nahi karta
    // _ → value nahi chahiye, sirf index chahiye (underscore convention)
  }


  // ----------------------------------------------------------
  // FORM SUBMIT HANDLER
  // ----------------------------------------------------------
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Page reload rok do

    // --- VALIDATION CHECKS ---
    if (selectedPhotos.length === 0)
      return setErrorMessage("Add at least one photo.");
    // Koi photo select nahi ki → error

    if (!eventId)
      return setErrorMessage("Pick the event these photos are from.");
    // Event select nahi ki → error

    if (hashtags.length === 0)
      return setErrorMessage("Add at least one hashtag so people can find it.");
    // Koi hashtag nahi → error (search se nahi milegi)

    if (caption.length > 120)
      return setErrorMessage("Keep the caption under 120 characters.");
    // Caption bahut lamba → error

    setErrorMessage("");
    // Sab valid → purana error clear karo

    setIsUploading(true);
    // Loading state ON

    try {
      // --- UPLOAD LOGIC ---
      await new Promise((resolve) => setTimeout(resolve, 1400));
      // 1400ms ka artificial delay — real Cloudinary upload simulate karna
      // Real mein: Cloudinary API pe file upload → URL wapas aayega

      const selectedEvent = collegeEvents.find((e) => e.id === eventId)!;
      // Event object dhundho (non-null assertion: ! lagaya kyunki validate kiya)

      const today = new Date().toISOString().slice(0, 10);
      // new Date().toISOString() → "2026-11-03T14:30:00.000Z"
      // .slice(0, 10) → "2026-11-03" (sirf date, time hatao)

      // Har selected file se ek Photo object banao
      const newPhotos: Photo[] = selectedPhotos.map((selected, index) => ({
        id: `local-${Date.now()}-${index}`,
        // Unique ID banane ke liye: timestamp + index
        // Date.now() → milliseconds since 1970 (unique enough)

        collegeId: collegeId!,
        // Is college ki photo hai
        // ! → non-null assertion (RequireSession ne already check kiya)

        imageUrl: selected.previewUrl,
        // Abhi preview URL use kar rahe hain (temporary)
        // Real mein: Cloudinary se permanent URL aayega

        caption: caption.trim() || "Untitled memory",
        // Caption khaali hai → "Untitled memory" default

        hashtags,
        // Parsed hashtags array — sab photos pe same hashtags

        eventId,
        // Kaunse event ki photo hai

        year: selectedEvent.year,
        // Event ka year — photo ka year bhi wahi hoga

        uploaderName: user!.fullName,
        // Current user ka naam

        uploadedAt: today,
        // Aaj ki date
      }));

      addPhotos(newPhotos);
      // Session mein naye photos add karo → Gallery mein instantly appear

      setUploadedTags(hashtags);
      // Upload successful → success screen dikhane ke liye tags save karo

    } catch {
      // catch block: agar upload fail ho jaye (jaise internet gaya)
      setErrorMessage("Upload failed. Check your connection and try again.");
      // User-friendly error message
    } finally {
      // finally HAMESHA chalta hai — success ho ya fail
      setIsUploading(false);
      // Loading state OFF karo
    }
  }


  // ----------------------------------------------------------
  // SUCCESS SCREEN (upload complete)
  // ----------------------------------------------------------
  if (uploadedTags) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="rubber-stamp -rotate-6 text-2xl text-teal">Developed!</p>
        {/* rubber-stamp → custom CSS class (globals.css) — stamp look */}

        <h1 className="mt-8 font-serif text-4xl">
          {selectedPhotos.length} {selectedPhotos.length === 1 ? "print" : "prints"} added to the archive.
          {/* 1 photo → "print" (singular), 2+ photos → "prints" (plural) */}
        </h1>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/gallery?tag=${encodeURIComponent(uploadedTags[0])}`}
            // encodeURIComponent → URL mein special characters safe karo
            // "Damru26" → "Damru26" (no change), but "Night Life" → "Night%20Life"
            className="btn"
          >
            See #{uploadedTags[0]}
            {/* Gallery pe jao with first tag as search */}
          </Link>

          <Link href="/gallery" className="btn-ghost">
            Gallery
            {/* Gallery pe jao bina koi filter ke */}
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted">
          Demo: uploads stay until you refresh the page.
          {/* Important note: abhi photos temporary hain */}
        </p>
      </div>
    );
  }


  // ----------------------------------------------------------
  // UPLOAD FORM (main UI)
  // ----------------------------------------------------------
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">

      <p className="label">New roll</p>
      <h1 className="font-serif text-5xl md:text-6xl">Develop new prints.</h1>
      <p className="mt-3 text-sm text-muted">
        Up to {MAX_FILES_PER_UPLOAD} photos · {MAX_FILE_SIZE_MB}MB each · JPG, PNG, WEBP
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-8">

        {/* --- FILE DROP ZONE --- */}
        {/* Poore box pe click karo → hidden file input trigger ho */}
        <label className="block cursor-pointer border-2 border-dashed border-ink/60 bg-paper-light/60 px-6 py-14 text-center transition hover:border-rust hover:bg-paper-light">
          <span className="font-serif text-3xl">Drop your film here</span>
          <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-muted">
            Click to choose · {selectedPhotos.length}/{MAX_FILES_PER_UPLOAD} selected
            {/* "3/10 selected" — live counter */}
          </span>
          {/* Hidden file input — label click se trigger hota */}
          <input
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            // accept → sirf yeh file types dikhao in file picker
            // "image/jpeg,image/png,image/webp"
            multiple
            // multiple → ek saath multiple files choose kar sakte hain
            onChange={handleFilesChosen}
            className="sr-only"
            // sr-only → screen reader only (visually hidden but accessible)
          />
        </label>

        {/* --- PHOTO PREVIEWS (polaroid cards) --- */}
        {selectedPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-5 sm:grid-cols-5">
            {selectedPhotos.map((photo, index) => (
              <div
                key={photo.previewUrl}
                className={`polaroid relative p-2 pb-3 ${index % 2 ? "rotate-2" : "-rotate-2"}`}
                // polaroid → custom CSS class (white frame look)
                // Alternate rotation: scattered photos feel
              >
                <img
                  src={photo.previewUrl}
                  alt={photo.file.name}
                  className="aspect-square w-full object-cover"
                  // aspect-square → 1:1 ratio (square thumbnail)
                  // object-cover → crop to fill square
                />

                {/* Remove button — top right corner */}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove ${photo.file.name}`}
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-paper-light hover:bg-rust"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* --- EVENT + HASHTAG INPUTS --- */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="event" className="label">Event</label>
            <select
              id="event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="field"
            >
              <option value="">Select</option>
              {collegeEvents.map((campusEvent) => (
                <option key={campusEvent.id} value={campusEvent.id}>
                  {campusEvent.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="hashtags" className="label">Hashtags</label>
            <input
              id="hashtags"
              value={hashtagText}
              onChange={(e) => setHashtagText(e.target.value)}
              placeholder="#Damru26 #Night"
              className="field"
            />
          </div>
        </div>

        {/* --- HASHTAG LIVE PREVIEW (stamp style) --- */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {hashtags.map((tag, index) => (
              <span
                key={tag}
                className={`rubber-stamp text-rust ${index % 2 ? "rotate-1" : "-rotate-1"}`}
              >
                #{tag}
                {/* Live preview: jaise type karo, stamps appear hote hain */}
              </span>
            ))}
          </div>
        )}

        {/* --- CAPTION INPUT --- */}
        <div>
          <label htmlFor="caption" className="label">
            Caption <span className="normal-case tracking-normal">({caption.length}/120)</span>
            {/* Character counter: live update — "45/120" */}
          </label>
          <input
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write it like the back of a photo…"
            className="field font-hand text-2xl"
            // font-hand → Caveat handwriting font (photo caption feel)
          />
        </div>

        {/* --- ERROR MESSAGE --- */}
        {errorMessage && (
          <p className="text-xs font-bold text-rust" role="alert">{errorMessage}</p>
        )}

        {/* --- SUBMIT BUTTON --- */}
        <button type="submit" disabled={isUploading} className="btn w-full py-3.5">
          {isUploading ? "Developing…" : "Upload to the archive"}
          {/* Loading state: "Developing…" (film development metaphor) */}
        </button>
      </form>
    </div>
  );
}
