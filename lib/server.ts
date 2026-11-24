// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// lib/server.ts — BACKEND ONLY
// Sirf app/api/ routes mein import karo
// Browser mein import mat karo — crash karega
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { createClient } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"
import { extractTags } from "@/lib/utils"

// Admin check — har API route ke shuru mein call karo
// Return: { error } agar admin nahi, { user, profile } agar admin hai
export async function requireAdmin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  if (!user)
    return { error: NextResponse.json({ error: "Login required" }, { status: 401 }), user: null, profile: null }

  const { data: profile } = await sb
    .from("profiles").select("id, college_id, role").eq("user_id", user.id).single()

  if (!profile || profile.role !== "admin")
    return { error: NextResponse.json({ error: "Admin only" }, { status: 403 }), user: null, profile: null }

  return { error: null, user, profile }
}

// Photo upload ke baad hashtags DB mein save karo
// caption ke #tags + form ke tags — dono combine karke save hote hain
export async function saveHashtags(
  sb: any,
  photoId: string,
  caption: string,
  hashtags: string[],
  collegeId: string
) {
  const allTags = [...new Set([...hashtags, ...extractTags(caption)])]

  for (const name of allTags) {
    const { data: existing } = await sb
      .from("tags").select("id, usage_count")
      .eq("name", name).eq("college_id", collegeId).maybeSingle()

    let tagId: string
    if (existing) {
      tagId = existing.id
      await sb.from("tags").update({ usage_count: existing.usage_count + 1 }).eq("id", tagId)
    } else {
      const { data: t } = await sb.from("tags")
        .insert({ name, college_id: collegeId, usage_count: 1 }).select("id").single()
      if (!t) continue
      tagId = t.id
    }

    await sb.from("photo_tags")
      .upsert({ photo_id: photoId, tag_id: tagId }, { onConflict: "photo_id,tag_id", ignoreDuplicates: true })
  }

  return allTags
}
