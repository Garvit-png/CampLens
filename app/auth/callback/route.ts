import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const errorParam = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  if (errorParam) {
    const errorDesc = requestUrl.searchParams.get('error_description') ?? 'Login failed'
    return NextResponse.redirect(`${origin}/?error=auth_error&reason=${encodeURIComponent(errorDesc)}`)
  }

  // Google OAuth implicit flow mein token URL hash mein hota hai:
  // /auth/callback#access_token=xxx&token_type=bearer&...
  //
  // PROBLEM: Server-side redirect hash preserve nahi karta
  // SOLUTION: Client-side HTML page return karo jo hash ke saath redirect kare
  //
  // Yeh HTML page browser mein run hoga aur hash including
  // /auth/confirm pe redirect karega
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Signing you in…</title>
  <script>
    // Hash ke saath /auth/confirm pe redirect karo
    // location.hash = "#access_token=xxx&..."
    window.location.replace('/auth/confirm' + window.location.hash);
  </script>
</head>
<body>
  <p>Signing you in…</p>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
