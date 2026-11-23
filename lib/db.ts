// All database utilities in one place
import type { SupabaseClient } from "@supabase/supabase-js"
import type { College } from "@/types"
import { createClient } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

// ---- College queries ----
interface CollegeRow {
  id: string; name: string; city: string | null
  college_email_domains: { domain: string }[] | null
}
function toCollege(r: CollegeRow): College {
  return { id: r.id, name: r.name, city: r.city ?? "", emailDomains: (r.college_email_domains ?? []).map(d => d.domain) }
}
const COL_SELECT = "id, name, city, college_email_domains(domain)"

export async function fetchColleges(supabase: SupabaseClient): Promise<College[]> {
  const { data } = await supabase.from("colleges").select(COL_SELECT).eq("is_active", true).order("name")
  return ((data ?? []) as CollegeRow[]).map(toCollege)
}

// ---- Hashtag utilities ----
export function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#(\w+)/g)
  if (!matches) return []
  return [...new Set(matches.map(t => t.slice(1)))]
}

export async function saveHashtagsToDatabase(supabase: any, photoId: string, hashtags: string[], collegeId: string) {
  for (const tagName of hashtags) {
    const { data: existing } = await supabase.from("tags").select("id, usage_count").eq("name", tagName).eq("college_id", collegeId).maybeSingle()
    let tagId: string
    if (existing) {
      tagId = existing.id
      await supabase.from("tags").update({ usage_count: existing.usage_count + 1 }).eq("id", tagId)
    } else {
      const { data: newTag } = await supabase.from("tags").insert({ name: tagName, college_id: collegeId, usage_count: 1 }).select("id").single()
      if (!newTag) continue
      tagId = newTag.id
    }
    await supabase.from("photo_tags").upsert({ photo_id: photoId, tag_id: tagId }, { onConflict: "photo_id,tag_id", ignoreDuplicates: true })
  }
}

// ---- Admin guard ----
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }), user: null, profile: null }
  const { data: profile } = await supabase.from("profiles").select("id, college_id, role").eq("user_id", user.id).single()
  if (!profile || profile.role !== "admin") return { error: NextResponse.json({ error: "Admin only" }, { status: 403 }), user: null, profile: null }
  return { error: null, user, profile }
}
