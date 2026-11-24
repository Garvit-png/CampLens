"use client"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN LAYOUT (wraps all /admin/* pages)
// Guard: Sirf admin role wale andar ja sakte hain
// Admin nahi hai → /login pe redirect
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/session"
import Developing from "@/components/Developing"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAdminReady } = useSession()
  const router = useRouter()

  // Admin check complete hone ke baad hi redirect karo
  useEffect(() => {
    if (isAdminReady && !isAdmin) router.replace("/login")
  }, [isAdminReady, isAdmin, router])

  // Check ho raha hai ya admin nahi → loading dikhao
  if (!isAdminReady || !isAdmin) return <Developing text="Checking permissions…" />

  return (
    <div className="min-h-screen bg-paper">
      {/* Admin sub-navigation bar */}
      <div className="border-b-2 border-ink bg-ink text-paper-light">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3 text-xs font-bold uppercase tracking-widest">
          <span className="text-rust">Admin</span>
          <a href="/admin"         className="hover:text-rust transition-colors">Dashboard</a>
          <a href="/admin/upload"  className="hover:text-rust transition-colors">Upload</a>
          <a href="/admin/events"  className="hover:text-rust transition-colors">Events</a>
          <a href="/admin/photos"  className="hover:text-rust transition-colors">Photos</a>
          <a href="/gallery"       className="ml-auto hover:text-rust transition-colors">← Gallery</a>
        </div>
      </div>
      {/* Page content */}
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  )
}
