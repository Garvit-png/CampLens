"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_SIZE_MB,
  parseHashtags,
} from "@/lib/helpers";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/session";

interface SelectedPhoto {
  file: File;
  previewUrl: string;
}

interface Event {
  id: string;
  name: string;
  year: number;
}

export default function UploadPage() {
  const { collegeId } = useSession();
  const supabase = createClient();

  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtagText, setHashtagText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState<number | null>(null);
  const [firstTag, setFirstTag] = useState("");

  const hashtags = parseHashtags(hashtagText);

  // Supabase se real events load karo
  useEffect(() => {
    if (!collegeId) return;
    supabase
      .from("events")
      .select("id, name, year")
      .eq("college_id", collegeId)
      .order("year", { ascending: false })
      .then(({ data }) => {
        if (data) setEvents(data);
      });
  }, [collegeId]);

  // Naya event create karo
  async function createEvent(): Promise<string | null> {
    if (!newEventName.trim() || !collegeId) return null;

    const { data, error } = await supabase
      .from("events")
      .insert({
        college_id: collegeId,
        name: newEventName.trim(),
        year: new Date().getFullYear(),
      })
      .select("id, name, year")
      .single();

    if (error || !data) {
      setErrorMessage("Could not create event. Try again.");
      return null;
    }

    // Naya event list mein add karo aur select karo
    setEvents((prev) => [data, ...prev]);
    setEventId(data.id);
    setShowNewEvent(false);
    setNewEventName("");
    return data.id;
  }

  function handleFilesChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const validPhotos: SelectedPhoto[] = [];
    const problems: string[] = [];

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        problems.push(`${file.name} isn't a JPG, PNG or WEBP.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        problems.push(`${file.name} is larger than ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }
      validPhotos.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    const spaceLeft = MAX_FILES_PER_UPLOAD - selectedPhotos.length;
    if (validPhotos.length > spaceLeft) {
      problems.push(`Max ${MAX_FILES_PER_UPLOAD} photos at a time.`);
      validPhotos.slice(spaceLeft).forEach((p) => URL.revokeObjectURL(p.previewUrl));
    }

    setSelectedPhotos([...selectedPhotos, ...validPhotos.slice(0, spaceLeft)]);
    setErrorMessage(problems.join(" "));
    event.target.value = "";
  }

  function removePhoto(indexToRemove: number) {
    URL.revokeObjectURL(selectedPhotos[indexToRemove].previewUrl);
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== indexToRemove));
  }

  async function uploadOnePhoto(file: File) {
    const sigRes = await fetch("/api/cloudinary-signature", { method: "POST" });
    if (!sigRes.ok) throw new Error("Could not get upload signature");
    const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", apiKey);
    formData.append("folder", "camplens");

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
    const result = await uploadRes.json();

    const thumbnailUrl = result.secure_url.replace(
      "/upload/",
      "/upload/w_400,h_400,c_fill,q_auto/"
    );

    return {
      publicId: result.public_id,
      imageUrl: result.secure_url,
      thumbnailUrl,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedPhotos.length === 0) return setErrorMessage("Add at least one photo.");

    // Agar new event form khula hai aur naam bhi bhara hai → pehle event banao
    let finalEventId = eventId;
    if (showNewEvent && newEventName.trim()) {
      const created = await createEvent();
      if (!created) return; // Event creation fail
      finalEventId = created;
    }

    if (!finalEventId) return setErrorMessage("Pick or create an event.");
    if (hashtags.length === 0) return setErrorMessage("Add at least one hashtag.");
    if (caption.length > 120) return setErrorMessage("Keep caption under 120 characters.");

    setErrorMessage("");
    setIsUploading(true);

    const selectedEvent = events.find((e) => e.id === finalEventId);
    let successCount = 0;

    try {
      for (const selected of selectedPhotos) {
        const { publicId, imageUrl, thumbnailUrl } = await uploadOnePhoto(selected.file);

        const saveRes = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cloudinaryPublicId: publicId,
            imageUrl,
            thumbnailUrl,
            caption: caption.trim() || "Untitled memory",
            hashtags,
            eventId: finalEventId,
            year: selectedEvent?.year ?? new Date().getFullYear(),
          }),
        });

        if (saveRes.ok) successCount++;
        else console.error("Save failed for", selected.file.name);
      }

      if (successCount > 0) {
        setUploadedCount(successCount);
        setFirstTag(hashtags[0] ?? "");
      } else {
        setErrorMessage("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Upload failed. Check your connection.");
    } finally {
      setIsUploading(false);
    }
  }

  // Success screen
  if (uploadedCount !== null) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="rubber-stamp -rotate-6 text-2xl text-teal">Developed!</p>
        <h1 className="mt-8 font-serif text-4xl">
          {uploadedCount} {uploadedCount === 1 ? "print" : "prints"} added to the archive.
        </h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {firstTag && (
            <Link href={`/gallery?tag=${encodeURIComponent(firstTag)}`} className="btn">
              See #{firstTag}
            </Link>
          )}
          <Link href="/gallery" className="btn-ghost">Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="label">New roll</p>
      <h1 className="font-serif text-5xl md:text-6xl">Develop new prints.</h1>
      <p className="mt-3 text-sm text-muted">
        Up to {MAX_FILES_PER_UPLOAD} photos · {MAX_FILE_SIZE_MB}MB each · JPG, PNG, WEBP
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-8">

        {/* File drop zone */}
        <label className="block cursor-pointer border-2 border-dashed border-ink/60 bg-paper-light/60 px-6 py-14 text-center transition hover:border-rust hover:bg-paper-light">
          <span className="font-serif text-3xl">Drop your film here</span>
          <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-muted">
            Click to choose · {selectedPhotos.length}/{MAX_FILES_PER_UPLOAD} selected
          </span>
          <input
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            multiple
            onChange={handleFilesChosen}
            className="sr-only"
          />
        </label>

        {/* Previews */}
        {selectedPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-5 sm:grid-cols-5">
            {selectedPhotos.map((photo, index) => (
              <div key={photo.previewUrl} className={`polaroid relative p-2 pb-3 ${index % 2 ? "rotate-2" : "-rotate-2"}`}>
                <img src={photo.previewUrl} alt={photo.file.name} className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-paper-light hover:bg-rust"
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Event selector */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="event" className="label">Event</label>
            <button
              type="button"
              onClick={() => {
                setShowNewEvent(!showNewEvent);
                setEventId(""); // Dropdown clear karo
              }}
              className="text-xs font-bold uppercase tracking-wider text-rust hover:underline"
            >
              {showNewEvent ? "← Pick existing" : "+ New event"}
            </button>
          </div>

          {showNewEvent ? (
            // New event input
            <div className="flex gap-2">
              <input
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g. Rooftop Night, Trip to Manali…"
                className="field flex-1"
                autoFocus
              />
            </div>
          ) : (
            // Existing events dropdown
            <select
              id="event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="field"
            >
              <option value="">Select an event</option>
              {events.length === 0 && (
                <option disabled>No events yet — create one above</option>
              )}
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.year})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Hashtags */}
        <div>
          <label htmlFor="hashtags" className="label">Hashtags</label>
          <input
            id="hashtags"
            value={hashtagText}
            onChange={(e) => setHashtagText(e.target.value)}
            placeholder="#Damru26 #Night #Friends"
            className="field"
          />
        </div>

        {/* Hashtag preview */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {hashtags.map((tag, index) => (
              <span key={tag} className={`rubber-stamp text-rust ${index % 2 ? "rotate-1" : "-rotate-1"}`}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Caption */}
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

        {errorMessage && (
          <p className="text-xs font-bold text-rust" role="alert">{errorMessage}</p>
        )}

        <button type="submit" disabled={isUploading} className="btn w-full py-3.5">
          {isUploading
            ? `Uploading ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? "s" : ""}…`
            : "Upload to the archive"}
        </button>
      </form>
    </div>
  );
}
