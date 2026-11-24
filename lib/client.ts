// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// lib/client.ts — FRONTEND ONLY
// Sirf React components mein import karo
// API routes mein mat use karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import type { SupabaseClient } from "@supabase/supabase-js"
import type { College } from "@/types"

// Supabase se saare active colleges lo (home page pe use hota hai)
export async function fetchColleges(sb: SupabaseClient): Promise<College[]> {
  const { data } = await sb
    .from("colleges")
    .select("id, name, city, college_email_domains(domain)")
    .eq("is_active", true)
    .order("name")

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    city: c.city ?? "",
    emailDomains: (c.college_email_domains ?? []).map((d: any) => d.domain),
  }))
}
