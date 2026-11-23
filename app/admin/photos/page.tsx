'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useSession } from '@/lib/session'

interface Photo {
  id: string; image_url: string; thumbnail_url: string | null
  caption: string; is_approved: boolean; uploaded_at: string
  profiles: { full_name: string } | null
  events: { name: string } | null
}

export default function AdminPhotosPage() {
  const { collegeId } = useSession()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [loading, setLoading] = useState(true)

  async function loadPhotos() {
    if (!collegeId) return
    setLoading(true)
    let q = createClient()
      .from('photos')
      .select('id, image_url, thumbnail_url, caption, is_approved, uploaded_at, profiles(full_name), events(name)')
      .eq('college_id', collegeId)
      .order('uploaded_at', { ascending: false })
    if (filter === 'approved') q = q.eq('is_approved', true)
    if (filter === 'pending') q = q.eq('is_approved', false)
    const { data } = await q
    if (data) setPhotos(data as unknown as Photo[])
    setLoading(false)
  }

  useEffect(() => { loadPhotos() }, [collegeId, filter])

  async function toggleApprove(id: string, current: boolean) {
    await createClient().from('photos').update({ is_approved: !current }).eq('id', id)
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, is_approved: !current } : p))
  }

  async function deletePhoto(id: string) {
    if (!confirm('Delete this photo permanently?')) return
    const { data: photo } = await createClient().from('photos').select('cloudinary_public_id').eq('id', id).single()
    // Delete via API (Cloudinary + DB)
    await fetch(`/api/photos/${id}`, { method: 'DELETE' })
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      <p className="label">Admin · Photos</p>
      <h1 className="font-serif text-5xl">Manage Photos</h1>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        {(['all', 'approved', 'pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 border-ink transition-colors
              ${filter === f ? 'bg-ink text-paper-light' : 'bg-paper hover:bg-paper-light'}`}>
            {f === 'all' ? 'All' : f === 'approved' ? '✓ Approved' : '⏳ Pending'}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted self-center">{photos.length} photos</span>
      </div>

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="mt-10 text-muted">No photos found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map(photo => (
            <div key={photo.id} className={`border-2 ${photo.is_approved ? 'border-ink/30' : 'border-rust'} bg-paper-light overflow-hidden`}>
              <div className="relative">
                <img src={photo.thumbnail_url || photo.image_url} alt={photo.caption}
                  className="aspect-square w-full object-cover" />
                {!photo.is_approved && (
                  <div className="absolute top-1 left-1 bg-rust text-white text-[10px] font-bold px-1.5 py-0.5 uppercase">
                    Pending
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs truncate text-muted">{photo.caption || 'No caption'}</p>
                <p className="text-[10px] text-muted mt-0.5">{photo.profiles?.full_name ?? 'Admin'}</p>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => toggleApprove(photo.id, photo.is_approved)}
                    className={`flex-1 text-[10px] font-bold uppercase py-1 border ${photo.is_approved
                      ? 'border-rust text-rust hover:bg-rust hover:text-white'
                      : 'border-teal text-teal hover:bg-teal hover:text-white'
                    } transition-colors`}>
                    {photo.is_approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button onClick={() => deletePhoto(photo.id)}
                    className="text-[10px] font-bold uppercase py-1 px-2 border border-rust text-rust hover:bg-rust hover:text-white transition-colors">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
