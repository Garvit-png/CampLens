import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const errorParam = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  if (errorParam) {
    const errorDesc = requestUrl.searchParams.get('error_description') ?? 'Login failed'
    return NextResponse.redirect(`${origin}/?error=auth_error&reason=${encodeURIComponent(errorDesc)}`)
  }

  // Implicit flow: token hash (#access_token=...) mein hota hai
  // Server hash nahi padh sakta — client pe bhejo
  // /auth/confirm page hash se session set karega
  return NextResponse.redirect(`${origin}/auth/confirm`)
}
