// ============================================================
// FILE: app/api/photos/[id]/report/route.ts — PHOTO REPORT API
// ============================================================
// Endpoint: POST /api/photos/[id]/report
//
// PURPOSE:
// Allows authenticated users to report inappropriate photos.
// When reported:
// 1. Verifies the user is logged in
// 2. Checks if the photo exists in the database
// 3. Flags the photo (is_approved = false) for admin review
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create server-side Supabase client with user's cookies
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // 2. Extract photo ID from URL params (Next.js 15/16 async params)
  const { id } = await params

  // 3. Parse report reason from request body (optional with fallback)
  let reason = 'No reason provided'
  try {
    const body = await request.json()
    if (body?.reason && typeof body.reason === 'string') {
      reason = body.reason.trim()
    }
  } catch {
    // Body was empty or not valid JSON; keep default reason
  }

  // 4. Verify photo exists in the database
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('id')
    .eq('id', id)
    .single()

  if (fetchError || !photo) {
    return NextResponse.json(
      { error: 'Photo not found' },
      { status: 404 }
    )
  }

  // 5. Flag the photo: set is_approved = false for admin moderation
  let { error: updateError } = await supabase
    .from('photos')
    .update({ is_approved: false })
    .eq('id', id)

  // If standard client update was blocked by RLS policies, use service role key if available
  if (updateError && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { error: adminError } = await adminSupabase
      .from('photos')
      .update({ is_approved: false })
      .eq('id', id)

    updateError = adminError
  }

  if (updateError) {
    console.error('Report photo update error:', updateError.message)
    return NextResponse.json(
      { error: 'Could not report photo' },
      { status: 500 }
    )
  }

  console.log(`[Photo Moderation] Photo ${id} reported by user ${user.id}. Reason: "${reason}"`)

  return NextResponse.json({
    success: true,
    message: 'Photo reported for review',
  })
}
