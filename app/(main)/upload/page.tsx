// Upload ("/upload"). Photos chuno, event chuno, caption + hashtags likho.
// Upload ke baad photos gallery mein dikhti hain aur hashtag search se mil jaati hain
// (abhi sirf is browser session mein — baad mein Cloudinary + database mein save hongi).
// File type / size ka check yahan sirf user ki suvidha ke liye hai — server pe dobara hoga.
"use client";

import Link from "next/link";
import { useState } from "react";
import { XIcon } from "@/components/Icons";
import { DoneBurst, PrintStack } from "@/components/Illustrations";
import Spinner from "@/components/Spinner";
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

    if (selectedPhotos.length === 0) return setErrorMessage("Pick at least one photo to upload.");
    if (!eventId) return setErrorMessage("Choose which event these photos are from.");
    if (hashtags.length === 0) return setErrorMessage("Add at least one hashtag so people can find them.");
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
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
        <DoneBurst className="w-44 animate-pop" />
        <h1 className="mt-6 font-display text-5xl leading-[1.05]">
          {selectedPhotos.length} {selectedPhotos.length === 1 ? "photo" : "photos"} on the wall.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">Anyone at your college can now find them under #{uploadedTags[0]}.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href={`/gallery?tag=${encodeURIComponent(uploadedTags[0])}`} className="btn">
            See #{uploadedTags[0]}
          </Link>
          <Link href="/gallery" className="btn-ghost">Back to the wall</Link>
        </div>
        <p className="mt-8 text-sm text-ink-soft">Demo mode: uploads disappear when you refresh.</p>
      </div>
    );
  }

  // ---------- Form ----------
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <h1 className="font-display text-5xl leading-[1.02] md:text-6xl">Add to the wall.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Up to {MAX_FILES_PER_UPLOAD} photos at once, {MAX_FILE_SIZE_MB}MB each. JPG, PNG or WEBP.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-8">
        {/* Asli file input chhupa hai; poore box pe click karke file chun sakte hain */}
        <label className="group flex cursor-pointer flex-col items-center rounded-3xl border-[3px] border-dashed border-ink bg-white px-6 py-10 text-center transition hover:bg-sun/40 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-pink">
          <PrintStack className="w-40 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-3" />
          <span className="mt-4 font-display text-2xl">Choose photos from your device</span>
          <span className="mt-1 text-ink-soft">
            {selectedPhotos.length === 0
              ? "Nothing picked yet"
              : `${selectedPhotos.length} of ${MAX_FILES_PER_UPLOAD} picked`}
          </span>
          <input type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} multiple onChange={handleFilesChosen} className="sr-only" />
        </label>

        {/* Preview — chhote prints, tape ke saath */}
        {selectedPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-5 sm:grid-cols-5">
            {selectedPhotos.map((photo, index) => (
              <div key={photo.previewUrl} className={`relative animate-pop ${index % 2 ? "rotate-2" : "-rotate-2"}`}>
                <span className="absolute -top-2 left-1/2 z-10 h-4 w-12 -translate-x-1/2 bg-pink/80" aria-hidden="true" />
                <div className="rounded-xl border-2 border-ink bg-white p-1.5">
                  <img src={photo.previewUrl} alt={photo.file.name} className="aspect-square w-full rounded-lg object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove ${photo.file.name}`}
                  className="absolute -right-2 -top-2 z-20 grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-sun transition hover:rotate-90 hover:bg-pink hover:text-white"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="event" className="label">Which event?</label>
            <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="field">
              <option value="">Choose an event</option>
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

        {/* Hashtags ka live preview, sticker style mein */}
        {hashtags.length > 0 && (
          <div className="-mt-3 flex flex-wrap gap-3">
            {hashtags.map((tag, index) => (
              <span key={tag} className={`sticker animate-pop ${index % 2 ? "rotate-2 bg-sun" : "-rotate-1 bg-pink-soft"}`}>#{tag}</span>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="caption" className="label">Caption</label>
            <span className={`text-sm font-semibold ${caption.length > 120 ? "text-alarm" : "text-ink-soft"}`}>{caption.length}/120</span>
          </div>
          <input
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Dhol at 2 am, no regrets"
            className="field"
          />
        </div>

        {errorMessage && <p className="font-semibold text-alarm" role="alert">{errorMessage}</p>}

        <div>
          <button type="submit" disabled={isUploading} className="btn h-14 w-full text-lg">
            {isUploading ? (
              <>
                <Spinner /> Printing {selectedPhotos.length} {selectedPhotos.length === 1 ? "photo" : "photos"}
              </>
            ) : (
              "Upload to the wall"
            )}
          </button>
          {/* Upload progress: striped riso bar */}
          {isUploading && (
            <div className="mt-4 h-4 overflow-hidden rounded-full border-2 border-ink bg-white">
              <div className="h-full animate-printing bg-[repeating-linear-gradient(135deg,var(--color-pink)_0_8px,var(--color-sun)_8px_16px)]" />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
