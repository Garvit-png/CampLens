// ============================================================
// FILE: app/auth/callback/route.ts
// ============================================================
// Jab user email mein magic link click karta hai, Supabase usse
// yahan redirect karta hai: /auth/callback?code=XXXX
//
// YEH FILE KYA KARTI HAI:
//   1. URL se "code" parameter padhta hai
//   2. Supabase se code exchange karke real session banata hai
//   3. User ko onboarding pe redirect karta hai
//
// FLOW:
//   User email link click kare
//     → /auth/callback?code=abc123
//     → Code exchange → session cookie set
//     → /onboarding pe redirect
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // GET handler — browser yahan GET request bhejta hai

  const requestUrl = new URL(request.url)
  // URL object banao — parameters easily nikal sako

  const code = requestUrl.searchParams.get('code')
  // URL se "code" parameter nikalo
  // Example URL: /auth/callback?code=pkce_abc123xyz
  // code = "pkce_abc123xyz"

  const origin = requestUrl.origin
  // Origin = base URL, jaise "http://localhost:3000"

  if (code) {
    // Code mila → Supabase se exchange karo
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
            // Session cookie yahan set hoti hai
            // Browser isko save karega → har request mein bhejega
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    // exchangeCodeForSession:
    //   Code → Supabase server pe verify karo
    //   Agar valid → session create karo + cookie set karo
    //   Agar invalid/expired → error aayega

    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
      // Error aaya → login pe wapas bhejo with error indicator
    }
  }

  return NextResponse.redirect(`${origin}/onboarding`)
  // Success → onboarding pe jao (naam + batch bharna hai)
}
