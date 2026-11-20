// Server-side admin check — API routes mein use karo
// Returns: { user, profile } if admin, throws NextResponse if not
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }), user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, college_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }), user: null, profile: null }
  }

  return { error: null, user, profile }
}
