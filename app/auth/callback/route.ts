import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorParam = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  if (errorParam) {
    const errorDesc = requestUrl.searchParams.get('error_description') ?? 'Login failed'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDesc)}`)
  }

  if (code) {
    // IMPORTANT: response pehle banao, phir cookies us response pe set karo
    // Yeh Vercel pe properly kaam karta hai
    const response = NextResponse.redirect(`${origin}/onboarding`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // REQUEST se cookies padho (incoming)
          getAll() {
            return request.cookies.getAll()
          },
          // RESPONSE pe cookies set karo (outgoing)
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Dono jagah set karo — request aur response dono
              request.cookies.set(name, value)
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
              })
            })
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Code exchange error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    console.log('Session created for:', data.user?.email)
    return response
  }

  return NextResponse.redirect(`${origin}/`)
}
