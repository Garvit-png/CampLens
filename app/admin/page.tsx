"use client"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN DASHBOARD (/admin)
// Dikhata hai: Total photos, events, pending review
// Quick links: Upload, Events, Photos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabaseClient"
import { useSession } from "@/lib/session"

export default function AdminDashboard() {
  const { collegeId, college } = useSession()
  const [stats, setStats] = useState({ photos: 0, events: 0, pending: 0 })

  // Counts fetch karo DB se
  useEffect(() => {
    if (!collegeId) return
    const sb = createClient()
    Promise.all([
      sb.from("photos").select("id", { count: "exact", head: true }).eq("college_id", collegeId),
      sb.from("events").select("id", { count: "exact", head: true }).eq("college_id", collegeId),
      sb.from("photos").select("id", { count: "exact", head: true }).eq("college_id", collegeId).eq("is_approved", false),
    ]).then(([p, e, pend]) => setStats({ photos: p.count ?? 0, events: e.count ?? 0, pending: pend.count ?? 0 }))
  }, [collegeId])

  return (
    <div>
      <p className="label">Admin Panel</p>
      <h1 className="font-serif text-5xl">{college?.name ?? "Dashboard"}</h1>

      {/* Stats boxes */}
      <div className="mt-10 grid grid-cols-3 gap-6">
        {[
          { label: "Total Photos",   value: stats.photos,  color: "text-teal" },
          { label: "Total Events",   value: stats.events,  color: "text-rust" },
          { label: "Pending Review", value: stats.pending, color: "text-plum" },
        ].map(s => (
          <div key={s.label} className="border-2 border-ink bg-paper-light p-6 shadow-[4px_4px_0_var(--color-ink)]">
            <p className={`font-serif text-5xl ${s.color}`}>{s.value}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick action links */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/upload" className="btn flex items-center justify-center gap-2 py-4">📤 Upload Photos</Link>
        <Link href="/admin/events" className="btn-ghost flex items-center justify-center gap-2 py-4 border-2 border-ink">🗓 Manage Events</Link>
        <Link href="/admin/photos" className="btn-ghost flex items-center justify-center gap-2 py-4 border-2 border-ink">🖼 Manage Photos</Link>
      </div>
    </div>
  )
}
