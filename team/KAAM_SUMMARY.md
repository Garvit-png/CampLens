# 📊 Sabne Kya Kiya — CampusLens Progress Report

> Ab tak ki mehnat ka saaf summary — kya bana, kyun bana, kaise kaam karta hai.

---

## 🟢 GARVIT — Project Lead

### Kya kiya?
Garvit ne **poora project ka base** banaya. Iske bina baaki kisi ka kaam kaam nahi karta.

---

### 1. Next.js Project Setup
**File:** `package.json`, `tsconfig.json`, `next.config.ts`

Matlab: Garvit ne **project ki neenv rakhi**.
- Next.js install kiya (website ka framework)
- TypeScript setup kiya (code mein type checking)
- Tailwind CSS setup kiya (styling ke liye)

Analogy: Jaise ghar banana shuru karne se pehle zameen levelize karna aur blueprint banana.

---

### 2. TypeScript Types Banaye
**File:** `types/index.ts`

```
College    → college ka naam, city, email domain
CampusEvent → event ka naam, kaunse college ka, kaunse saal ka
Photo      → image URL, caption, hashtags, kaunse college ka
SessionUser → logged-in student ki email, naam, batch year
```

**Kyun zaroori?**
Agar Japinder `photo.imageUrl` ki jagah `photo.image_url` likh de → TypeScript turant error dega.
Poori team ek hi "language" mein baat karti hai — galti ki chance zero.

---

### 3. Mock Data Banaya
**File:** `lib/mockData.ts`

Supabase database ready nahi tha toh Garvit ne **fake data** banaya — 4 colleges, 12 events, 21 photos.

```
Colleges:  Rishihood University, Northfield, St. Aurelia, Riverbend
Events:    Damru 2026, Khatam 2026, Hack Night, Sports Day...
Photos:    21 photos — har college ke events ki
```

**Kyun zaroori?**
Baaki sab (Keshav ki gallery, Vansh ka search) is data se test kar sake bina database ke.
Jab Supabase ready hoga tab sirf yeh ek file replace hogi — baaki code same rahega.

---

### 4. Session System Banaya
**File:** `lib/session.tsx`

**Yeh kya karta hai?**
Website ko "yaad" rakhta hai ki kaunsa user logged in hai aur usne kaunsa college select kiya.

```
User steps:
1. College select karo (Rishihood)     → session mein save
2. Email se login karo                  → session mein save
3. Apna naam aur batch year dalo       → session mein save
4. Page refresh karo                   → sab yaad rahega (localStorage se)
5. Sign out karo                       → sab clear
```

**React Context kya hota hai?**
Normal mein ek page se dusre page ko data pass karne ke liye props use hote hain.
Session context mein data ek jagah rakhte hain — koi bhi page `useSession()` likh ke seedha data le sakta hai.

---

### 5. Helper Functions Banaye
**File:** `lib/helpers.ts`

Chhote chhote functions jo poori app mein baar baar use hote hain:

| Function | Kya karta hai | Example |
|----------|--------------|---------|
| `formatDate()` | Date readable banata hai | `"2026-03-15"` → `"15 Mar 2026"` |
| `filmDate()` | Film camera style date | `"2026-03-15"` → `"'26 3 15"` |
| `getInitials()` | College ke initials | `"Rishihood University"` → `"RU"` |
| `parseHashtags()` | Text se hashtags nikalo | `"#Damru26 #Night"` → `["Damru26", "Night"]` |
| `filterPhotos()` | Year/event/search filter | Gallery mein filtering ke liye |
| `getPopularTags()` | Sabse popular hashtags | Homepage pe trending tags dikhane ke liye |
| `sortNewestFirst()` | Nayi photos pehle | Gallery mein order ke liye |

---

### 6. Poora Frontend Banaya
**Files:** `app/` ke saare pages

Garvit ne working pages banaye:

| Page | URL | Kya karta hai |
|------|-----|--------------|
| Landing Page | `/` | Home — CampusLens ka intro |
| Login | `/login` | Email se sign in |
| Onboarding | `/onboarding` | College aur profile setup |
| Gallery | `/gallery` | Photos dekhna, filter karna |
| Upload | `/upload` | Photos + captions + events upload karna |
| Photo Detail | `/photo/[id]` | Ek photo ki full detail |
| Profile | `/profile` | Apni profile dekhna |
| Error Page | `/error.tsx` | Kuch gadbad ho toh |
| 404 Page | `/not-found.tsx` | Page nahi mila toh |

---

### 7. UI Components Banaye
**Files:** `components/` folder

Reusable components — ek baar banao, kahin bhi use karo:

| Component | Kya karta hai |
|-----------|--------------|
| `Navbar.tsx` | Top navigation bar |
| `GalleryView.tsx` | Photos ki grid + filters |
| `PhotoCard.tsx` | Ek photo ka card (thumbnail + caption) |
| `EmptyState.tsx` | Jab koi data nahi — "Koi photo nahi mili" |
| `CollegeStamp.tsx` | College ka postage stamp style badge |
| `TagStamp.tsx` | Hashtag ka stamp style badge |
| `Footer.tsx` | Page ka bottom section |
| `ReportButton.tsx` | Photo report karne ka button |
| `RequireSession.tsx` | Agar login nahi kiya toh redirect karo |
| `Developing.tsx` | "Coming Soon" placeholder |

---

## 🟡 JAPINDER — Backend Logic Helper

### Kya kiya?
Japinder ne **4 utility files** banaye — pure logic, koi UI nahi.

---

### 1. Hashtag Extraction + Database Save
**File:** `lib/hashtags.ts`

**Problem:** User caption likhta hai: `"Freshers night! #Damru26 #IITD #NeverForget"`
**Solution:** Japinder ka code automatically `#` wale words nikaal ke database mein save karta hai.

```
Caption: "Freshers night! #Damru26 #IITD #NeverForget"
                                ↓
        extractHashtags() → ["Damru26", "IITD", "NeverForget"]
                                ↓
        saveHashtagsToDatabase() → database mein save
                                ↓
        photo_tags table → photo ↔ tag connection
```

**3 functions banaye:**
- `extractHashtags(caption)` → caption se tags nikalo
- `saveHashtagsToDatabase(supabase, photoId, hashtags, collegeId)` → save karo
- `processPhotoHashtags(...)` → dono ek saath (yeh Garvit call karega)

**Interesting part:** Agar `#Damru26` pehle se database mein hai → sirf `usage_count` badhao. Naya hai → naya row banao.

---

### 2. File Upload Validation
**File:** `lib/validateUpload.ts`

Jab user koi file upload kare, pehle check karo ki sahi file hai:

```
validateUpload(file) check karta hai:
  ✅ File type: sirf JPEG, PNG, WEBP allowed
  ✅ File size: max 5MB
  ❌ Word file upload karo → "Only JPEG, PNG and WEBP allowed"
  ❌ 10MB photo upload karo → "File size must be less than 5 MB"
```

**Kyun zaroori?** Bina validation ke koi 100MB video upload kar sakta tha — server crash ho jaata.

---

### 3. Date Formatting
**File:** `lib/formatDate.ts`

*(File create ki, populate hona abhi baaki hai — Japinder ka pending kaam)*

---

### 4. Search Helpers
**File:** `lib/searchHelpers.ts`

*(File create ki, populate hona abhi baaki hai — Japinder ka pending kaam)*

---

## 🔵 VANSH — Search API

### Kya kiya?
**File:** `app/api/route.ts`

Vansh ne **search ka API route** banana shuru kiya.

```typescript
// app/api/route.ts
import { NextRequest, NextResponse } from "next/server"
```

Abhi yeh Next.js API route ka skeleton hai — search logic add hona baaki hai.

**Yeh file kya karegi jab complete hogi:**
```
Browser: GET /api?search=Damru26
              ↓
API Route: Database mein Damru26 tag wali photos dhundho
              ↓
Browser: Photos ki list wapas aao
```

---

## 🟣 KESHAV — Team Documentation

### Kya kiya?
**Branch:** `keshav-b`

Keshav ne team documentation update ki — har member ki README files mein kaam clearly divide kiya taaki koi confusion na ho.

---

## 📊 OVERALL PROJECT STATUS

```
✅ Project setup (Next.js, TypeScript, Tailwind)
✅ Database schema designed (types/index.ts)
✅ Mock data ready (21 photos, 4 colleges, 12 events)
✅ Session system (login, college select, persist)
✅ Poora UI ready (9 pages, 10 components)
✅ Hashtag logic (extract + save to DB)
✅ Upload validation (type + size check)
✅ All branches merged — no conflicts

🔄 Abhi baaki hai:
⬜ Supabase connect karna (real database)
⬜ Cloudinary connect karna (real image upload)
⬜ Search API complete karna (Vansh)
⬜ formatDate.ts aur searchHelpers.ts complete karna (Japinder)
⬜ Vercel pe deploy karna
```

---

## 🗂️ SAARI FILES KA MAP

```
CampusLens/
│
├── app/                          ← GARVIT — Pages
│   ├── page.tsx                  ← Landing page
│   ├── login/page.tsx            ← Login
│   ├── onboarding/page.tsx       ← College + profile setup
│   ├── error.tsx                 ← Error page
│   ├── not-found.tsx             ← 404 page
│   ├── (main)/
│   │   ├── gallery/page.tsx      ← Gallery
│   │   ├── upload/page.tsx       ← Upload
│   │   ├── photo/[id]/page.tsx   ← Photo detail
│   │   └── profile/page.tsx      ← Profile
│   └── api/
│       └── route.ts              ← VANSH — Search API (incomplete)
│
├── components/                   ← GARVIT — UI components
│   ├── Navbar.tsx
│   ├── GalleryView.tsx
│   ├── PhotoCard.tsx
│   └── ... (7 more)
│
├── lib/                          
│   ├── mockData.ts               ← GARVIT — Fake data
│   ├── session.tsx               ← GARVIT — Login state
│   ├── helpers.ts                ← GARVIT — Utility functions
│   ├── hashtags.ts               ← JAPINDER — Hashtag logic ✅
│   ├── validateUpload.ts         ← JAPINDER — File validation ✅
│   ├── formatDate.ts             ← JAPINDER — Date format (pending)
│   └── searchHelpers.ts          ← JAPINDER — Search helpers (pending)
│
├── types/
│   └── index.ts                  ← GARVIT — TypeScript types
│
└── team/                         ← KESHAV — Team docs
    ├── GARVIT.md
    ├── JAPINDER.md
    ├── KESHAV.md
    ├── VANSH.md
    └── TEAM_README.md
```
