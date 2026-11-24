// ─────────────────────────────────────────────
// db.ts — Sab database utilities ek jagah
// ─────────────────────────────────────────────
// 1. fetchColleges()         → landing page pe colleges load karo
// 2. saveHashtags()          → photo upload hone ke baad tags save karo
// 3. requireAdmin()          → API route mein admin check karo
// ─────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js"
import type { College } from "@/types"
import { createClient } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"
import { extractTags } from "@/lib/utils"

// ── Colleges ──────────────────────────────────

// Supabase se saare active colleges lo
export async function fetchColleges(supabase: SupabaseClient): Promise<College[]> {
  const { data } = await supabase
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

// ── Hashtags ──────────────────────────────────

// Caption se tags nikalo aur DB mein save karo
export async function saveHashtags(supabase: any, photoId: string, caption: string, hashtags: string[], collegeId: string) {
  // Combine: form ke tags + caption ke inline tags
  const allTags = [...new Set([...hashtags, ...extractTags(caption)])]

  for (const name of allTags) {
    // Tag already hai?
    const { data: existing } = await supabase
      .from("tags")
      .select("id, usage_count")
      .eq("name", name)
      .eq("college_id", collegeId)
      .maybeSingle()

    let tagId: string

    if (existing) {
      // Hai → sirf count badhao
      tagId = existing.id
      await supabase.from("tags").update({ usage_count: existing.usage_count + 1 }).eq("id", tagId)
    } else {
      // Nahi hai → naya banao
      const { data: newTag } = await supabase
        .from("tags")
        .insert({ name, college_id: collegeId, usage_count: 1 })
        .select("id")
        .single()
      if (!newTag) continue
      tagId = newTag.id
    }

    // Photo ↔ Tag link karo
    await supabase
      .from("photo_tags")
      .upsert({ photo_id: photoId, tag_id: tagId }, { onConflict: "photo_id,tag_id", ignoreDuplicates: true })
  }

  return allTags
}

// ── Admin Guard ───────────────────────────────

// API route mein call karo — admin nahi hai toh error return karta hai
export async function requireAdmin() {
  const supabase = await createClient()

  // User logged in hai?
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: "Login required" }, { status: 401 }), user: null, profile: null }
  }

  // User ka role admin hai?
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, college_id, role")
    .eq("user_id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin only" }, { status: 403 }), user: null, profile: null }
  }

  return { error: null, user, profile }
}
