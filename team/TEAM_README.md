# 🎓 CampusLens — Team Work Division

> **4 log, ek project, saaf division.**
> Har kisi ka kaam alag hai — conflict avoid karne ke liye.

---

## 👥 TEAM MEMBERS & UNKA KAAM

| Member | Role | Main Kaam |
|--------|------|-----------|
| **Garvit** 👑 | Project Lead | Setup, Database, Auth, Deployment |
| **Japinder** 📸 | Upload & Gallery | Photo upload, Gallery page, Cloudinary |
| **Keshav** 🎨 | UI & Design | Navbar, Landing page, Profile, Components |
| **Vansh** 🔍 | Search & Testing | Hashtag search, Photo detail, Error pages |

---

## 📂 APNI FILE DEKHO

```
team/
├── GARVIT.md     ← Garvit padho yeh
├── JAPINDER.md   ← Japinder padho yeh  
├── KESHAV.md     ← Keshav padho yeh
└── VANSH.md      ← Vansh padho yeh
```

---

## 🗺️ PROJECT KA MAP — KONSI FILE KISKA

```
CampusLens/
│
├── app/
│   ├── page.tsx                    🎨 KESHAV (landing page design)
│   ├── layout.tsx                  👑 GARVIT (root layout)
│   │
│   ├── login/page.tsx              👑 GARVIT
│   ├── signup/page.tsx             👑 GARVIT
│   ├── onboarding/page.tsx         👑 GARVIT
│   ├── profile/page.tsx            🎨 KESHAV
│   │
│   ├── gallery/page.tsx            📸 JAPINDER
│   ├── upload/page.tsx             📸 JAPINDER
│   │
│   ├── search/page.tsx             🔍 VANSH
│   ├── photo/[id]/page.tsx         🔍 VANSH
│   │
│   ├── not-found.tsx               🔍 VANSH (404 page)
│   ├── error.tsx                   🔍 VANSH (error page)
│   │
│   └── api/
│       ├── cloudinary-signature/   👑 GARVIT (mushkil — signed URL + auth check)
│       └── photos/route.ts         👑 GARVIT (photo database mein save)
│
├── lib/
│   ├── hashtags.ts                 📸 JAPINDER (caption → hashtags nikalna + save)
│   ├── Navbar.tsx                  🎨 KESHAV
│   └── ui/
│       ├── LoadingSpinner.tsx      🎨 KESHAV
│       └── EmptyState.tsx          🎨 KESHAV
│
├── lib/
│   └── supabase/
│       ├── client.ts               👑 GARVIT
│       └── server.ts               👑 GARVIT
│
└── supabase/
    └── migrations/                 👑 GARVIT (SQL files)
```

---

## 📅 TIMELINE — KAB KYA KARNA HAI

### Din 1 (Sabka setup)
- **Garvit**: GitHub repo banao, Next.js setup karo, .env.example banao
- **Japinder, Keshav, Vansh**: Clone karo, branch banao, `npm run dev` chalao

### Din 2-3 (Parallel kaam)
- **Garvit**: Supabase setup, database tables, Auth, Cloudinary signature API, photo save API
- **Japinder**: `lib/hashtags.ts` — extractHashtags() + saveHashtagsToDatabase() banana
- **Keshav**: Navbar + Landing page design
- **Vansh**: Error pages + Search page UI

### Din 4-5 (Integration)
- **Japinder**: Cloudinary integrate karo, actual upload karo
- **Vansh**: Search API connect karo database se
- **Keshav**: Profile page data connect karo
- **Garvit**: Sab kuch test karo, bugs fix karo

### Din 6 (Final)
- **Garvit**: Vercel pe deploy karo
- **Vansh**: Final testing karo (testing checklist)
- **Sablog**: README update karo, demo ready karo

---

## 🔄 GIT RULES (Sabko follow karna hai)

### Branch Names
```
garvit-main-setup
japinder-upload-gallery
keshav-ui-components
vansh-search-detail
```

### Roz karo yeh
```bash
# Subah pehle latest code lo
git pull origin main

# Apni branch pe switch karo
git checkout apni-branch-ka-naam

# Kaam karo...

# Shaam mein save karo
git add .
git commit -m "kya kiya describe karo"
git push origin apni-branch-ka-naam
```

### KABHI MAT KARO
```bash
# ❌ Main branch pe seedha push mat karo
git push origin main

# ❌ .env.local commit mat karo
git add .env.local
```

---

## 📱 TEAM COMMUNICATION

Ek WhatsApp group banao: **"CampusLens Dev"**

**Roz share karo:**
- ✅ "Aaj maine yeh kiya: ..."
- 🐛 Bug mile toh: "Bug found in /upload — ..."
- ❓ Help chahiye: "Koi samjhao yeh kya hai: ..."
- 🔔 Koi cheez ready ho: "@Japinder, Supabase ready hai, keys bhej raha hoon"

---

## 🆘 PHAS JAO TOH

1. **Apni README padho** — GARVIT.md / JAPINDER.md / KESHAV.md / VANSH.md
2. **Error Google karo** — error message copy karo, paste karo Google mein
3. **WhatsApp group mein pucho** — screenshot ke saath
4. **Garvit se pucho** — woh project lead hai

### Useful Links
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com
- Supabase: https://supabase.com/docs
- Cloudinary: https://cloudinary.com/documentation

---

## ✅ PROJECT COMPLETE CHEKLIST

```
Stage 1 — Setup
[ ] GitHub repo ready (Garvit)
[ ] Next.js project running (Garvit)
[ ] Sabne clone kar liya (Japinder, Keshav, Vansh)

Stage 2 — Database
[ ] Supabase project ready (Garvit)
[ ] colleges table ready (Garvit)
[ ] profiles table ready (Garvit)
[ ] photos/tags tables ready (Garvit)

Stage 3 — Auth
[ ] Signup kaam karta hai (Garvit)
[ ] Login kaam karta hai (Garvit)
[ ] Email verify hoti hai (Garvit)

Stage 4 — UI
[ ] Navbar ready (Keshav)
[ ] Landing page ready (Keshav)
[ ] Profile page ready (Keshav)

Stage 5 — Upload
[ ] Photo upload kaam karta hai (Japinder)
[ ] Cloudinary integration done (Japinder)

Stage 6 — Gallery & Search
[ ] Gallery page ready (Japinder)
[ ] Search kaam karta hai (Vansh)
[ ] Photo detail page ready (Vansh)

Stage 7 — Final
[ ] Deployment done (Garvit)
[ ] Testing complete (Vansh)
[ ] Demo ready (Sablog)
```
