"use client"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN UPLOAD PAGE (/admin/upload)
// Admin yahan photos batch mein upload karta hai
//
// Flow:
//   1. Photos choose karo (max 20, max 10MB)
//   2. Event select karo (ya naya banao)
//   3. Caption + hashtags likho
//   4. Upload → har photo ka status dikhega
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabaseClient"
import { useSession } from "@/lib/session"
import { parseTags } from "@/lib/helpers"

const ALLOWED = ["image/jpeg", "image/png", "image/webp"]
const MAX_MB   = 10
const MAX_FILES = 20

// Ek selected file ka shape
interface FileItem {
  file: File
  preview: string                                      // Browser preview URL
  status: "pending" | "uploading" | "done" | "failed"
}

interface Event { id: string; name: string; year: number }

export default function AdminUploadPage() {
  const { collegeId, refreshPhotos } = useSession()
  const [files, setFiles]       = useState<FileItem[]>([])
  const [events, setEvents]     = useState<Event[]>([])
  const [eventId, setEventId]   = useState("")
  const [newEvent, setNewEvent] = useState("")   // Naya event naam
  const [addNew, setAddNew]     = useState(false) // New event form toggle
  const [caption, setCaption]   = useState("")
  const [tags, setTags]         = useState("")
  const [uploading, setUploading] = useState(false)
  const [doneCount, setDoneCount] = useState(0)

  // College ke events load karo
  useEffect(() => {
    if (!collegeId) return
    createClient().from("events").select("id, name, year").eq("college_id", collegeId)
      .order("year", { ascending: false })
      .then(({ data }) => { if (data) setEvents(data) })
  }, [collegeId])

  // Files choose karo → validate karo
  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? [])
    const valid: FileItem[] = []
    for (const f of chosen) {
      if (!ALLOWED.includes(f.type)) continue          // Wrong type → skip
      if (f.size > MAX_MB * 1024 * 1024) continue      // Too big → skip
      valid.push({ file: f, preview: URL.createObjectURL(f), status: "pending" })
    }
    setFiles(prev => [...prev, ...valid].slice(0, MAX_FILES))
    e.target.value = ""
  }

  // Ek file remove karo
  function remove(i: number) {
    URL.revokeObjectURL(files[i].preview)
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  // Naya event DB mein save karo
  async function createEvent(): Promise<string | null> {
    if (!newEvent.trim() || !collegeId) return null
    const { data } = await createClient().from("events")
      .insert({ college_id: collegeId, name: newEvent.trim(), year: new Date().getFullYear() })
      .select("id, name, year").single()
    if (!data) return null
    setEvents(prev => [data, ...prev])  // List mein add karo
    setEventId(data.id)                 // Auto-select karo
    setAddNew(false); setNewEvent("")
    return data.id
  }

  // Ek photo upload karo: signature → Cloudinary → DB save
  async function uploadOne(item: FileItem, eid: string): Promise<boolean> {
    // 1. Server se Cloudinary signature lo (secret key expose nahi hoti)
    const sigRes = await fetch("/api/admin/upload")
    if (!sigRes.ok) return false
    const { signature, timestamp, cloudName, apiKey } = await sigRes.json()

    // 2. Cloudinary pe upload karo
    const form = new FormData()
    form.append("file", item.file)
    form.append("signature", signature)
    form.append("timestamp", String(timestamp))
    form.append("api_key", apiKey)
    form.append("folder", "camplens/admin")
    const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form })
    if (!up.ok) return false
    const result = await up.json()

    // 3. DB mein save karo
    const event = events.find(e => e.id === eid)
    const save = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cloudinaryPublicId: result.public_id,
        imageUrl: result.secure_url,
        thumbnailUrl: result.secure_url.replace("/upload/", "/upload/w_400,h_400,c_fill,q_auto/"),
        caption: caption.trim() || "Untitled",
        hashtags: parseTags(tags),
        eventId: eid,
        year: event?.year ?? new Date().getFullYear(),
      }),
    })
    return save.ok
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!files.length) return

    // Naya event banao agar form khula tha
    let eid = eventId
    if (addNew && newEvent.trim()) {
      const created = await createEvent()
      if (!created) return
      eid = created
    }
    if (!eid) return

    setUploading(true); setDoneCount(0)
    let done = 0

    for (let i = 0; i < files.length; i++) {
      // Status: uploading
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f))
      const ok = await uploadOne(files[i], eid)
      if (ok) done++
      // Status: done ya failed
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: ok ? "done" : "failed" } : f))
      setDoneCount(done)
    }

    if (done > 0) await refreshPhotos() // Session mein photos reload karo
    setUploading(false)
  }

  const allDone = files.length > 0 && files.every(f => f.status === "done" || f.status === "failed")

  return (
    <div className="max-w-3xl">
      <p className="label">Admin · Upload</p>
      <h1 className="font-serif text-5xl">Upload Photos</h1>
      <p className="mt-2 text-sm text-muted">Max {MAX_FILES} photos · {MAX_MB}MB each · JPG PNG WEBP</p>

      <form onSubmit={handleUpload} className="mt-8 space-y-7">

        {/* File drop zone */}
        <label className="block cursor-pointer border-2 border-dashed border-ink/60 bg-paper-light/60 px-6 py-12 text-center hover:border-rust transition-colors">
          <span className="font-serif text-3xl">Drop photos here</span>
          <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-muted">
            Click to choose · {files.length}/{MAX_FILES}
          </span>
          <input type="file" accept={ALLOWED.join(",")} multiple onChange={onFilePick} className="sr-only" />
        </label>

        {/* Preview grid with status */}
        {files.length > 0 && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {files.map((f, i) => (
              <div key={f.preview} className="relative">
                <img src={f.preview} className="aspect-square w-full object-cover rounded" />
                {/* Status overlay */}
                <div className={`absolute inset-0 flex items-center justify-center rounded text-xs font-bold
                  ${f.status === "uploading" ? "bg-black/40 text-white" : ""}
                  ${f.status === "done"      ? "bg-teal/60 text-white"  : ""}
                  ${f.status === "failed"    ? "bg-rust/60 text-white"  : ""}`}>
                  {f.status === "uploading" && "⏳"}
                  {f.status === "done"      && "✓"}
                  {f.status === "failed"    && "✗"}
                </div>
                {/* Remove button (sirf pending files pe) */}
                {f.status === "pending" && (
                  <button type="button" onClick={() => remove(i)}
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-ink text-paper-light text-xs flex items-center justify-center hover:bg-rust">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Event selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label">Event</label>
            <button type="button" onClick={() => { setAddNew(!addNew); setEventId("") }}
              className="text-xs font-bold uppercase text-rust hover:underline">
              {addNew ? "← Pick existing" : "+ New event"}
            </button>
          </div>
          {addNew
            ? <input value={newEvent} onChange={e => setNewEvent(e.target.value)}
                placeholder="Event name, e.g. Damru 2027" className="field w-full" autoFocus />
            : (
              <select value={eventId} onChange={e => setEventId(e.target.value)} className="field w-full">
                <option value="">Select event</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.year})</option>)}
              </select>
            )
          }
        </div>

        {/* Caption */}
        <div>
          <label className="label">Caption <span className="normal-case text-muted">({caption.length}/200)</span></label>
          <input value={caption} onChange={e => setCaption(e.target.value)}
            placeholder="Short caption for this batch" className="field w-full font-hand text-2xl" maxLength={200} />
        </div>

        {/* Hashtags */}
        <div>
          <label className="label">Hashtags</label>
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="#Damru27 #Night #IITD" className="field w-full" />
          {/* Live preview */}
          {parseTags(tags).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {parseTags(tags).map(t => <span key={t} className="rubber-stamp text-rust">#{t}</span>)}
            </div>
          )}
        </div>

        {/* Progress */}
        {uploading && <p className="text-sm font-bold text-teal">Uploading {doneCount}/{files.length} photos…</p>}

        {/* Success/fail summary */}
        {allDone && (
          <div className="border-2 border-teal bg-teal/10 p-4 rounded">
            <p className="font-bold text-teal">
              ✓ {files.filter(f => f.status === "done").length} uploaded
              {files.filter(f => f.status === "failed").length > 0 &&
                ` · ${files.filter(f => f.status === "failed").length} failed`}
            </p>
            <a href="/gallery" className="mt-2 inline-block text-sm underline">View in Gallery →</a>
          </div>
        )}

        <button type="submit" disabled={uploading || files.length === 0} className="btn w-full py-4">
          {uploading ? `Uploading ${doneCount}/${files.length}…` : `Upload ${files.length || ""} Photos`}
        </button>
      </form>
    </div>
  )
}
