import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
        // PKCE ki jagah implicit flow use karo
        // PKCE mein code_verifier browser storage mein chahiye
        // Implicit mein seedha token URL hash mein aata hai
        // Next.js + Vercel pe implicit zyada reliable hai
      }
    }
  )
}
