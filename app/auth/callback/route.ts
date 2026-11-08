// ============================================================
// FILE: app/auth/callback/route.ts
// ============================================================
// Magic link click karne ke baad Supabase yahan redirect karta hai.
// Do types ke tokens handle karte hain:
//   1. "code" (PKCE flow) — newer Supabase versions
//   2. hash fragments — older flow (Supabase client handle karta hai)
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/onboarding'
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // Vercel pe cookies sahi set hon isliye explicit options
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }

    // Success — onboarding pe redirect
    const response = NextResponse.redirect(`${origin}${next}`)
    return response
  }

  // Code nahi mila — ghar pe bhejo
  return NextResponse.redirect(`${origin}/`)
}
