"use client"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN EVENTS PAGE (/admin/events)
// Admin yahan events create aur delete kar sakta hai
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabaseClient"
import { useSession } from "@/lib/session"

interface Event { id: string; name: string; year: number; event_date: string | null }

export default function AdminEventsPage() {
  const { collegeId } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [name, setName] = useState("")
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [date, setDate] = useState("")
  const [msg, setMsg]   = useState("")

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 2 - i)

  // Events load karo
  async function load() {
    if (!collegeId) return
    const { data } = await createClient().from("events").select("id, name, year, event_date")
      .eq("college_id", collegeId).order("year", { ascending: false })
    if (data) setEvents(data)
  }
  useEffect(() => { load() }, [collegeId])

  // Naya event banao
  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !collegeId) return
    const { error } = await createClient().from("events")
      .insert({ college_id: collegeId, name: name.trim(), year: Number(year), event_date: date || null })
    if (error) { setMsg("Error: " + error.message); return }
    setMsg("Event created!"); setName(""); setDate("")
    await load()
    setTimeout(() => setMsg(""), 3000)
  }

  // Event delete karo
  async function del(id: string, eventName: string) {
    if (!confirm(`Delete "${eventName}"? Photos won't be deleted but will lose event link.`)) return
    await createClient().from("events").delete().eq("id", id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="max-w-3xl">
      <p className="label">Admin · Events</p>
      <h1 className="font-serif text-5xl">Manage Events</h1>

      {/* Create event form */}
      <form onSubmit={create} className="mt-8 border-2 border-ink bg-paper-light p-6 shadow-[4px_4px_0_var(--color-ink)] space-y-4">
        <h2 className="font-serif text-2xl">Create New Event</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label">Event Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Damru 2027" className="field w-full" required />
          </div>
          <div>
            <label className="label">Year</label>
            <select value={year} onChange={e => setYear(e.target.value)} className="field w-full">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Date (optional)</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="field" />
        </div>
        {msg && <p className={`text-sm font-bold ${msg.startsWith("Error") ? "text-rust" : "text-teal"}`}>{msg}</p>}
        <button type="submit" className="btn">+ Create Event</button>
      </form>

      {/* Events list */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl mb-4">All Events ({events.length})</h2>
        {events.length === 0
          ? <p className="text-muted">No events yet.</p>
          : (
            <div className="space-y-2">
              {events.map(ev => (
                <div key={ev.id} className="flex items-center justify-between border border-ink/30 bg-paper-light px-4 py-3 rounded">
                  <div>
                    <p className="font-semibold">{ev.name}</p>
                    <p className="text-xs text-muted">{ev.year}{ev.event_date ? ` · ${ev.event_date}` : ""}</p>
                  </div>
                  <button onClick={() => del(ev.id, ev.name)} className="text-xs font-bold uppercase text-rust hover:underline">Delete</button>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
