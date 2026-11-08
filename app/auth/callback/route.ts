import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorParam = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  if (errorParam) {
    const errorDesc = requestUrl.searchParams.get('error_description') ?? 'Login failed'
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(errorDesc)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const response = NextResponse.redirect(`${origin}/onboarding`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // cookieStore se padho — yahan PKCE verifier hogi
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // Session cookies response pe set karo
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
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
      console.error('Exchange error code:', code.substring(0, 8))
      console.error('Exchange error message:', error.message)
      console.error('Exchange error status:', error.status)
      // Cookies jo available hain log karo (names only, not values)
      const cookieNames = cookieStore.getAll().map(c => c.name)
      console.error('Available cookies:', cookieNames.join(', '))
      return NextResponse.redirect(`${origin}/?error=auth_failed&reason=${encodeURIComponent(error.message)}`)
    }

    return response
  }

  return NextResponse.redirect(`${origin}/`)
}
