import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
        // Implicit flow use karo — PKCE Vercel pe kaam nahi karta
        // Implicit mein token URL hash mein aata hai, code verifier nahi chahiye
        detectSessionInUrl: true,
        // Hash se automatically session detect karo
      },
    }
  )
}
