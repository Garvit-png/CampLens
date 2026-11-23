'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/services/session'
import Developing from '@/components/ui/Developing'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdminReady, isAdmin } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isAdminReady) return
    if (!isAdmin) { router.replace('/login'); return }
  }, [isAdminReady, isAdmin, router])

  if (!isAdminReady || !isAdmin) return <Developing text="Checking permissions…" />

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b-2 border-ink bg-ink text-paper-light">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3 text-xs font-bold uppercase tracking-widest">
          <span className="text-rust">Admin Panel</span>
          <a href="/admin" className="hover:text-rust transition-colors">Dashboard</a>
          <a href="/admin/upload" className="hover:text-rust transition-colors">Upload Photos</a>
          <a href="/admin/events" className="hover:text-rust transition-colors">Events</a>
          <a href="/admin/photos" className="hover:text-rust transition-colors">Manage Photos</a>
          <a href="/gallery" className="ml-auto hover:text-rust transition-colors">← Back to Gallery</a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </div>
    </div>
  )
}
