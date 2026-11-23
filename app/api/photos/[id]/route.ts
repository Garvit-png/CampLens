// ============================================================
// FILE: app/api/photos/[id]/route.ts — PHOTO DELETE API
// ============================================================
// [id] = dynamic route segment in Next.js App Router
// Calling DELETE /api/photos/123 -> id = "123"
//
// FLOW:
// 1. Verify user is authenticated with Supabase session
// 2. Fetch photo record from DB to verify ownership
// 3. Delete image asset from Cloudinary storage
// 4. Delete photo record from Supabase PostgreSQL database
// ============================================================

import { createClient } from '@/lib/supabaseServer'
import { v2 as cloudinary } from 'cloudinary'
import { type NextRequest, NextResponse } from 'next/server'

// Configure Cloudinary SDK with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create server-side Supabase client with request cookies
  const supabase = await createClient()

  // 1. Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // Next.js 15/16: params is a Promise that must be awaited
  const { id } = await params

  // 2. Fetch photo from database to check ownership and retrieve Cloudinary public ID
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('id, cloudinary_public_id, uploader_id, profiles(user_id)')
    .eq('id', id)
    .single()

  if (fetchError || !photo) {
    return NextResponse.json(
      { error: 'Photo not found' },
      { status: 404 }
    )
  }

  // 3. Security check: Only the photo uploader can delete their photo
  const profileData = Array.isArray(photo.profiles) ? photo.profiles[0] : photo.profiles
  const uploaderUserId = (profileData as { user_id: string } | null)?.user_id

  if (uploaderUserId !== user.id) {
    return NextResponse.json(
      { error: 'Not authorized' },
      { status: 403 } // 403 Forbidden: authenticated user lacks permission
    )
  }

  // 4. Delete the file from Cloudinary (storage cleanup)
  if (photo.cloudinary_public_id) {
    try {
      await cloudinary.uploader.destroy(photo.cloudinary_public_id)
    } catch (err) {
      console.error('Cloudinary delete error:', err)
      // Even if Cloudinary fails or asset was already removed, proceed with DB deletion
    }
  }

  // 5. Delete photo record from Supabase database (RLS also verifies owner)
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('Database delete error:', dbError.message)
    return NextResponse.json(
      { error: 'Could not delete photo' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
