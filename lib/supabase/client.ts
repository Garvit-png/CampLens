import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // createBrowserClient by default cookies use karta hai
  // PKCE code_verifier cookies mein store hota hai
  // Isliye koi custom storage override mat karo
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
