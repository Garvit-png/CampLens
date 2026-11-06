# 👨‍💻 KESHAV KA KAAM — CampusLens Project

> **Keshav UI Components aur Profile ka kaam karega.**
> Tera kaam hai: Navbar, Landing Page design, Profile Page, aur reusable UI components.

---

## 📋 TERA TOTAL KAAM (Quick Summary)

| # | Kaam | Stage |
|---|------|-------|
| 1 | Navbar component banana | Stage 1/3 |
| 2 | Landing page design | Stage 1 |
| 3 | Profile page banana | Stage 4 |
| 4 | Reusable UI components (Button, Card, etc.) | Stage 3-6 |
| 5 | Loading aur Error states | Stage 6 |

---

## 💻 PEHLE YEH KARO (Setup)

### Step 1: Project clone karo
```bash
git clone https://github.com/garvit-username/CampusLens.git
cd CampusLens
npm install
```

### Step 2: Environment variables setup karo
```bash
cp .env.example .env.local
# Garvit se Supabase keys maango aur .env.local mein daalo
```

### Step 3: Project chalao
```bash
npm run dev
# http://localhost:3000 pe dekho
```

### Step 4: Apni branch banao
```bash
git checkout -b keshav-ui-components
```

---

## 🎨 KAAM 1 — Navbar Component

### Samjho: Navbar kya hota hai?
Navbar = Website ka top bar jo har page pe dikhai deta hai.
Isme hoga: Logo, Links (Gallery, Upload), Login/Logout button.

### File: `components/Navbar.tsx`

```typescript
'use client'
// 'use client' isliye — onClick, hover events handle karne hain

import Link from 'next/link'
// Link → Next.js ka special component
// Normal <a href> se behtar hai — page reload nahi hoti (faster!)

import { useState } from 'react'

export default function Navbar() {
  // Mobile mein hamburger menu ke liye
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      {/*
        sticky top-0  → scroll karne pe bhi top pe chipka rahega
        z-50         → baaki sab content ke upar dikhega (z-index)
        shadow-sm    → thodi si shadow neeche
      */}

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* h-16 = height: 64px */}

          {/* ===== LOGO / BRAND NAME ===== */}
          <Link href="/" className="flex items-center gap-2">
            {/* gap-2 = 8px space between logo icon and text */}
            <span className="text-2xl">📷</span>
            <span className="font-bold text-xl text-indigo-600">
              CampusLens
            </span>
          </Link>

          {/* ===== DESKTOP NAVIGATION LINKS ===== */}
          {/* md:flex → medium screen (768px+) pe dikhao, mobile pe chhupao */}
          <div className="hidden md:flex items-center gap-6">
            
            <Link
              href="/gallery"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Gallery
            </Link>

            <Link
              href="/upload"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Upload
            </Link>

            <Link
              href="/profile"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Profile
            </Link>

            {/* Login Button */}
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg 
                         font-medium hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
          </div>

          {/* ===== MOBILE HAMBURGER BUTTON ===== */}
          {/* md:hidden → sirf mobile pe dikhao */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-600 p-2"
            aria-label="Menu toggle"
            // aria-label → screen readers ke liye (accessibility)
          >
            {/* Agar menu open hai toh X dikhao, warna ≡ (hamburger) */}
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* ===== MOBILE DROPDOWN MENU ===== */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-3">
            <Link href="/gallery" className="text-gray-600 px-2 py-1">Gallery</Link>
            <Link href="/upload" className="text-gray-600 px-2 py-1">Upload</Link>
            <Link href="/profile" className="text-gray-600 px-2 py-1">Profile</Link>
            <Link href="/login" className="text-gray-600 px-2 py-1">Login</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
```

### Navbar ko layout mein add karo
`app/layout.tsx` mein Garvit ko bolna hai yeh add kare:
```typescript
import Navbar from '@/components/Navbar'

// <body> ke andar:
<Navbar />
{children}
```

---

## 🎨 KAAM 2 — Landing Page Design

### File: `app/page.tsx` (Garvit ke saath milke karo)

```typescript
// SlicedWaves animation component (tuhe banana hai)
// Landing page ka complete design tera kaam hai

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main>
      
      {/* ===== HERO SECTION ===== */}
      <section className="min-h-[90vh] flex flex-col items-center 
                           justify-center text-center px-4 
                           bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900
                           relative overflow-hidden">
        {/*
          min-h-[90vh]  → 90% of viewport height
          items-center  → horizontal center
          justify-center → vertical center
          relative       → SlicedWaves animation andar position hogi
          overflow-hidden → animation edges pe clip ho
        */}

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 
                        relative z-10">
          {/* z-10 → text animation ke upar dikhega */}
          Your College
          <br />
          <span className="text-transparent bg-clip-text 
                           bg-gradient-to-r from-orange-400 to-pink-500">
            Memories
          </span>
          {/*
            text-transparent → text transparent karo
            bg-clip-text     → background sirf text ke andar dikhega
            bg-gradient-to-r → left se right gradient
            Result: gradient colored text!
          */}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-indigo-200 mb-10 max-w-2xl relative z-10">
          Upload, explore, aur apne college ke moments hamesha ke liye 
          preserve karo. #Damru26 se lekar Graduation tak.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 flex-wrap justify-center relative z-10">
          <Link
            href="/signup"
            className="bg-white text-indigo-900 px-8 py-4 rounded-full 
                       font-bold text-lg hover:bg-indigo-50 transition-all
                       hover:scale-105 shadow-lg"
            // hover:scale-105 → hover pe 5% bada ho (nice effect)
          >
            🚀 Shuru Karo
          </Link>
          <Link
            href="/gallery"
            className="border-2 border-white text-white px-8 py-4 
                       rounded-full font-bold text-lg hover:bg-white/10 
                       transition-all"
            // bg-white/10 → 10% opacity white background
          >
            📷 Gallery Dekho
          </Link>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            CampusLens mein kya hai?
          </h2>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-2xl bg-indigo-50 
                            hover:bg-indigo-100 transition-colors">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Photos Upload Karo
              </h3>
              <p className="text-gray-600">
                Events, trips, hostel life — sab kuch share karo apne batchmates ke saath
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-2xl bg-purple-50 
                            hover:bg-purple-100 transition-colors">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Hashtag Search
              </h3>
              <p className="text-gray-600">
                #Damru26, #Khatam, #Freshers2024 — apne moments instantly dhundho
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-2xl bg-pink-50 
                            hover:bg-pink-100 transition-colors">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Batch Archives
              </h3>
              <p className="text-gray-600">
                Year aur batch ke hisaab se photos organize — 2020 batch ke memories alag
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
```

---

## 👤 KAAM 3 — Profile Page

### File: `app/profile/page.tsx`

```typescript
'use client'

import { useState } from 'react'

export default function ProfilePage() {
  // User ka data (baad mein database se aayega)
  const [profile, setProfile] = useState({
    display_name: 'Garvit Sharma',
    batch_year: 2022,
    bio: 'CSE student | Photography enthusiast',
    college: 'IIT Delhi',
    avatar_url: '',
  })
  
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          
          {/* Avatar + Name */}
          <div className="flex items-center gap-6 mb-8">
            
            {/* Avatar Circle */}
            <div className="w-24 h-24 rounded-full bg-indigo-100 
                            flex items-center justify-center text-4xl
                            border-4 border-indigo-200">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" 
                       className="w-full h-full rounded-full object-cover" />
                : '👤'
              }
            </div>

            {/* Name + College */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {profile.display_name}
              </h1>
              <p className="text-indigo-600 font-medium">{profile.college}</p>
              <p className="text-gray-500 text-sm">Batch of {profile.batch_year}</p>
            </div>
          </div>

          {/* Bio */}
          {!isEditing ? (
            // View Mode
            <div className="mb-6">
              <h3 className="text-gray-500 text-sm font-medium mb-1">Bio</h3>
              <p className="text-gray-700">{profile.bio || 'Koi bio nahi add ki abhi'}</p>
            </div>
          ) : (
            // Edit Mode
            <div className="mb-6">
              <label className="block text-gray-500 text-sm font-medium mb-1">
                Bio Edit Karo
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                // {...profile} → profile ka sara data copy karo
                // bio: e.target.value → sirf bio update karo
                className="w-full border border-gray-300 rounded-lg p-3 
                           resize-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          )}

          {/* Edit / Save Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg 
                       hover:bg-indigo-700 transition-colors"
          >
            {isEditing ? '💾 Save karo' : '✏️ Edit karo'}
          </button>
        </div>

        {/* My Photos Section */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Meri Photos
          </h2>
          {/* Empty state */}
          <div className="text-center py-10 text-gray-400">
            <div className="text-5xl mb-3">📷</div>
            <p>Abhi tak koi photo upload nahi ki</p>
          </div>
        </div>

      </div>
    </div>
  )
}
```

---

## 🧩 KAAM 4 — Reusable UI Components

### File: `components/ui/LoadingSpinner.tsx`

```typescript
// Loading Spinner — jab data load ho raha ho tab dikhao

export default function LoadingSpinner({ message = 'Load ho raha hai...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {/* Spinning circle */}
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 
                      rounded-full animate-spin" />
      {/*
        border-4          → 4px border
        border-indigo-200 → light color (circle part)
        border-t-indigo-600 → top part dark (jo ghoomta dikhta hai)
        rounded-full      → perfect circle
        animate-spin      → Tailwind spin animation
      */}
      <p className="text-gray-500">{message}</p>
    </div>
  )
}
```

### File: `components/ui/EmptyState.tsx`

```typescript
// Empty State — jab koi data nahi ho

type EmptyStateProps = {
  emoji: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  emoji,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg 
                     hover:bg-indigo-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// Usage example:
// <EmptyState
//   emoji="📭"
//   title="Koi photos nahi"
//   description="Pehli photo upload karo!"
//   actionLabel="Upload Karo"
//   onAction={() => router.push('/upload')}
// />
```

---

## 📁 KESHAV KI FILES

```
app/
├── page.tsx                     ← Landing page design (tera)
└── profile/
    └── page.tsx                 ← Profile page (tera)

components/
├── Navbar.tsx                   ← Navbar (tera)
└── ui/
    ├── LoadingSpinner.tsx       ← Loading component (tera)
    ├── EmptyState.tsx           ← Empty state component (tera)
    └── PhotoCard.tsx            ← Photo card (Japinder ke saath)
```

---

## 🔄 Git Workflow

```bash
git pull origin main
git checkout keshav-ui-components

# Kaam karo...

git add .
git commit -m "Navbar: mobile responsive menu add kiya"
git push origin keshav-ui-components
```

---

## 💡 Design Tips

- **Mobile pehle socho** — `grid-cols-1 md:grid-cols-3` pattern use karo
- **Consistent colors** — indigo-600 primary, gray-800 headings, gray-500 secondary text
- **Spacing** — p-4 (small), p-6 (medium), p-8 (large) — consistent rakho
- **Hover effects** — `hover:bg-indigo-700 transition-colors` — har button pe
