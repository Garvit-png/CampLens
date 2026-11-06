# 👨‍💻 JAPINDER KA KAAM — CampusLens Project

> **Japinder Photo Upload aur Gallery ka kaam karega.**
> Tera kaam hai: Photo upload page, Gallery page, aur Cloudinary integration.

---

## 📋 TERA TOTAL KAAM (Quick Summary)

| # | Kaam | Stage |
|---|------|-------|
| 1 | Photo Upload Page banana | Stage 5 |
| 2 | Cloudinary se image upload | Stage 5 |
| 3 | Gallery page banana | Stage 6 |
| 4 | Filters banana (year, event) | Stage 6 |

---

## 💻 PEHLE YEH KARO (Setup)

### Step 1: Project apne computer pe lo
```bash
# Garvit ne jo GitHub repo banaya hai, usse clone karo
git clone https://github.com/garvit-username/CampusLens.git
cd CampusLens

# Dependencies install karo
npm install
```

### Step 2: Environment file banao
```bash
# .env.example file copy karo
cp .env.example .env.local

# Garvit se yeh values maango aur .env.local mein daalo:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_SECRET
```

### Step 3: Project start karo
```bash
npm run dev
# Browser mein jao: http://localhost:3000
```

### Step 4: Apni branch banao
```bash
# Hamesha apni branch pe kaam karo, main pe seedha mat karo
git checkout -b japinder-upload-gallery
```

---

## 📸 STAGE 5 — Photo Upload Page

### Samajhna zaroori hai: Photo upload kaise kaam karta hai?

```
User photo select karta hai
        ↓
Browser server ko request bhejta hai: "Mujhe Cloudinary pe upload karna hai"
        ↓
Server (Route Handler) Cloudinary se SIGNED URL banata hai
(Signature server pe banti hai — secret key browser ko nahi milti)
        ↓
Browser directly Cloudinary pe photo upload karta hai
        ↓
Cloudinary URL wapas aati hai
        ↓
Hum URL + details Supabase database mein save karte hain
```

### Step 1: Cloudinary signature route banao
`app/api/cloudinary-signature/route.ts` file banao:

```typescript
// Yeh ek server-side API route hai
// 'use client' nahi likhenge — yeh server pe chalega
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary SDK install karo pehle: npm install cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Secret — server only!
})

export async function POST() {
  // Current timestamp
  const timestamp = Math.round(new Date().getTime() / 1000)

  // Signature generate karo — Cloudinary verify karega ki upload valid hai
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'camplens' },
    process.env.CLOUDINARY_API_SECRET!
  )

  // Browser ko timestamp aur signature bhejo (secret nahi)
  return NextResponse.json({ timestamp, signature })
}
```

```bash
# Cloudinary package install karo
npm install cloudinary
```

### Step 2: Photo Upload Page banao
`app/upload/page.tsx` file banao:

```typescript
'use client'
// 'use client' isliye — useState, file input handle karna hai

import { useState } from 'react'

export default function UploadPage() {
  // State variables — inhe samjho:
  // useState(initialValue) → [currentValue, functionToChangeValue]
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  // selectedFile → user ne kaunsi file choose ki
  // setSelectedFile → file change karne ka function
  
  const [caption, setCaption] = useState('')
  // caption → photo ki description
  
  const [isUploading, setIsUploading] = useState(false)
  // isUploading → kya upload ho raha hai? (loading state ke liye)
  
  const [uploadedUrl, setUploadedUrl] = useState('')
  // uploadedUrl → upload successful hone ke baad Cloudinary URL

  // Jab user file select kare
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]  // Pehli selected file lo
    if (!file) return
    
    // Check karo: sirf images allow karo
    if (!file.type.startsWith('image/')) {
      alert('Sirf image files upload kar sakte ho!')
      return
    }
    
    // Check karo: file size limit (5MB)
    const maxSize = 5 * 1024 * 1024  // 5MB bytes mein
    if (file.size > maxSize) {
      alert('File 5MB se chhoti honi chahiye!')
      return
    }
    
    setSelectedFile(file)
  }

  // Jab user "Upload" button click kare
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Pehle ek photo choose karo!')
      return
    }
    
    setIsUploading(true)  // Loading state ON

    try {
      // Step 1: Server se signature maango
      const signatureResponse = await fetch('/api/cloudinary-signature', {
        method: 'POST',
      })
      const { timestamp, signature } = await signatureResponse.json()
      
      // Step 2: FormData banao (file aur details bundle karo)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)
      formData.append('folder', 'camplens')
      
      // Step 3: Cloudinary pe directly upload karo
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      
      const uploadResult = await uploadResponse.json()
      
      // Step 4: URL save karo
      setUploadedUrl(uploadResult.secure_url)
      alert('Photo upload ho gayi! 🎉')
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload fail ho gaya. Dobara try karo.')
    } finally {
      setIsUploading(false)  // Loading state OFF (chahe success ho ya fail)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📸 Photo Upload Karo
        </h1>

        {/* File Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Photo Choose Karo
          </label>
          <input
            type="file"
            accept="image/*"           // Sirf images
            onChange={handleFileSelect}
            className="block w-full text-gray-500 border border-gray-300 
                       rounded-lg p-2 cursor-pointer"
          />
          {/* Agar file select hui ho toh naam dikhao */}
          {selectedFile && (
            <p className="text-green-600 mt-2 text-sm">
              ✅ Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Caption Input */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Caption likho (hashtags bhi daal sakte ho)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Example: Freshers night! #Damru26 #IITD #NeverForget"
            className="w-full border border-gray-300 rounded-lg p-3 
                       resize-none focus:outline-none focus:ring-2 
                       focus:ring-indigo-500"
            rows={3}
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className={`w-full py-3 rounded-lg font-semibold text-white
            ${isUploading || !selectedFile
              ? 'bg-gray-400 cursor-not-allowed'   // Disabled state
              : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'  // Active state
            } transition-colors`}
        >
          {isUploading ? '⏳ Upload ho raha hai...' : '📤 Upload Karo'}
        </button>

        {/* Success State */}
        {uploadedUrl && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium">✅ Upload successful!</p>
            <img
              src={uploadedUrl}
              alt="Uploaded photo"
              className="mt-3 rounded-lg max-w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 🖼️ STAGE 6 — Gallery Page

### Step 1: Gallery Page banao
`app/gallery/page.tsx` file banao:

```typescript
'use client'

import { useState } from 'react'

// Typescript type: ek photo kaisi dikhegi
type Photo = {
  id: string
  image_url: string
  thumbnail_url: string | null
  caption: string | null
  uploaded_at: string
  uploader: { display_name: string }
  event: { name: string } | null
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [searchHashtag, setSearchHashtag] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Saal list (filter ke liye)
  const years = ['2024', '2023', '2022', '2021', '2020']

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">📷 Gallery</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 
                        flex flex-wrap gap-4 items-center">
          
          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">📅 Sab Saal</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Hashtag Search */}
          <input
            type="text"
            value={searchHashtag}
            onChange={(e) => setSearchHashtag(e.target.value)}
            placeholder="🔍 #Damru26 search karo"
            className="border border-gray-300 rounded-lg px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Search Button */}
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg 
                       hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
          
          {/* Clear Filters */}
          <button
            onClick={() => {
              setSelectedYear('')
              setSelectedEvent('')
              setSearchHashtag('')
            }}
            className="text-gray-500 underline text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20 text-gray-500">
            ⏳ Photos load ho rahi hain...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && photos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">
              Koi photos nahi mili. Pehli photo upload karo!
            </p>
          </div>
        )}

        {/* Photos Grid */}
        {!isLoading && photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm 
                           hover:shadow-md transition-shadow cursor-pointer"
              >
                <img
                  src={photo.thumbnail_url || photo.image_url}
                  alt={photo.caption || 'College memory'}
                  className="w-full h-48 object-cover"
                  // object-cover → image aspect ratio maintain karo,
                  //                 box fill karo (crop if needed)
                />
                {photo.caption && (
                  <div className="p-3">
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {/* line-clamp-2 → 2 lines ke baad "..." */}
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 📁 JAPINDER KI FILES

```
app/
├── upload/
│   └── page.tsx           ← Photo upload page (tera kaam)
├── gallery/
│   └── page.tsx           ← Gallery page (tera kaam)
└── api/
    └── cloudinary-signature/
        └── route.ts       ← Cloudinary API (tera kaam)
```

---

## 🔄 Git Workflow (Roz karo)

```bash
# Kaam start karne se pehle latest code lo
git pull origin main

# Apni branch pe switch karo
git checkout japinder-upload-gallery

# Kaam karo...

# Kaam khatam hone pe save karo
git add .
git commit -m "Upload page: file validation add kiya"

# Push karo
git push origin japinder-upload-gallery
```

---

## ⚠️ Common Mistakes

1. **API key browser mein mat daalo** — `CLOUDINARY_API_SECRET` sirf server pe
2. **File size check zaroori hai** — bina check ke bade files upload ho sakti hain
3. **Loading state bhoolna** — user ko pata hona chahiye ki kuch ho raha hai
