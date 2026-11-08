import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        // PKCE flow use karo — Supabase ?code= bhej raha hai
        // code_verifier browser storage mein save hota hai login ke time
        // confirm page pe exchangeCodeForSession() se verify hota hai
        detectSessionInUrl: true,
        persistSession: true,
        // Session localStorage mein save karo (refresh ke baad bhi rahe)
      }
    }
  )
}
