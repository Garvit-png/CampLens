import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
        // persistSession: true → session localStorage mein save hoti hai
        // Browser band karo, dobara kholo → session wahi rehti hai
        // Sirf explicit logout ya token expire hone pe jaati hai
        autoRefreshToken: true,
        // autoRefreshToken: true → session automatically refresh hoti rehti hai
        // Access token 1 hour mein expire hota hai
        // Refresh token use karke silently naya token leta hai
        // User ko pata bhi nahi chalta — seamless experience
      }
    }
  )
}
