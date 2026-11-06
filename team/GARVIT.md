# 👨‍💻 GARVIT KA KAAM — CampusLens Project

> **Garvit sabse zyada kaam karega. Woh Project Lead hai.**
> Tera kaam hai: Project setup, Database, Authentication, aur final deployment.

---

## 📋 TERA TOTAL KAAM (Quick Summary)

| # | Kaam | Stage |
|---|------|-------|
| 1 | Project setup karna | Stage 1 |
| 2 | Database tables banana | Stage 2 |
| 3 | Login / Signup banana | Stage 3 |
| 4 | College selection + Profile | Stage 4 |
| 5 | Photo upload feature | Stage 5 |
| 6 | Final testing + Deployment | Stage 7 |

---

## 🚀 STAGE 1 — Project Setup (Pehla Din)

### Step 1: GitHub pe repository banao
1. GitHub.com pe jao
2. "New Repository" click karo
3. Naam rakho: `CampusLens`
4. "Public" select karo
5. "Create Repository" click karo

### Step 2: Project apne computer pe clone karo
```bash
# Terminal kholo aur yeh type karo:
git clone https://github.com/YOUR_USERNAME/CampusLens.git
cd CampusLens
```

### Step 3: Next.js project banao
```bash
# Yeh command Next.js project setup karti hai
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```
Jab puchhe toh:
- Would you like to use ESLint? → **Yes**
- Would you like to use `src/` directory? → **No**
- Import alias? → **@/***

### Step 4: Project chalao aur check karo
```bash
npm run dev
```
Browser mein jao: `http://localhost:3000`
Agar page dikhe → Setup sahi hua! ✅

### Step 5: Folder structure banao
```bash
mkdir -p app/components app/lib app/types supabase/migrations
```

### Step 6: .env.example file banao
```bash
# .env.example file mein yeh likho (actual values nahi, sirf names):
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 7: Team ke liye branch structure banao
```bash
git checkout -b main
git add .
git commit -m "Stage 1: Project setup complete"
git push origin main
```

---

## 🗄️ STAGE 2 — Database Banana (Doosra Din)

### Step 1: Supabase account banao
1. `https://supabase.com` pe jao
2. "Start your project" click karo
3. GitHub se login karo
4. "New Project" click karo
5. Naam rakho: `camplens`
6. Password strong rakho (save kar lo!)
7. Region: `South Asia (Mumbai)` select karo
8. "Create new project" click karo
9. ~2 minute wait karo

### Step 2: Supabase keys copy karo
1. Left side mein "Settings" click karo
2. "API" click karo
3. Yeh copy karo aur `.env.local` mein paste karo:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Database migrations banao
Supabase dashboard mein "SQL Editor" pe jao aur yeh SQL run karo:

**Migration 1: colleges table**
```sql
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  city VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thoda sample data dalo testing ke liye
INSERT INTO colleges (name, short_name, city) VALUES
('Indian Institute of Technology Delhi', 'IITD', 'Delhi'),
('Delhi Technological University', 'DTU', 'Delhi'),
('Netaji Subhas University of Technology', 'NSUT', 'Delhi');
```

**Migration 2: college_email_domains table**
```sql
CREATE TABLE college_email_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO college_email_domains (college_id, domain) VALUES
((SELECT id FROM colleges WHERE short_name='IITD'), 'iitd.ac.in'),
((SELECT id FROM colleges WHERE short_name='DTU'), 'dtu.ac.in'),
((SELECT id FROM colleges WHERE short_name='NSUT'), 'nsut.ac.in');
```

**Migration 3: profiles table**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  display_name VARCHAR(100),
  batch_year INTEGER CHECK (batch_year >= 1990 AND batch_year <= 2030),
  bio TEXT,
  avatar_url TEXT,
  is_onboarding_complete BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security ON karo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_email_domains ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view colleges" ON colleges
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view domains" ON college_email_domains
  FOR SELECT USING (true);
```

### Step 4: Supabase package install karo
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 5: Supabase client file banao
`lib/supabase/client.ts` file banao:
```typescript
import { createBrowserClient } from '@supabase/ssr'

// Yeh function browser (client side) ke liye Supabase connection banata hai
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## 🔐 STAGE 3 — Login / Signup (Teesra Din)

### Step 1: Supabase Auth settings configure karo
1. Supabase dashboard → "Authentication" → "Settings"
2. "Email Auth" → Enable karo
3. "Confirm email" → Enable karo (important for college email verify)
4. Site URL: `http://localhost:3000`
5. Redirect URLs mein add karo: `http://localhost:3000/auth/callback`

### Step 2: Auth callback route banao
`app/auth/callback/route.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/onboarding', request.url))
}
```

### Step 3: Git push karo
```bash
git add .
git commit -m "Stage 2+3: Database + Auth setup"
git push origin main
```

---

## 📸 STAGE 5 — Photo Upload + Cloudinary (Tera + Japinder ka kaam)

> **Division:**
> - **Garvit** → Cloudinary setup, signed upload API, photo database mein save, RLS policies
> - **Japinder** → `lib/hashtags.ts` — caption se hashtags nikalna aur tags table mein save karna
> Teri API complete hone ke baad Japinder ki function call hogi automatically.

### Step 1: Cloudinary account banao
1. `https://cloudinary.com` pe jao
2. Free account banao
3. Dashboard pe **Cloud Name**, **API Key**, **API Secret** copy karo
4. `.env.local` mein paste karo:
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret   # KABHI browser mein mat daalna
```

### Step 2: Cloudinary package install karo
```bash
npm install cloudinary
```

### Step 3: Photos + Events + Tags tables banao (Supabase SQL Editor mein)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  event_date DATE,
  academic_year VARCHAR(9),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  caption TEXT,
  cloudinary_public_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE photo_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  CONSTRAINT unique_photo_tag UNIQUE(photo_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;

-- Photos ke liye RLS policies
CREATE POLICY "Students can view their college photos" ON photos
  FOR SELECT USING (
    college_id IN (
      SELECT college_id FROM profiles WHERE user_id = auth.uid()
    )
    AND is_approved = TRUE
  );

CREATE POLICY "Students can upload photos" ON photos
  FOR INSERT WITH CHECK (
    uploader_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can delete own photos" ON photos
  FOR DELETE USING (
    uploader_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view photo_tags" ON photo_tags FOR SELECT USING (true);
```

### Step 4: Cloudinary Signature API banao
`app/api/cloudinary-signature/route.ts`:
```typescript
// Yeh server-side route hai — browser ko KABHI API secret nahi milta
// Browser pehle yahan aata hai → signature maangta hai → phir Cloudinary pe jaata hai
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST() {
  // Pehle check karo: user logged in hai?
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Login karo pehle' }, { status: 401 })
    // 401 = Unauthorized
  }

  // Current time (Unix timestamp — seconds mein)
  const timestamp = Math.round(Date.now() / 1000)

  // Cloudinary signature banao — yeh prove karta hai upload valid hai
  // API secret se sign hoti hai — isliye sirf server pe hoti hai
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'camplens' },
    process.env.CLOUDINARY_API_SECRET!
  )

  // Browser ko sirf timestamp aur signature bhejo — secret nahi
  return NextResponse.json({
    timestamp,
    signature,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  })
}
```

### Step 5: Photo Save API banao (upload ke baad call hogi)
`app/api/photos/route.ts`:
```typescript
// Jab Cloudinary pe upload ho jaaye, browser yeh API call karega
// Photo ki details + Cloudinary URL database mein save karne ke liye
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { processPhotoHashtags } from '@/lib/hashtags'
// Japinder ki function — hashtags nikaalke save karegi

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  // User verify karo
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Login karo pehle' }, { status: 401 })
  }

  // User ka profile lo (college_id ke liye)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, college_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.college_id) {
    return NextResponse.json({ error: 'Pehle college select karo' }, { status: 400 })
  }

  // Request body se data nikalo
  const body = await request.json()
  const { cloudinaryPublicId, imageUrl, thumbnailUrl, caption, eventId } = body

  // Validation — zaroori fields check karo
  if (!cloudinaryPublicId || !imageUrl) {
    return NextResponse.json({ error: 'Image URL missing hai' }, { status: 400 })
  }

  // Photo database mein save karo
  const { data: photo, error: photoError } = await supabase
    .from('photos')
    .insert({
      uploader_id: profile.id,
      college_id: profile.college_id,
      event_id: eventId || null,
      caption: caption || null,
      cloudinary_public_id: cloudinaryPublicId,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl || null,
    })
    .select('id')
    .single()

  if (photoError || !photo) {
    console.error('Photo save error:', photoError?.message)
    return NextResponse.json({ error: 'Photo save nahi hui' }, { status: 500 })
  }

  // Japinder ki function call karo — hashtags nikaal ke save karo
  if (caption) {
    await processPhotoHashtags(supabase, photo.id, caption, profile.college_id)
  }

  return NextResponse.json({ success: true, photoId: photo.id })
}
```

### Step 6: Git push karo
```bash
git add .
git commit -m "Stage 5: Cloudinary upload API + photo save API ready"
git push origin main
```

---

## 🚢 STAGE 7 — Deployment (Last Din)

### Step 1: Vercel account banao
1. `https://vercel.com` pe jao
2. GitHub se login karo
3. "Add New Project" click karo
4. CampusLens repo select karo
5. Environment variables add karo (saari `.env.local` wali)
6. "Deploy" click karo

### Step 2: Supabase mein production URL add karo
1. Supabase → Authentication → Settings
2. Site URL: `https://your-app.vercel.app`
3. Redirect URLs: `https://your-app.vercel.app/auth/callback`

### Step 3: Final check karo
- [ ] Login kaam karta hai?
- [ ] Photo upload hoti hai?
- [ ] Gallery dikhti hai?
- [ ] Search kaam karta hai?

---

## 📁 GARVIT KI FILES (jo tujhe banana/edit karna hai)

```
CampusLens/
├── app/
│   ├── layout.tsx                          ← Root layout (tera)
│   ├── page.tsx                            ← Landing page (tera)
│   ├── auth/
│   │   └── callback/route.ts               ← Auth callback (tera)
│   ├── login/page.tsx                      ← Login page (tera)
│   ├── signup/page.tsx                     ← Signup page (tera)
│   ├── onboarding/page.tsx                 ← College selection (tera)
│   └── api/
│       ├── cloudinary-signature/route.ts   ← Cloudinary signed URL (tera)
│       └── photos/route.ts                 ← Photo save to DB (tera)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       ← Browser Supabase client (tera)
│   │   └── server.ts                       ← Server Supabase client (tera)
│   ├── hashtags.ts                         ← JAPINDER KA KAAM (woh banayega)
│   └── types.ts                            ← TypeScript types (tera)
├── supabase/
│   └── migrations/                         ← SQL files (tera)
├── .env.local                              ← Real secrets (KABHI COMMIT MAT KARNA)
├── .env.example                            ← Template (tera)
└── vercel.json                             ← Deployment config (tera)
```

---

## ⚠️ IMPORTANT RULES (yaad rakh)

1. **`.env.local` kabhi GitHub pe mat daalna** — secrets leak ho jaayenge
2. **Har din commit karo** — `git add . && git commit -m "kya kiya"`
3. **Kuch kaam karo toh team ko batao** — WhatsApp group mein update do
4. **Koi cheez samajh na aaye toh pehle Google karo**, phir team se pucho

---

## 🆘 Help chahiye?

- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Tailwind docs: https://tailwindcss.com/docs
