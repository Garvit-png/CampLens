import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        // detectSessionInUrl: URL hash se token detect karo
        // Google OAuth ke baad hash mein token aata hai
        // Supabase automatically parse karta hai
      }
    }
  )
}
