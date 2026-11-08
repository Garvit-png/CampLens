// ============================================================
// FILE: lib/supabase/server.ts — SERVER SIDE SUPABASE CLIENT
// ============================================================
// Yeh file SERVER components aur API routes ke liye Supabase
// connection banati hai.
//
// KAB USE KARO:
//   - API routes: app/api/*/route.ts
//   - Server components (bina 'use client' ke)
//   - Middleware
//
// CLIENT vs SERVER ka fark:
//   client.ts → browser mein chalta hai, cookies directly access
//   server.ts → server pe chalta hai, Next.js cookies() use karta hai
//
// IMPORTANT:
//   Server client SERVICE_ROLE_KEY bhi use kar sakta hai (agar chahiye)
//   Service role = RLS bypass kar sakta hai (admin operations ke liye)
//   Normal operations mein ANON_KEY use karo
// ============================================================

import { createServerClient } from '@supabase/ssr'
// createServerClient → server-side ke liye, cookies manually handle karta hai

import { cookies } from 'next/headers'
// Next.js ka cookies() function — server pe request/response cookies access karna

export async function createClient() {
  // async isliye kyunki cookies() Next.js 15 mein async hai
  const cookieStore = await cookies()
  // cookieStore = current request ki saari cookies
  // Session token yahan store hota hai

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Server pe bhi ANON_KEY use karo (RLS policies apply hongi)
    // SERVICE_ROLE_KEY sirf tab use karo jab RLS bypass karna ho (admin tasks)

    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
      },
      cookies: {
        // Supabase ko batao cookies kaise padhne aur likhne hain
        getAll() {
          return cookieStore.getAll()
          // Saari cookies return karo — Supabase session cookie dhundhega
        },
        setAll(cookiesToSet) {
          // Naye cookies set karo (jaise session refresh hone pe)
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component mein cookies set nahi ho sakti (read-only)
            // Yeh error ignore kar sakte hain — middleware handle karega
          }
        },
      },
    }
  )
}

// USAGE EXAMPLE in an API route:
//
// import { createClient } from '@/lib/supabase/server'
//
// export async function GET() {
//   const supabase = await createClient()
//
//   // Check karo user logged in hai
//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) return Response.json({ error: 'Not logged in' }, { status: 401 })
//
//   // Data fetch karo
//   const { data: photos } = await supabase.from('photos').select('*')
//   return Response.json(photos)
// }
