// ============================================================
// FILE: app/api/photos/route.ts
// ============================================================
// Cloudinary upload ke BAAD yeh route call hota hai.
// Photo ki details + Cloudinary URL Supabase DB mein save karta hai.
// Japinder ka processPhotoHashtags() bhi yahan call hota hai.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { extractHashtags, saveHashtagsToDatabase } from '@/lib/hashtags'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // User verify karo
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // User ka profile lo (college_id ke liye)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, college_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.college_id) {
    return NextResponse.json({ error: 'Profile not complete' }, { status: 400 })
  }

  // Request body se data nikalo
  const body = await request.json()
  const { cloudinaryPublicId, imageUrl, thumbnailUrl, caption, hashtags, eventId, year } = body

  if (!cloudinaryPublicId || !imageUrl) {
    return NextResponse.json({ error: 'Missing image data' }, { status: 400 })
  }

  // Security: sirf apne Cloudinary account ki images allow karo
  // (warna koi bhi random URL DB mein daal sakta tha)
  const cloudPrefix = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/`
  const isOurCloudinary = (url: unknown) => typeof url === 'string' && url.startsWith(cloudPrefix)
  if (!isOurCloudinary(imageUrl) || (thumbnailUrl && !isOurCloudinary(thumbnailUrl))) {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
  }

  // Hashtags: upload form ke tags + caption mein likhe #tags — dono
  const cleanTags: string[] = Array.isArray(hashtags)
    ? hashtags.filter((t: unknown): t is string => typeof t === 'string' && t.trim() !== '').slice(0, 20)
    : []
  const allTags = [...new Set([...cleanTags, ...extractHashtags(caption || '')])]

  // Photo Supabase mein save karo
  const { data: photo, error: photoError } = await supabase
    .from('photos')
    .insert({
      uploader_id: profile.id,
      college_id: profile.college_id,
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
    console.error('Photo save error:', photoError?.message)
    return NextResponse.json({ error: 'Could not save photo' }, { status: 500 })
  }

  // Japinder ka function — hashtags tags table mein save karo.
  // Photo already save ho chuki hai, toh tag save fail ho toh bhi upload fail mat karo
  // (photos.hashtags column mein tags already hain — gallery search usi se chalta hai)
  try {
    await saveHashtagsToDatabase(supabase, photo.id, allTags, profile.college_id)
  } catch (err) {
    console.error('Hashtag save error (photo saved anyway):', err)
  }

  return NextResponse.json({ success: true, photoId: photo.id })
}
