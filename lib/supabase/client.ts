import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
        // Google OAuth ke liye implicit flow use karo
        // PKCE mein code_verifier cookie chahiye — cross-origin issue hota hai
        // Implicit mein seedha token milta hai — koi verifier nahi
        detectSessionInUrl: true,
      }
    }
  )
}
