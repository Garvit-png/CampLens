// ============================================================
// FILE: app/api/college/route.ts — CURRENT USER'S COLLEGE INFO API
// ============================================================
// Endpoint: GET /api/college
//
// PURPOSE:
// Returns complete college information for the authenticated student,
// including college name, short abbreviation, city, and verified domains.
//
// HOW IT WORKS:
// 1. Verifies the user is authenticated via Supabase session
// 2. Joins `profiles` with `colleges` and nested `college_email_domains`
// 3. Returns the joined college data object
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // 1. Initialize server-side Supabase client with request cookies
  const supabase = await createClient()

  // 2. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // 3. Query user's profile and join colleges + college_email_domains
  // Supabase automatically traverses Foreign Key relationships:
  // profiles.college_id -> colleges.id -> college_email_domains.college_id
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      college_id,
      colleges (
        id,
        name,
        short_name,
        city,
        college_email_domains ( domain )
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json(
      { error: 'Profile not found' },
      { status: 404 }
    )
  }

  if (!profile.colleges) {
    return NextResponse.json(
      { error: 'No college associated with this profile' },
      { status: 404 }
    )
  }

  // 4. Return full college details
  return NextResponse.json(profile.colleges)
}
