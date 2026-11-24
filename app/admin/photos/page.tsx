"use client"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN PHOTOS PAGE (/admin/photos)
// Admin yahan photos dekh, approve/unapprove, delete kar sakta hai
// Filter: All / Approved / Pending review
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabaseClient"
import { useSession } from "@/lib/session"

interface Photo { id: string; image_url: string; thumbnail_url: string | null; caption: string; is_approved: boolean; uploaded_at: string }

export default function AdminPhotosPage() {
  const { collegeId, adminCollegeId } = useSession()
  const effectiveCollegeId = adminCollegeId ?? collegeId
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all")
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!effectiveCollegeId) return
    setLoading(true)
    let q = createClient().from("photos")
      .select("id, image_url, thumbnail_url, caption, is_approved, uploaded_at")
      .eq("college_id", effectiveCollegeId)
      .order("uploaded_at", { ascending: false })
    if (filter === "approved") q = q.eq("is_approved", true)
    if (filter === "pending")  q = q.eq("is_approved", false)
    const { data } = await q
    if (data) setPhotos(data as Photo[])
    setLoading(false)
  }
  useEffect(() => { load() }, [effectiveCollegeId, filter])

  // Approve / Unapprove toggle
  async function toggle(id: string, current: boolean) {
    await createClient().from("photos").update({ is_approved: !current }).eq("id", id)
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, is_approved: !current } : p))
  }

  // Delete karo (Cloudinary + DB)
  async function del(id: string) {
    if (!confirm("Delete this photo permanently?")) return
    await fetch(`/api/photos/${id}`, { method: "DELETE" })
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      <p className="label">Admin · Photos</p>
      <h1 className="font-serif text-5xl">Manage Photos</h1>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        {(["all", "approved", "pending"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 border-ink transition-colors
              ${filter === f ? "bg-ink text-paper-light" : "bg-paper hover:bg-paper-light"}`}>
            {f === "all" ? "All" : f === "approved" ? "✓ Approved" : "⏳ Pending"}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted self-center">{photos.length} photos</span>
      </div>

      {/* Grid */}
      {loading
        ? <p className="mt-10 text-muted">Loading…</p>
        : photos.length === 0
        ? <p className="mt-10 text-muted">No photos found.</p>
        : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map(p => (
              <div key={p.id} className={`border-2 ${p.is_approved ? "border-ink/30" : "border-rust"} bg-paper-light overflow-hidden`}>
                {/* Photo thumbnail */}
                <div className="relative">
                  <img src={p.thumbnail_url ?? p.image_url} className="aspect-square w-full object-cover" />
                  {!p.is_approved && (
                    <div className="absolute top-1 left-1 bg-rust text-white text-[10px] font-bold px-1.5 py-0.5 uppercase">Pending</div>
                  )}
                </div>
                {/* Caption + action buttons */}
                <div className="p-2">
                  <p className="text-xs truncate text-muted">{p.caption || "No caption"}</p>
                  <div className="mt-2 flex gap-1">
                    {/* Approve/Unapprove */}
                    <button onClick={() => toggle(p.id, p.is_approved)}
                      className={`flex-1 text-[10px] font-bold uppercase py-1 border transition-colors
                        ${p.is_approved
                          ? "border-rust text-rust hover:bg-rust hover:text-white"
                          : "border-teal text-teal hover:bg-teal hover:text-white"}`}>
                      {p.is_approved ? "Unapprove" : "Approve"}
                    </button>
                    {/* Delete */}
                    <button onClick={() => del(p.id)}
                      className="text-[10px] font-bold uppercase py-1 px-2 border border-rust text-rust hover:bg-rust hover:text-white transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
