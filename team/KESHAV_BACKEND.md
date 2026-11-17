# 👨‍💻 KESHAV KA BACKEND KAAM — CampusLens

> **Keshav ab backend tasks karenge.**
> Koi UI nahi banana — sirf API routes aur server-side logic.
> Garvit ka wait mat karo — yeh tasks independent hain.

---

## 📋 TOTAL KAAM (Quick Summary)

| # | Kaam | File | Difficulty |
|---|------|------|------------|
| 1 | Photo delete API | `app/api/photos/[id]/route.ts` | ⭐⭐ Medium |
| 2 | Photo report API | `app/api/photos/[id]/report/route.ts` | ⭐ Easy |
| 3 | Search API real Supabase query | `app/api/search/route.ts` | ⭐⭐ Medium |
| 4 | Events list API | `app/api/events/route.ts` | ⭐ Easy |
| 5 | College info API | `app/api/college/route.ts` | ⭐ Easy |

---

## 💻 SETUP (Sirf ek baar)

```bash
git pull origin main
git checkout -b keshav-backend
npm install
npm run dev
```

---

## 🔴 KAAM 1 — Photo Delete API

### Kya karna hai?
Jab user apni photo delete kare — Cloudinary se bhi hata do, DB se bhi.

### File banao: `app/api/photos/[id]/route.ts`

```typescript
// [id] = dynamic route — /api/photos/abc123 → id = "abc123"
import { createClient } from '@/lib/supabase/server'
import { v2 as cloudinary } from 'cloudinary'
import { type NextRequest, NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  // User logged in hai?
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params
  // URL se photo ID nikalo

  // Photo DB se lo — owner check karne ke liye
  const { data: photo } = await supabase
    .from('photos')
    .select('id, cloudinary_public_id, uploader_id, profiles(user_id)')
    .eq('id', id)
    .single()

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  // Check: sirf owner delete kar sakta hai
  // profiles.user_id current user se match karna chahiye
  const uploaderUserId = (photo.profiles as { user_id: string } | null)?.user_id
  if (uploaderUserId !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    // 403 = Forbidden — logged in ho lekin permission nahi
  }

  // Cloudinary se delete karo
  try {
    await cloudinary.uploader.destroy(photo.cloudinary_public_id)
    // .destroy() = Cloudinary se permanently delete
  } catch (err) {
    console.error('Cloudinary delete error:', err)
    // Cloudinary fail ho toh bhi DB se hatao
  }

  // Database se delete karo
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: 'Could not delete photo' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

### Test karo:
```bash
# Terminal mein (photo ID apna daalo)
curl -X DELETE https://camp-lens.vercel.app/api/photos/YOUR_PHOTO_ID
# 401 aana chahiye (login nahi hai) — sahi hai
```

---

## 🟡 KAAM 2 — Photo Report API

### Kya karna hai?
User inappropriate photo report kare — admin review ke liye flag karo.

### File banao: `app/api/photos/[id]/report/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const reason = body.reason ?? 'No reason provided'
  // Reason kya hai report karne ka

  // Photo exist karta hai?
  const { data: photo } = await supabase
    .from('photos')
    .select('id')
    .eq('id', id)
    .single()

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  // is_approved = false karo — admin review karega
  const { error } = await supabase
    .from('photos')
    .update({
      is_approved: false,
      // Abhi sirf flag karo
      // Future mein alag "reports" table bana sakte ho
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Could not report photo' }, { status: 500 })
  }

  console.log(`Photo ${id} reported by user ${user.id}: ${reason}`)
  // Production mein: email bhejo admin ko

  return NextResponse.json({ success: true, message: 'Photo reported for review' })
}
```

---

## 🔴 KAAM 3 — Search API Real Query

### Kya karna hai?
Abhi search API mock data return karta hai. Real Supabase query lagao.

### File update karo: `app/api/search/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tag = searchParams.get('tag')

  if (!tag || tag.trim() === '') {
    return NextResponse.json(
      { error: 'Search tag is required' },
      { status: 400 }
    )
  }

  const cleanTag = tag.replace('#', '').trim()
  // "#Damru26" → "Damru26"

  const supabase = await createClient()

  // Logged in user ka college lo
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('college_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.college_id) {
    return NextResponse.json({ error: 'Profile incomplete' }, { status: 400 })
  }

  // Photos search karo — hashtags array mein cleanTag dhundho
  const { data: photos, error } = await supabase
    .from('photos')
    .select(`
      id,
      image_url,
      thumbnail_url,
      caption,
      hashtags,
      uploaded_at,
      profiles ( full_name )
    `)
    .eq('college_id', profile.college_id)
    // Sirf apne college ki photos
    .eq('is_approved', true)
    .contains('hashtags', [cleanTag])
    // PostgreSQL array contains: hashtags array mein cleanTag hai?
    .order('uploaded_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Search error:', error.message)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({
    results: photos ?? [],
    total: photos?.length ?? 0,
    tag: cleanTag,
  })
}
```

---

## 🟢 KAAM 4 — Events List API

### Kya karna hai?
College ke events list return karo — upload page dropdown ke liye.

### File banao: `app/api/events/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // User ka college_id lo
  const { data: profile } = await supabase
    .from('profiles')
    .select('college_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.college_id) {
    return NextResponse.json([], { status: 200 })
    // Profile incomplete — khaali list bhejo
  }

  // Is college ke events lo
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, year')
    .eq('college_id', profile.college_id)
    .order('year', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Could not fetch events' }, { status: 500 })
  }

  return NextResponse.json(events ?? [])
}
```

---

## 🟢 KAAM 5 — College Info API

### Kya karna hai?
Current user ke college ki info return karo.

### File banao: `app/api/college/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // User ka college info lo (profile + college join)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      college_id,
      colleges (
        id,
        name,
        short_name,
        city,
        college_email_domains ( domain )
      )
    `)
    .eq('user_id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json(profile.colleges)
  // College ki poori info return karo
}
```

---

## 📁 KESHAV KI FILES

```
app/api/
├── photos/
│   └── [id]/
│       ├── route.ts        ← DELETE photo (Keshav ✅)
│       └── report/
│           └── route.ts    ← POST report (Keshav ✅)
├── search/
│   └── route.ts            ← GET search (Keshav update karega ✅)
├── events/
│   └── route.ts            ← GET events list (Keshav ✅)
└── college/
    └── route.ts            ← GET college info (Keshav ✅)
```

---

## 🔄 Git Workflow

```bash
git pull origin main
git checkout keshav-backend

# Kaam karo...

git add .
git commit -m "Add photo delete API"
git push origin keshav-backend
```

---

## ✅ CHECKLIST

```
[ ] app/api/photos/[id]/route.ts — DELETE endpoint
[ ] app/api/photos/[id]/report/route.ts — POST report
[ ] app/api/search/route.ts — Real Supabase query (mock hatao)
[ ] app/api/events/route.ts — GET events
[ ] app/api/college/route.ts — GET college info
[ ] Garvit ko batao jab sab ready ho
```

---

## ⚠️ Important Rules

1. **Har route mein pehle user verify karo** — `supabase.auth.getUser()`
2. **Owner check karo** delete/update se pehle
3. **`createClient()` server wala use karo** — `@/lib/supabase/server` se
4. **Status codes sahi daalo:**
   - `200` = OK
   - `401` = Not logged in
   - `403` = Logged in but permission nahi
   - `404` = Data nahi mila
   - `500` = Server error
