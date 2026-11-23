// Admin-only photo upload API
// 1. Admin verify karo
// 2. Cloudinary signature banao
// 3. Photo metadata DB mein save karo
import { v2 as cloudinary } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/db'
import { createClient } from '@/lib/supabaseServer'
import { saveHashtags } from '@/lib/db'
import { extractTags } from '@/lib/helpers'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET — Cloudinary signature maango
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'camplens/admin' },
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    timestamp,
    signature,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  })
}

// POST — Photo DB mein save karo
export async function POST(request: NextRequest) {
  const { error, profile } = await requireAdmin()
  if (error) return error

  const supabase = await createClient()
  const body = await request.json()
  const { cloudinaryPublicId, imageUrl, thumbnailUrl, caption, hashtags, eventId, year } = body

  if (!cloudinaryPublicId || !imageUrl) {
    return NextResponse.json({ error: 'Missing image data' }, { status: 400 })
  }

  // Extract hashtags from caption + provided hashtags
  const allTags = [...new Set([
    ...(Array.isArray(hashtags) ? hashtags.filter(Boolean) : []),
    ...extractTags(caption || ''),
  ])]

  const { data: photo, error: photoError } = await supabase
    .from('photos')
    .insert({
      uploader_id: profile!.id,
      college_id: profile!.college_id,
      event_id: eventId || null,
      caption: caption || '',
      hashtags: allTags,
      cloudinary_public_id: cloudinaryPublicId,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl || null,
      year: year || new Date().getFullYear(),
      is_approved: true,
    })
    .select('id')
    .single()

  if (photoError || !photo) {
    return NextResponse.json({ error: 'Could not save photo' }, { status: 500 })
  }

  // Save hashtags to tags table
  if (allTags.length > 0) {
    try {
      await saveHashtags(supabase, photo.id, caption, allTags, profile!.college_id)
    } catch (err) {
      console.error('Hashtag save error:', err)
    }
  }

  return NextResponse.json({ success: true, photoId: photo.id })
}
