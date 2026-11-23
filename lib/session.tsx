"use client"
// ─────────────────────────────────────────────
// session.tsx — App ka global state
// ─────────────────────────────────────────────
// Do types of users:
//
// STUDENT: No login. College + batch choose karo → gallery dekho.
//   Data: localStorage mein save hota hai (browser band karo → wahi rahe)
//
// ADMIN: Google se login karo → photos upload karo.
//   Data: Supabase Auth se aata hai
// ─────────────────────────────────────────────

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabaseClient"
import type { CampusEvent, Photo } from "@/types"

// Yeh sab cheezein koi bhi component useSession() se le sakta hai
interface AppState {
  // Student
  collegeId: string | null       // Kaunsa college select hua
  batchYear: string | null       // Kaunsa batch select hua
  college: { id: string; name: string; city: string } | null  // College ki info
  photos: Photo[]                // Is college ki saari photos
  events: CampusEvent[]          // Is college ke saare events
  setCollege: (id: string) => void    // College choose karo
  setBatch: (year: string) => void    // Batch choose karo
  clearStudent: () => void            // College change karo (sab reset)
  refreshPhotos: () => Promise<void>  // Photos reload karo (upload ke baad)

  // Admin
  isAdmin: boolean               // Kya current user admin hai?
  isAdminReady: boolean          // Admin check complete hua?
  adminSignOut: () => Promise<void>  // Admin logout
}

const Ctx = createContext<AppState | null>(null)

// localStorage key
const KEY = "camplens"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [collegeId, setCollegeId] = useState<string | null>(null)
  const [batchYear, setBatchYear] = useState<string | null>(null)
  const [college, setCollegeObj] = useState<AppState["college"]>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [events, setEvents] = useState<CampusEvent[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAdminReady, setIsAdminReady] = useState(false)

  // Supabase client — ek baar banao, reuse karo
  const sb = useRef(createClient()).current

  // App khulte hi: localStorage se college load karo
  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (!saved) return
    try {
      const { cid, by } = JSON.parse(saved)
      if (cid) { setCollegeId(cid); if (by) setBatchYear(by); loadData(cid) }
    } catch { localStorage.removeItem(KEY) }
  }, [])

  // Admin check: Google login hai toh role check karo
  useEffect(() => {
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await sb.from("profiles").select("role").eq("user_id", session.user.id).maybeSingle()
        setIsAdmin(data?.role === "admin")
      } else {
        setIsAdmin(false)
      }
      if (event === "INITIAL_SESSION") setIsAdminReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // College ka data load karo: info + photos + events
  async function loadData(cid: string) {
    // College info
    const { data: col } = await sb.from("colleges").select("id, name, city").eq("id", cid).single()
    if (col) setCollegeObj(col)

    // Photos (newest first, max 200)
    const { data: photoRows } = await sb
      .from("photos")
      .select("id, image_url, thumbnail_url, caption, hashtags, year, uploaded_at, event_id, college_id, events(name)")
      .eq("college_id", cid)
      .eq("is_approved", true)
      .order("uploaded_at", { ascending: false })
      .limit(200)

    if (photoRows) {
      setPhotos(photoRows.map((p: any) => ({
        id: p.id,
        collegeId: p.college_id,
        imageUrl: p.image_url,
        thumbnailUrl: p.thumbnail_url ?? undefined,
        caption: p.caption ?? "",
        hashtags: p.hashtags ?? [],
        eventId: p.event_id ?? "",
        eventName: p.events?.name ?? undefined,
        year: p.year ?? new Date().getFullYear(),
        uploaderName: "Admin",
        uploadedAt: p.uploaded_at?.slice(0, 10) ?? "",
      })))
    }

    // Events
    const { data: eventRows } = await sb
      .from("events")
      .select("id, college_id, name, year")
      .eq("college_id", cid)
      .order("year", { ascending: false })

    if (eventRows) {
      setEvents(eventRows.map((e: any) => ({ id: e.id, collegeId: e.college_id, name: e.name, year: e.year })))
    }
  }

  function setCollege(id: string) {
    setCollegeId(id)
    const prev = JSON.parse(localStorage.getItem(KEY) || "{}")
    localStorage.setItem(KEY, JSON.stringify({ ...prev, cid: id }))
    loadData(id)
  }

  function setBatch(year: string) {
    setBatchYear(year)
    const prev = JSON.parse(localStorage.getItem(KEY) || "{}")
    localStorage.setItem(KEY, JSON.stringify({ ...prev, by: year }))
  }

  function clearStudent() {
    setCollegeId(null); setBatchYear(null); setCollegeObj(null)
    setPhotos([]); setEvents([])
    localStorage.removeItem(KEY)
  }

  async function refreshPhotos() {
    if (collegeId) await loadData(collegeId)
  }

  async function adminSignOut() {
    await sb.auth.signOut()
    setIsAdmin(false)
  }

  return (
    <Ctx.Provider value={{ collegeId, batchYear, college, photos, events, setCollege, setBatch, clearStudent, refreshPhotos, isAdmin, isAdminReady, adminSignOut }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSession() {
  const s = useContext(Ctx)
  if (!s) throw new Error("Wrap app in <SessionProvider>")
  return s
}
