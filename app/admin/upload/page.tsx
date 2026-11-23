'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useSession } from '@/lib/session'
import { parseTags } from '@/lib/helpers'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 20

interface FileItem {
  file: File
  previewUrl: string
  status: 'pending' | 'uploading' | 'done' | 'failed'
  error?: string
}

interface Event { id: string; name: string; year: number }

export default function AdminUploadPage() {
  const { collegeId } = useSession()
  const [files, setFiles] = useState<FileItem[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [eventId, setEventId] = useState('')
  const [newEventName, setNewEventName] = useState('')
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [caption, setCaption] = useState('')
  const [hashtagText, setHashtagText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [doneCount, setDoneCount] = useState(0)
  const hashtags = parseTags(hashtagText)

  // Load events
  useEffect(() => {
    if (!collegeId) return
    createClient()
      .from('events').select('id, name, year')
      .eq('college_id', collegeId)
      .order('year', { ascending: false })
      .then(({ data }) => { if (data) setEvents(data) })
  }, [collegeId])

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? [])
    const valid: FileItem[] = []
    for (const f of chosen) {
      if (!ALLOWED.includes(f.type)) continue
      if (f.size > MAX_SIZE) continue
      valid.push({ file: f, previewUrl: URL.createObjectURL(f), status: 'pending' })
    }
    setFiles(prev => [...prev, ...valid].slice(0, MAX_FILES))
    e.target.value = ''
  }

  function removeFile(i: number) {
    URL.revokeObjectURL(files[i].previewUrl)
    setFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  async function createEvent(): Promise<string | null> {
    if (!newEventName.trim() || !collegeId) return null
    const { data, error } = await createClient()
      .from('events')
      .insert({ college_id: collegeId, name: newEventName.trim(), year: new Date().getFullYear() })
      .select('id, name, year').single()
    if (error || !data) return null
    setEvents(prev => [data, ...prev])
    setEventId(data.id)
    setShowNewEvent(false)
    setNewEventName('')
    return data.id
  }

  async function uploadOne(item: FileItem, finalEventId: string): Promise<boolean> {
    // 1. Get signature
    const sigRes = await fetch('/api/admin/upload')
    if (!sigRes.ok) return false
    const { signature, timestamp, cloudName, apiKey } = await sigRes.json()

    // 2. Upload to Cloudinary
    const form = new FormData()
    form.append('file', item.file)
    form.append('signature', signature)
    form.append('timestamp', String(timestamp))
    form.append('api_key', apiKey)
    form.append('folder', 'camplens/admin')

    const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST', body: form,
    })
    if (!upRes.ok) return false
    const result = await upRes.json()
    const thumbnailUrl = result.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto/')

    // 3. Save to DB
    const selectedEvent = events.find(e => e.id === finalEventId)
    const saveRes = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cloudinaryPublicId: result.public_id,
        imageUrl: result.secure_url,
        thumbnailUrl,
        caption: caption.trim() || 'Untitled',
        hashtags,
        eventId: finalEventId,
        year: selectedEvent?.year ?? new Date().getFullYear(),
      }),
    })
    return saveRes.ok
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (files.length === 0) return

    // Create event if needed
    let finalEventId = eventId
    if (showNewEvent && newEventName.trim()) {
      const created = await createEvent()
      if (!created) return
      finalEventId = created
    }
    if (!finalEventId) return

    setIsUploading(true)
    setDoneCount(0)
    let done = 0

    for (let i = 0; i < files.length; i++) {
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f))
      const ok = await uploadOne(files[i], finalEventId)
      if (ok) done++
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: ok ? 'done' : 'failed' } : f))
      setDoneCount(done)
    }

    setIsUploading(false)
  }

  const allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'failed')

  return (
    <div className="max-w-3xl">
      <p className="label">Admin · Upload</p>
      <h1 className="font-serif text-5xl">Upload Photos</h1>
      <p className="mt-2 text-sm text-muted">Up to {MAX_FILES} photos · 10MB each · JPG, PNG, WEBP</p>

      <form onSubmit={handleUpload} className="mt-8 space-y-7">

        {/* Drop zone */}
        <label className="block cursor-pointer border-2 border-dashed border-ink/60 bg-paper-light/60 px-6 py-12 text-center hover:border-rust transition-colors">
          <span className="font-serif text-3xl">Drop photos here</span>
          <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-muted">
            Click to choose · {files.length}/{MAX_FILES}
          </span>
          <input type="file" accept={ALLOWED.join(',')} multiple onChange={handleFiles} className="sr-only" />
        </label>

        {/* Preview grid */}
        {files.length > 0 && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {files.map((f, i) => (
              <div key={f.previewUrl} className="relative">
                <img src={f.previewUrl} alt="" className="aspect-square w-full object-cover rounded" />
                {/* Status badge */}
                <div className={`absolute inset-0 flex items-center justify-center rounded text-xs font-bold
                  ${f.status === 'uploading' ? 'bg-black/40 text-white' : ''}
                  ${f.status === 'done' ? 'bg-teal/60 text-white' : ''}
                  ${f.status === 'failed' ? 'bg-rust/60 text-white' : ''}
                `}>
                  {f.status === 'uploading' && '⏳'}
                  {f.status === 'done' && '✓'}
                  {f.status === 'failed' && '✗'}
                </div>
                {f.status === 'pending' && (
                  <button type="button" onClick={() => removeFile(i)}
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-ink text-paper-light text-xs flex items-center justify-center hover:bg-rust">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Event */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label">Event</label>
            <button type="button" onClick={() => { setShowNewEvent(!showNewEvent); setEventId('') }}
              className="text-xs font-bold uppercase text-rust hover:underline">
              {showNewEvent ? '← Pick existing' : '+ New event'}
            </button>
          </div>
          {showNewEvent ? (
            <input value={newEventName} onChange={e => setNewEventName(e.target.value)}
              placeholder="Event name, e.g. Damru 2027" className="field w-full" autoFocus />
          ) : (
            <select value={eventId} onChange={e => setEventId(e.target.value)} className="field w-full">
              <option value="">Select event</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.year})</option>)}
            </select>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="label">Caption <span className="normal-case text-muted">({caption.length}/200)</span></label>
          <input value={caption} onChange={e => setCaption(e.target.value)}
            placeholder="Short caption for all photos in this batch" className="field w-full font-hand text-2xl" maxLength={200} />
        </div>

        {/* Hashtags */}
        <div>
          <label className="label">Hashtags</label>
          <input value={hashtagText} onChange={e => setHashtagText(e.target.value)}
            placeholder="#Damru27 #Night #IITD" className="field w-full" />
          {hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {hashtags.map(t => <span key={t} className="rubber-stamp text-rust">#{t}</span>)}
            </div>
          )}
        </div>

        {/* Progress */}
        {isUploading && (
          <p className="text-sm font-bold text-teal">
            Uploading {doneCount}/{files.length} photos…
          </p>
        )}

        {allDone && (
          <div className="border-2 border-teal bg-teal/10 p-4 rounded">
            <p className="font-bold text-teal">
              ✓ {files.filter(f => f.status === 'done').length} uploaded successfully
              {files.filter(f => f.status === 'failed').length > 0 &&
                ` · ${files.filter(f => f.status === 'failed').length} failed`}
            </p>
            <a href="/gallery" className="mt-2 inline-block text-sm underline">View in Gallery →</a>
          </div>
        )}

        <button type="submit" disabled={isUploading || files.length === 0} className="btn w-full py-4">
          {isUploading ? `Uploading ${doneCount}/${files.length}…` : `Upload ${files.length || ''} Photos`}
        </button>
      </form>
    </div>
  )
}
