import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const errorParam = requestUrl.searchParams.get('error')

  if (errorParam) {
    const errorDesc = requestUrl.searchParams.get('error_description') ?? 'Login failed'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDesc)}`)
  }

  // Implicit flow mein token URL hash (#) mein aata hai
  // Server-side hash nahi padh sakta — client page pe bhejo
  // /auth/confirm page browser mein hash se session set karega
  return NextResponse.redirect(`${origin}/auth/confirm`)
}
