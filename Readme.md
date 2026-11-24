# CampusLens

College memories platform. Admin photos upload karta hai. Students bina login ke dekh sakte hain.

---

## Folder Structure

```
app/
│
├── page.tsx              ← Home: College + Batch choose karo
├── login/                ← Admin Google login
├── auth/confirm/         ← Google login ke baad session set hota hai
│
├── (main)/               ← STUDENT PAGES (no login needed)
│   ├── gallery/          ← Photos grid + search + filters
│   └── photo/[id]/       ← Ek photo ki detail
│
├── admin/                ← ADMIN PAGES (login required)
│   ├── page.tsx          ← Dashboard: stats + quick links
│   ├── upload/           ← Batch photo upload
│   ├── events/           ← Events create/delete
│   └── photos/           ← Photos approve/delete
│
└── api/                  ← BACKEND API ROUTES (server-side)
    ├── admin/upload/     ← POST: photo DB mein save karo
    │                       GET:  Cloudinary signature do
    └── photos/[id]/      ← DELETE: photo hata do (Cloudinary + DB)

components/               ← UI pieces (sirf visuals, koi logic nahi)
├── Navbar.tsx            ← Top bar
├── Footer.tsx            ← Bottom bar
├── GalleryView.tsx       ← Gallery ka poora UI (search, filters, grid)
├── PhotoCard.tsx         ← Ek photo ka polaroid card
├── CollegeStamp.tsx      ← College ka stamp (home page)
├── TagStamp.tsx          ← Hashtag stamp (gallery)
├── EmptyState.tsx        ← "Koi data nahi" message
└── Developing.tsx        ← Loading spinner

lib/                      ← LOGIC (backend + frontend dono)
├── db.ts                 ← BACKEND: DB queries + admin check
│                            fetchColleges(), saveHashtags(), requireAdmin()
├── session.tsx           ← FRONTEND: Global state (college, photos, admin)
│                            useSession() — koi bhi component use kar sakta hai
├── helpers.ts            ← SHARED: Pure functions (no DB, no React)
│                            filterPhotos(), formatDate(), parseTags()
├── supabaseClient.ts     ← DB connection for BROWSER (components mein use karo)
└── supabaseServer.ts     ← DB connection for SERVER (API routes mein use karo)

types/index.ts            ← TypeScript types: Photo, College, CampusEvent
supabase/schema.sql       ← Database tables SQL (run once in Supabase dashboard)
```

---

## Student Flow
```
/ → College choose karo → Batch choose karo → /gallery → photos dekho + filter karo
```

## Admin Flow
```
/login → Google login → /admin → /admin/upload → photos upload karo
```

---

## Tech Stack
| Cheez | Kya |
|-------|-----|
| Framework | Next.js 16 |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth (sirf admin) |
| Images | Cloudinary |
| Deploy | Vercel |
