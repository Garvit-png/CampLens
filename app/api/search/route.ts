// ============================================================
// FILE: app/api/search/route.ts — HASHTAG SEARCH API
// ============================================================
// Endpoint: GET /api/search?tag=Damru26
//
// PURPOSE:
// Searches for approved photos in the user's college that contain
// the specified hashtag in their `hashtags` text array.
//
// HOW IT WORKS:
// 1. Reads 'tag' query parameter and strips any '#' symbol
// 2. Authenticates user and retrieves their college_id
// 3. Executes PostgreSQL array contains query: .contains('hashtags', [cleanTag])
//    (Leverages PostgreSQL GIN index on photos.hashtags for fast lookups)
// 4. Returns matched photo prints sorted newest first
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // 1. Get 'tag' parameter from search query string (e.g. ?tag=Damru26)
  const searchParams = request.nextUrl.searchParams
  const tag = searchParams.get('tag')

  if (!tag || tag.trim() === '') {
    return NextResponse.json(
      { error: 'Search tag is required' },
      { status: 400 }
    )
  }

  // Normalize tag: remove leading '#' and whitespace (e.g., "#Damru26" -> "Damru26")
  const cleanTag = tag.replace('#', '').trim()

  // 2. Initialize server-side Supabase client
  const supabase = await createClient()

  // 3. Ensure user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // 4. Get student's college_id for strict campus isolation
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('college_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.college_id) {
    return NextResponse.json(
      { error: 'Profile incomplete or college not found' },
      { status: 400 }
    )
  }

  // 5. Query photos table with PostgreSQL array containment (@> / .contains)
  // GIN index on photos(hashtags) makes this query highly performant
  const { data: photos, error: searchError } = await supabase
    .from('photos')
    .select(`
      id,
      image_url,
      thumbnail_url,
      caption,
      hashtags,
      uploaded_at,
      profiles ( full_name )
    `)
    .eq('college_id', profile.college_id) // Campus isolation
    .eq('is_approved', true)               // Only approved photos
    .contains('hashtags', [cleanTag])      // Array contains matching tag
    .order('uploaded_at', { ascending: false }) // Newest first
    .limit(50)

  if (searchError) {
    console.error('Search query error:', searchError.message)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }

  // 6. Return search results with metadata
  return NextResponse.json({
    results: photos ?? [],
    total: photos?.length ?? 0,
    tag: cleanTag,
  })
}
