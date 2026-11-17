// ============================================================
// FILE: app/api/events/route.ts — COLLEGE EVENTS LIST API
// ============================================================
// Endpoint: GET /api/events
//
// PURPOSE:
// Returns the list of events for the currently logged-in student's college.
// Used to populate event dropdowns on photo upload and filter bars.
//
// HOW IT WORKS:
// 1. Authenticates the requesting user via Supabase session cookies
// 2. Looks up the student's profile to determine their college_id
// 3. Queries the `events` table filtered strictly by that college_id
// 4. Returns the events sorted by year in descending order (newest first)
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // 1. Initialize server-side Supabase client with request cookies
  const supabase = await createClient()

  // 2. Verify user authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // 3. Retrieve student's college_id for strict campus isolation
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('college_id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile?.college_id) {
    // If onboarding is incomplete or college not chosen, return empty list
    return NextResponse.json([], { status: 200 })
  }

  // 4. Query events for this specific college
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, name, year')
    .eq('college_id', profile.college_id)
    .order('year', { ascending: false })

  if (eventsError) {
    console.error('Error fetching events:', eventsError.message)
    return NextResponse.json(
      { error: 'Could not fetch events' },
      { status: 500 }
    )
  }

  // 5. Return events array
  return NextResponse.json(events ?? [])
}
