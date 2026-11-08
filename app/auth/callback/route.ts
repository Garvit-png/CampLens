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
    // Code ko client page pe bhejo — wahan browser localStorage mein
    // code_verifier available hoga (PKCE)
    // Server pe code_verifier nahi hota
    return NextResponse.redirect(`${origin}/auth/confirm?code=${code}`)
  }

  return NextResponse.redirect(`${origin}/`)
}
