// Upload ("/upload"). Photos chuno, event chuno, caption + hashtags likho.
// Upload ke baad photos gallery mein dikhti hain aur hashtag search se mil jaati hain
// (abhi sirf is browser session mein — baad mein Cloudinary + database mein save hongi).
// File type / size ka check yahan sirf user ki suvidha ke liye hai — server pe dobara hoga.
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_SIZE_MB,
  getEventsForCollege,
  parseHashtags,
} from "@/lib/helpers";
import { useSession } from "@/lib/session";
import type { Photo } from "@/types";

// Ek chuni hui photo: asli file + preview ke liye temporary browser link
interface SelectedPhoto {
  file: File;
  previewUrl: string;
}

export default function UploadPage() {
  const { collegeId, user, addPhotos } = useSession();
  const collegeEvents = getEventsForCollege(collegeId ?? "");

  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [eventId, setEventId] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtagText, setHashtagText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedTags, setUploadedTags] = useState<string[] | null>(null); // null = abhi upload nahi hua

  const hashtags = parseHashtags(hashtagText); // live preview ke liye

  // Files chuni gayi → har file check karo, galat wali skip karo
  function handleFilesChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const validPhotos: SelectedPhoto[] = [];
    const problems: string[] = [];

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        problems.push(`${file.name} isn't a JPG, PNG or WEBP.`);
        continue;
      }
      // file.size bytes mein hota hai. 1 MB = 1024 * 1024 bytes
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        problems.push(`${file.name} is larger than ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }
      validPhotos.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    // Total 10 se zyada nahi
    const spaceLeft = MAX_FILES_PER_UPLOAD - selectedPhotos.length;
    if (validPhotos.length > spaceLeft) {
      problems.push(`You can upload up to ${MAX_FILES_PER_UPLOAD} photos at a time.`);
      validPhotos.slice(spaceLeft).forEach((p) => URL.revokeObjectURL(p.previewUrl)); // memory free
    }

    setSelectedPhotos([...selectedPhotos, ...validPhotos.slice(0, spaceLeft)]);
    setErrorMessage(problems.join(" "));
    event.target.value = ""; // taaki same file dobara chun sakein
  }

  function removePhoto(indexToRemove: number) {
    URL.revokeObjectURL(selectedPhotos[indexToRemove].previewUrl);
    setSelectedPhotos(selectedPhotos.filter((_, index) => index !== indexToRemove));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedPhotos.length === 0) return setErrorMessage("Add at least one photo.");
    if (!eventId) return setErrorMessage("Pick the event these photos are from.");
    if (hashtags.length === 0) return setErrorMessage("Add at least one hashtag so people can find it.");
    if (caption.length > 120) return setErrorMessage("Keep the caption under 120 characters.");

    setErrorMessage("");
    setIsUploading(true);

    // try/catch: upload fail ho (jaise internet gaya) to app crash na ho, error dikhe
    try {
      await new Promise((resolve) => setTimeout(resolve, 1400)); // fake upload

      const selectedEvent = collegeEvents.find((e) => e.id === eventId)!;
      const today = new Date().toISOString().slice(0, 10); // "2026-11-03"

      // Har file se ek Photo object banao (same caption + tags)
      const newPhotos: Photo[] = selectedPhotos.map((selected, index) => ({
        id: `local-${Date.now()}-${index}`,
        collegeId: collegeId!,
        imageUrl: selected.previewUrl,
        caption: caption.trim() || "Untitled memory",
        hashtags,
        eventId,
        year: selectedEvent.year,
        uploaderName: user!.fullName,
        uploadedAt: today,
      }));

      addPhotos(newPhotos);
      setUploadedTags(hashtags);
    } catch {
      setErrorMessage("Upload failed. Check your connection and try again.");
    } finally {
      setIsUploading(false); // success ho ya error, ye hamesha chalega
    }
  }

  // ---------- Upload ho gaya ----------
  if (uploadedTags) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="rubber-stamp -rotate-6 text-2xl text-teal">Developed!</p>
        <h1 className="mt-8 font-serif text-4xl">
          {selectedPhotos.length} {selectedPhotos.length === 1 ? "print" : "prints"} added to the archive.
        </h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/gallery?tag=${encodeURIComponent(uploadedTags[0])}`} className="btn">
            See #{uploadedTags[0]}
          </Link>
          <Link href="/gallery" className="btn-ghost">Gallery</Link>
        </div>
        <p className="mt-6 text-xs text-muted">Demo: uploads stay until you refresh the page.</p>
      </div>
    );
  }

  // ---------- Form ----------
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="label">New roll</p>
      <h1 className="font-serif text-5xl md:text-6xl">Develop new prints.</h1>
      <p className="mt-3 text-sm text-muted">
        Up to {MAX_FILES_PER_UPLOAD} photos · {MAX_FILE_SIZE_MB}MB each · JPG, PNG, WEBP
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-8">
        {/* Asli file input chhupa hai; poore box pe click karke file chun sakte hain */}
        <label className="block cursor-pointer border-2 border-dashed border-ink/60 bg-paper-light/60 px-6 py-14 text-center transition hover:border-rust hover:bg-paper-light">
          <span className="font-serif text-3xl">Drop your film here</span>
          <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-muted">
            Click to choose · {selectedPhotos.length}/{MAX_FILES_PER_UPLOAD} selected
          </span>
          <input type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} multiple onChange={handleFilesChosen} className="sr-only" />
        </label>

        {/* Preview — chhoti polaroids */}
        {selectedPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-5 sm:grid-cols-5">
            {selectedPhotos.map((photo, index) => (
              <div key={photo.previewUrl} className={`polaroid relative p-2 pb-3 ${index % 2 ? "rotate-2" : "-rotate-2"}`}>
                <img src={photo.previewUrl} alt={photo.file.name} className="aspect-square w-full object-cover" />
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

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="event" className="label">Event</label>
            <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="field">
              <option value="">Select</option>
              {collegeEvents.map((campusEvent) => (
                <option key={campusEvent.id} value={campusEvent.id}>{campusEvent.name}</option>
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

        {/* Hashtags ka live preview, stamp style mein */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {hashtags.map((tag, index) => (
              <span key={tag} className={`rubber-stamp text-rust ${index % 2 ? "rotate-1" : "-rotate-1"}`}>#{tag}</span>
            ))}
          </div>
        )}

        <div>
          <label htmlFor="caption" className="label">
            Caption <span className="normal-case tracking-normal">({caption.length}/120)</span>
          </label>
          <input
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write it like the back of a photo…"
            className="field font-hand text-2xl"
          />
        </div>

        {errorMessage && <p className="text-xs font-bold text-rust" role="alert">{errorMessage}</p>}

        <button type="submit" disabled={isUploading} className="btn w-full py-3.5">
          {isUploading ? "Developing…" : "Upload to the archive"}
        </button>
      </form>
    </div>
  );
}
