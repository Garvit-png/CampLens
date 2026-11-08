import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorParam = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  // Error aaya URL mein (jaise expired link)
  if (errorParam) {
    const errorDesc = requestUrl.searchParams.get('error_description') ?? 'Login failed'
    console.error('Auth error from Supabase:', errorParam, errorDesc)
    // Login page pe bhejo with error message
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDesc)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
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
      console.error('Code exchange error:', error.message)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      )
    }

    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}/`)
}
