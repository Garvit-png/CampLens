# 👨‍💻 VANSH KA KAAM — CampusLens Project

> **Vansh Hashtag Search, Photo Detail Page, aur Testing ka kaam karega.**
> Tera kaam hai: Search functionality, Photo detail page, aur error handling.

---

## 📋 TERA TOTAL KAAM (Quick Summary)

| # | Kaam | Stage |
|---|------|-------|
| 1 | Hashtag search feature | Stage 6 |
| 2 | Photo detail page | Stage 6 |
| 3 | Error pages (404, 500) | Stage 6 |
| 4 | Testing aur bug reporting | Stage 7 |

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
# Garvit se keys maango aur .env.local mein daalo
```

### Step 3: Project chalao
```bash
npm run dev
# http://localhost:3000 pe dekho
```

### Step 4: Apni branch banao
```bash
git checkout -b vansh-search-detail
```

---

## 🔍 KAAM 1 — Hashtag Search Feature

### Samjho: Search kaise kaam karega?

```
User "#Damru26" type kare
        ↓
Search button click kare ya Enter press kare
        ↓
Hum server ko request bhejein: "Damru26 tag wali photos do"
        ↓
Database mein tags table search ho
        ↓
Matching photos wapas aayein
        ↓
Gallery mein results dikhayein
```

### Step 1: Search API Route banao
`app/api/search/route.ts`:

```typescript
// Yeh server-side API route hai jo database search karega
import { NextRequest, NextResponse } from 'next/server'

// GET request handler
// URL: /api/search?tag=Damru26
export async function GET(request: NextRequest) {
  
  // URL se "tag" parameter nikalo
  // URL example: /api/search?tag=Damru26
  const searchParams = request.nextUrl.searchParams
  const tag = searchParams.get('tag')
  // searchParams.get('tag') → "Damru26" milega
  
  // Agar tag empty hai toh error bhejo
  if (!tag || tag.trim() === '') {
    return NextResponse.json(
      { error: 'Search tag required hai' },
      { status: 400 }
      // 400 = Bad Request (user ne galat request ki)
    )
  }

  // Tag ko clean karo:
  // "#Damru26" → "Damru26" (# remove karo)
  // "  Damru26  " → "Damru26" (extra spaces remove karo)
  // "damru26" → "Damru26" is NOT done — case sensitive search
  const cleanTag = tag.replace('#', '').trim()

  try {
    // TODO: Garvit ke Supabase setup ke baad yahan real query aayegi
    // Abhi ke liye mock data return karo
    const mockResults = [
      {
        id: '1',
        image_url: 'https://picsum.photos/400/300?random=1',
        caption: `Best night ever! #${cleanTag} #memories`,
        uploaded_at: new Date().toISOString(),
      },
      {
        id: '2',
        image_url: 'https://picsum.photos/400/300?random=2',
        caption: `College life 🎓 #${cleanTag}`,
        uploaded_at: new Date().toISOString(),
      },
    ]

    // Results return karo
    return NextResponse.json({
      results: mockResults,
      total: mockResults.length,
      tag: cleanTag,
    })

  } catch (error) {
    // Agar kuch gadbad ho
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search mein kuch problem aayi' },
      { status: 500 }
      // 500 = Internal Server Error (server ki galti)
    )
  }
}
```

### Step 2: Search Page banao
`app/search/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// useRouter → programmatically navigate karne ke liye
// Example: router.push('/gallery') → user ko gallery pe le jao

// TypeScript type: search result photo
type SearchResult = {
  id: string
  image_url: string
  caption: string | null
  uploaded_at: string
}

export default function SearchPage() {
  const router = useRouter()
  
  const [searchInput, setSearchInput] = useState('')
  // User jo type kar raha hai

  const [results, setResults] = useState<SearchResult[]>([])
  // Search results

  const [isSearching, setIsSearching] = useState(false)
  // Loading state

  const [hasSearched, setHasSearched] = useState(false)
  // Kya user ne ek baar bhi search kiya?
  // (Empty state ko "no results" se alag dikhane ke liye)

  const [error, setError] = useState('')
  // Error message

  // Search function
  const handleSearch = async () => {
    const trimmed = searchInput.trim()
    
    // Validation
    if (!trimmed) {
      setError('Kuch toh type karo search karne ke liye!')
      return
    }

    setError('')           // Purani error clear karo
    setIsSearching(true)   // Loading ON
    setHasSearched(true)   // Ab search hua hai

    try {
      // API call karo
      // encodeURIComponent → special characters safe karta hai URL mein
      // Example: "#Damru26" → "%23Damru26"
      const response = await fetch(
        `/api/search?tag=${encodeURIComponent(trimmed)}`
      )

      if (!response.ok) {
        // ok = false agar status 400, 500 etc. ho
        throw new Error('Search fail ho gayi')
      }

      const data = await response.json()
      setResults(data.results)

    } catch (err) {
      setError('Search mein problem aayi. Dobara try karo.')
      setResults([])
    } finally {
      setIsSearching(false) // Loading OFF (success ya fail dono mein)
    }
  }

  // Enter key press pe search karo
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Search Bar Section */}
      <div className="bg-white shadow-sm py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔍 Hashtag Search
          </h1>

          {/* Search Input + Button */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              {/* # symbol dikhao input ke andar (decorative) */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 
                               text-gray-400 font-bold text-lg">
                #
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setError('') // Type karne pe error clear karo
                }}
                onKeyDown={handleKeyDown}
                placeholder="Damru26, Freshers2024, Khatam..."
                className="w-full border-2 border-gray-200 rounded-xl 
                           pl-8 pr-4 py-3 text-lg
                           focus:outline-none focus:border-indigo-500
                           transition-colors"
                // pl-8 → padding-left extra (# ke liye space)
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className={`px-6 py-3 rounded-xl font-semibold text-white
                ${isSearching
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                } transition-colors`}
            >
              {isSearching ? '⏳' : '🔍 Search'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 mt-2 text-sm">⚠️ {error}</p>
          )}

          {/* Popular Tags Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-gray-500 text-sm">Popular:</span>
            {['Damru26', 'Freshers2024', 'Khatam', 'TechFest', 'Graduation'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchInput(tag)
                  // Auto-search karo
                  handleSearch()
                }}
                className="text-indigo-600 text-sm bg-indigo-50 
                           px-3 py-1 rounded-full hover:bg-indigo-100
                           transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 
                            rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Search ho rahi hai...</p>
          </div>
        )}

        {/* Initial State (pehle se pehle search) */}
        {!isSearching && !hasSearched && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">Upar koi hashtag search karo</p>
            <p className="text-sm mt-2">Example: #Damru26 ya #Freshers2024</p>
          </div>
        )}

        {/* No Results State */}
        {!isSearching && hasSearched && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Koi photo nahi mili
            </h3>
            <p className="text-gray-500">
              #{searchInput} ke liye koi photo nahi hai abhi
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!isSearching && results.length > 0 && (
          <>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">{results.length}</span> photos 
              mili #{searchInput} ke liye
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map(photo => (
                <div
                  key={photo.id}
                  onClick={() => router.push(`/photo/${photo.id}`)}
                  // Photo click pe detail page pe le jao
                  className="bg-white rounded-xl overflow-hidden shadow-sm 
                             hover:shadow-md transition-shadow cursor-pointer
                             hover:-translate-y-1 transition-transform"
                  // hover:-translate-y-1 → hover pe thoda upar uthta hai (nice effect)
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-48 object-cover"
                  />
                  {photo.caption && (
                    <div className="p-3">
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## 🖼️ KAAM 2 — Photo Detail Page

### File: `app/photo/[id]/page.tsx`

```typescript
// [id] — Dynamic route
// Matlab: /photo/abc123 → id = "abc123"
//         /photo/xyz456 → id = "xyz456"
// Ek hi file multiple pages handle karti hai!

'use client'

import { useParams, useRouter } from 'next/navigation'
// useParams → URL se [id] nikalne ke liye
// useRouter → back button ke liye

export default function PhotoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const photoId = params.id as string
  // params.id → URL se photo ka ID milega

  // Mock data (baad mein database se aayega)
  const photo = {
    id: photoId,
    image_url: 'https://picsum.photos/800/600?random=42',
    caption: 'Freshers night 2024! Best memories 🎉 #Damru26 #IITD #Freshers2024',
    uploaded_at: '2024-01-15T18:30:00Z',
    uploader_name: 'Garvit Sharma',
    event_name: 'Freshers Night 2024',
    tags: ['Damru26', 'IITD', 'Freshers2024'],
  }

  return (
    <div className="min-h-screen bg-gray-900">
      
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <button
          onClick={() => router.back()}
          // router.back() → browser back button jaisa kaam
          className="text-gray-300 hover:text-white flex items-center gap-2
                     transition-colors"
        >
          ← Wapas jao
        </button>
      </div>

      {/* Photo */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <img
            src={photo.image_url}
            alt={photo.caption || 'Photo'}
            className="w-full max-h-[70vh] object-contain"
            // object-contain → poori image dikhao (crop mat karo)
            // max-h-[70vh] → maximum 70% of viewport height
          />
        </div>

        {/* Photo Details */}
        <div className="mt-6 bg-white rounded-2xl p-6">
          
          {/* Caption */}
          {photo.caption && (
            <p className="text-gray-800 text-lg mb-4">{photo.caption}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {photo.tags.map(tag => (
              <span
                key={tag}
                className="bg-indigo-100 text-indigo-700 px-3 py-1 
                           rounded-full text-sm font-medium cursor-pointer
                           hover:bg-indigo-200 transition-colors"
                onClick={() => router.push(`/search?tag=${tag}`)}
                // Tag click pe us tag ki search karo
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-gray-500 text-sm 
                          border-t border-gray-100 pt-4">
            <span>👤 {photo.uploader_name}</span>
            {photo.event_name && (
              <span>🎉 {photo.event_name}</span>
            )}
            <span>
              📅 {new Date(photo.uploaded_at).toLocaleDateString('hi-IN')}
              {/* toLocaleDateString('hi-IN') → Indian date format */}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🚨 KAAM 3 — Error Pages

### File: `app/not-found.tsx` (404 page)

```typescript
// Yeh automatically tab dikhega jab koi URL exist na kare
// Example: /random-page → 404 Not Found

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center 
                    justify-center text-center px-4">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold text-gray-800 mb-3">
        404 — Page Nahi Mila
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Yeh page exist nahi karta. Shayad URL galat hai ya page 
        delete ho gaya.
      </p>
      <Link
        href="/"
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl 
                   hover:bg-indigo-700 transition-colors font-medium"
      >
        🏠 Home Pe Wapas Jao
      </Link>
    </div>
  )
}
```

### File: `app/error.tsx` (500 page)

```typescript
'use client'
// Error boundary = client component hona zaroori hai

import { useEffect } from 'react'

type ErrorPageProps = {
  error: Error       // Kya error aayi
  reset: () => void  // Dobara try karne ka function
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  
  useEffect(() => {
    // Error ko log karo (production mein Sentry ya similar tool use karo)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center 
                    justify-center text-center px-4">
      <div className="text-8xl mb-6">😵</div>
      <h1 className="text-4xl font-bold text-gray-800 mb-3">
        Kuch Gadbad Ho Gayi
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Ek unexpected error aayi. Hum isko fix karne ki koshish karenge.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          // reset() → same page dobara try karo
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl 
                     hover:bg-indigo-700 transition-colors font-medium"
        >
          🔄 Dobara Try Karo
        </button>
        <a
          href="/"
          className="border-2 border-gray-300 text-gray-600 px-6 py-3 
                     rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          🏠 Home Pe Jao
        </a>
      </div>
    </div>
  )
}
```

---

## 🧪 KAAM 4 — Testing (Stage 7)

### Manual Testing Checklist — Sab check karo

```markdown
## LOGIN / SIGNUP
- [ ] Valid college email se signup kaam karta hai
- [ ] Invalid email (gmail, yahoo) se signup block hota hai
- [ ] Email verification link kaam karta hai
- [ ] Wrong password pe error dikhta hai
- [ ] Logout kaam karta hai

## PHOTO UPLOAD  
- [ ] JPG/PNG/WEBP upload hoti hai
- [ ] 5MB se bada file block hota hai
- [ ] Caption save hoti hai
- [ ] Hashtag caption mein se extract hota hai
- [ ] Upload ke baad gallery mein photo dikti hai

## GALLERY
- [ ] Photos load hoti hain
- [ ] Year filter kaam karta hai
- [ ] Event filter kaam karta hai
- [ ] Photo click pe detail page khulta hai

## SEARCH
- [ ] #Damru26 search results deta hai
- [ ] Empty search error dikhata hai
- [ ] No results pe empty state dikhta hai
- [ ] Popular tags click pe search hoti hai

## MOBILE
- [ ] Navbar hamburger menu kaam karta hai
- [ ] Gallery grid mobile pe 2 columns hai
- [ ] Buttons tap karne mein easy hain

## ERROR STATES
- [ ] 404 page kaam karta hai (/random-url pe jao)
- [ ] Network off karo — error message dikhta hai
```

### Bug Report Karna Sikhao
Koi bug mile toh yeh format mein WhatsApp group mein bhejo:

```
🐛 BUG FOUND

PAGE: /upload
KYA HUA: File upload ke baad "Upload ho gayi" message nahi aaya
STEPS: 
1. /upload pe jao
2. Photo select karo  
3. Upload button click karo
EXPECTED: Success message aana chahiye
ACTUAL: Page blank ho gaya
```

---

## 📁 VANSH KI FILES

```
app/
├── search/
│   └── page.tsx              ← Search page (tera)
├── photo/
│   └── [id]/
│       └── page.tsx          ← Photo detail page (tera)
├── not-found.tsx             ← 404 page (tera)
└── error.tsx                 ← Error page (tera)

app/api/
└── search/
    └── route.ts              ← Search API (tera)
```

---

## 🔄 Git Workflow

```bash
git pull origin main
git checkout vansh-search-detail

# Kaam karo...

git add .
git commit -m "Search page: popular tags suggestion add kiya"
git push origin vansh-search-detail
```

---

## 💡 Tips

1. **Hamesha loading state daalo** — user ko pata hona chahiye kuch ho raha hai
2. **Empty states bhoolna mat** — koi data nahi to achha message dikhao
3. **Console.log se debug karo** — F12 → Console tab
4. **Mobile pe test karo** — Chrome DevTools mein phone icon click karo
