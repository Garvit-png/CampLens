// ============================================================
// FILE: lib/supabase/client.ts — BROWSER SIDE SUPABASE CLIENT
// ============================================================
// Yeh file BROWSER (client-side) components ke liye Supabase
// connection banati hai.
//
// KAB USE KARO:
//   'use client' wale components mein → createClient() call karo
//   Example: Login page, Gallery page (user actions ke liye)
//
// KAB MAT USE KARO:
//   Server components ya API routes mein → wahan server.ts use karo
//
// SECURITY:
//   Yeh NEXT_PUBLIC_ variables use karta hai — browser mein visible hain.
//   Isliye Row Level Security (RLS) zaroori hai database pe.
//   RLS ensure karta hai ki user sirf apna data dekhe.
// ============================================================

import { createBrowserClient } from '@supabase/ssr'
// createBrowserClient → browser ke liye optimized Supabase client
// Automatically cookies handle karta hai session ke liye

export function createClient() {
  // Har baar naya client create karo (lightweight operation hai)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // ! (non-null assertion) → TypeScript ko batao: yeh value zaroor hogi
    // Agar .env.local mein nahi hai → runtime error (intentional)

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // Publishable/anon key — browser mein safe hai
    // RLS policies is key ke saath kaam karti hain
  )
}

// USAGE EXAMPLE in a component:
//
// 'use client'
// import { createClient } from '@/lib/supabase/client'
//
// export default function MyComponent() {
//   const supabase = createClient()
//
//   async function fetchPhotos() {
//     const { data, error } = await supabase
//       .from('photos')
//       .select('*')
//     // RLS automatically sirf logged-in user ke college ki photos dega
//   }
// }
