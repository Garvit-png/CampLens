# 👨‍💻 JAPINDER KA KAAM — CampusLens Project

> **Japinder aur Garvit saath milke Stage 5 + Stage 6 karenge.**
> Tera kaam: Pure backend logic — koi UI nahi, koi page nahi.
> Jo tu likhega, Garvit directly import karke use karega.

---

## 📋 TERA TOTAL KAAM (Quick Summary)

| # | Kaam | File | Status |
|---|------|------|--------|
| 1 | Caption se hashtags nikalna | `lib/hashtags.ts` | ✅ Done |
| 2 | Tags database mein save karna | `lib/hashtags.ts` | ✅ Done |
| 3 | Photo-tag connection | `lib/hashtags.ts` | ✅ Done |
| 4 | File type + size validation | `lib/validateUpload.ts` | ✅ Done |
| 5 | Date formatting functions | `lib/formatDate.ts` | ✅ Done |
| 6 | Search helpers | `lib/searchHelpers.ts` | ✅ Done |
| 7 | Cloudinary upload helper | `lib/cloudinary.ts` | ❌ Karna hai |
| 8 | Photo fetch from Supabase | `lib/photoQueries.ts` | ❌ Karna hai |
| 9 | Popular tags from Supabase | `lib/tagQueries.ts` | ❌ Karna hai |

---

## 🆕 NAYA KAAM 1 — `lib/cloudinary.ts`

### Yeh kya karega?
Jab user photo upload kare, pehle server se **signed URL** maangni padti hai.
Yeh file woh helper function provide karegi jo:
1. Server se signature maangega
2. Cloudinary pe directly upload karega
3. URL wapas return karega

### Kaise kaam karta hai?
```
User photo select kare
       ↓
uploadToCloudinary(file) call karo
       ↓
/api/cloudinary-signature pe POST request → signature + timestamp milegi
       ↓
Cloudinary pe file + signature bhejo
       ↓
Image URL wapas aayegi
```

### File banao: `lib/cloudinary.ts`

```typescript
// ============================================================
// lib/cloudinary.ts — CLOUDINARY UPLOAD HELPER
// ============================================================
// Yeh file photo upload ka kaam karta hai.
// Garvit ki upload page yeh import karegi.
//
// SECURITY:
// API secret kabhi browser mein nahi aata.
// Server se sirf signature aati hai (time-limited).
// ============================================================

// Upload response ka shape define karo
// TypeScript interface = object ki shape batata hai
export interface CloudinaryUploadResult {
  publicId: string;     // Cloudinary ka unique ID (delete/transform ke liye)
  imageUrl: string;     // Full URL (gallery mein dikhane ke liye)
  thumbnailUrl: string; // Chhoti version URL (gallery grid ke liye)
  width: number;        // Image width in pixels
  height: number;       // Image height in pixels
  sizeBytes: number;    // File size in bytes
}

// ============================================================
// FUNCTION: uploadToCloudinary
// ============================================================
// Input:  File object (browser ka)
// Output: CloudinaryUploadResult (ya error throw)
// ============================================================
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {

  // Step 1: Server se signature maango
  // Server CLOUDINARY_API_SECRET use karta hai — browser mein nahi aata
  const signatureResponse = await fetch('/api/cloudinary-signature', {
    method: 'POST',
  })

  if (!signatureResponse.ok) {
    throw new Error('Could not get upload signature from server')
    // throw = error bhejo (calling code try/catch mein pakdega)
  }

  const { signature, timestamp, cloudName, apiKey } = await signatureResponse.json()
  // Destructuring: object se specific values nikalo

  // Step 2: FormData banao
  // FormData = file aur text data ek saath bhejne ka tarika
  const formData = new FormData()
  formData.append('file', file)                    // Actual photo file
  formData.append('signature', signature)           // Server ne generate ki
  formData.append('timestamp', String(timestamp))   // Unix timestamp
  formData.append('api_key', apiKey)                // Public API key
  formData.append('folder', 'camplens')             // Cloudinary folder

  // Step 3: Cloudinary pe directly upload karo
  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!uploadResponse.ok) {
    throw new Error('Upload to Cloudinary failed')
  }

  const result = await uploadResponse.json()
  // result.secure_url = full image URL
  // result.public_id = Cloudinary ka unique ID

  // Step 4: Thumbnail URL banao
  // Cloudinary URL mein transformation parameters add kar sakte hain
  // w_400,h_400,c_fill = 400x400 crop
  const thumbnailUrl = result.secure_url.replace(
    '/upload/',
    '/upload/w_400,h_400,c_fill/'
    // Replace karo: /upload/ → /upload/w_400,h_400,c_fill/
    // Yeh Cloudinary ka URL transformation feature hai
  )

  return {
    publicId: result.public_id,
    imageUrl: result.secure_url,
    thumbnailUrl,
    width: result.width,
    height: result.height,
    sizeBytes: result.bytes,
  }
}
```

---

## 🆕 NAYI KAAM 2 — `lib/photoQueries.ts`

### Yeh kya karega?
Gallery page abhi mock data use kar raha hai. Jab real database connect hogi toh
Gallery seedha yeh functions call karegi.

### File banao: `lib/photoQueries.ts`

```typescript
// ============================================================
// lib/photoQueries.ts — SUPABASE PHOTO FETCH FUNCTIONS
// ============================================================
// Yeh file database se photos fetch karti hai.
// Gallery page yeh import karegi jab real data chahiye.
//
// Abhi mock data use hoti hai — jab Garvit Supabase connect kare
// tab Gallery pe yeh functions lagenge.
// ============================================================

// Filter options ka shape
export interface PhotoFetchOptions {
  collegeId: string;     // Sirf is college ki photos
  year?: number;         // Optional: kaunse saal ki (undefined = sab)
  eventId?: string;      // Optional: kaunse event ki (undefined = sab)
  hashtag?: string;      // Optional: kaunsa hashtag (undefined = sab)
  limit?: number;        // Ek page mein kitni photos (default: 12)
  offset?: number;       // Pagination: kahan se start karo (default: 0)
}

// ============================================================
// FUNCTION: fetchPhotos
// ============================================================
// Supabase se photos fetch karo with filters
// ============================================================
export async function fetchPhotos(supabase: any, options: PhotoFetchOptions) {
  const {
    collegeId,
    year,
    eventId,
    hashtag,
    limit = 12,   // Default: 12 photos per page
    offset = 0,   // Default: page 1 se start
  } = options
  // Destructuring with defaults: agar caller ne nahi diya toh default use karo

  // Supabase query build karo
  let query = supabase
    .from('photos')
    // photos table se
    .select(`
      id,
      image_url,
      thumbnail_url,
      caption,
      hashtags,
      year,
      uploaded_at,
      profiles ( full_name ),
      events ( name )
    `)
    // Select karo: photo fields + joined data
    // profiles(full_name) = uploader ka naam
    // events(name) = event ka naam
    .eq('college_id', collegeId)
    // Sirf is college ki photos
    .eq('is_approved', true)
    // Sirf approved photos
    .order('uploaded_at', { ascending: false })
    // Newest first
    .range(offset, offset + limit - 1)
    // Pagination: offset se limit tak

  // Optional filters — sirf tab add karo jab value ho
  if (year) {
    query = query.eq('year', year)
    // Year filter
  }

  if (eventId) {
    query = query.eq('event_id', eventId)
    // Event filter
  }

  if (hashtag) {
    query = query.contains('hashtags', [hashtag])
    // Array contains check: hashtags column mein yeh hashtag hai?
    // PostgreSQL GIN index yeh fast banata hai
  }

  const { data, error } = await query

  if (error) {
    console.error('Photos fetch error:', error.message)
    return []
  }

  return data ?? []
}

// ============================================================
// FUNCTION: fetchPhotoById
// ============================================================
// Ek specific photo fetch karo (detail page ke liye)
// ============================================================
export async function fetchPhotoById(supabase: any, photoId: string) {
  const { data, error } = await supabase
    .from('photos')
    .select(`
      id,
      image_url,
      caption,
      hashtags,
      year,
      uploaded_at,
      profiles ( full_name ),
      events ( name )
    `)
    .eq('id', photoId)
    .eq('is_approved', true)
    .single()
  // single() = sirf ek row chahiye

  if (error) {
    console.error('Photo fetch error:', error.message)
    return null
  }

  return data
}
```

---

## 🆕 NAYI KAAM 3 — `lib/tagQueries.ts`

### Yeh kya karega?
Gallery mein "Popular stamps" section hota hai — sabse zyada use hone wale hashtags.
Abhi mock data se calculate hote hain. Real mein database se aayenge.

### File banao: `lib/tagQueries.ts`

```typescript
// ============================================================
// lib/tagQueries.ts — SUPABASE TAG FETCH FUNCTIONS
// ============================================================
// Yeh file database se tags/hashtags fetch karti hai.
// Gallery ka "Popular stamps" section yeh use karega.
// ============================================================

// Tag ka shape
export interface TagWithCount {
  id: string;
  name: string;          // "Damru26" (bina #)
  usage_count: number;   // Kitni photos mein use hua
}

// ============================================================
// FUNCTION: fetchPopularTags
// ============================================================
// Ek college ke sabse popular hashtags fetch karo
// ============================================================
export async function fetchPopularTags(
  supabase: any,
  collegeId: string,
  limit = 10         // Default: top 10 tags
): Promise<TagWithCount[]> {

  const { data, error } = await supabase
    .from('tags')
    .select('id, name, usage_count')
    // id, naam, aur usage count chahiye
    .eq('college_id', collegeId)
    // Sirf is college ke tags
    .order('usage_count', { ascending: false })
    // Most used pehle
    .limit(limit)
    // Sirf top N tags

  if (error) {
    console.error('Tags fetch error:', error.message)
    return []
  }

  return data ?? []
}

// ============================================================
// FUNCTION: fetchTagByName
// ============================================================
// Ek specific tag dhundho name se (search feature ke liye)
// ============================================================
export async function fetchTagByName(
  supabase: any,
  collegeId: string,
  tagName: string    // "Damru26" (bina #)
): Promise<TagWithCount | null> {

  const { data, error } = await supabase
    .from('tags')
    .select('id, name, usage_count')
    .eq('college_id', collegeId)
    .ilike('name', tagName)
    // ilike = case-insensitive LIKE
    // "damru26" likhne pe bhi "Damru26" milega
    .maybeSingle()
    // null if not found (error nahi)

  if (error) {
    console.error('Tag fetch error:', error.message)
    return null
  }

  return data
}
```

---

## 📁 JAPINDER KI COMPLETE FILES LIST

```
CampusLens/
└── lib/
    ├── hashtags.ts       ✅ Done
    ├── validateUpload.ts ✅ Done
    ├── formatDate.ts     ✅ Done
    ├── searchHelpers.ts  ✅ Done
    ├── cloudinary.ts     ❌ BANANA HAI (Kaam 7)
    ├── photoQueries.ts   ❌ BANANA HAI (Kaam 8)
    └── tagQueries.ts     ❌ BANANA HAI (Kaam 9)
```

---

## 🔄 Git Workflow

```bash
git pull origin main
git checkout japinder-hashtag-logic

# Teen files banao
# lib/cloudinary.ts
# lib/photoQueries.ts
# lib/tagQueries.ts

git add lib/cloudinary.ts lib/photoQueries.ts lib/tagQueries.ts
git commit -m "Add cloudinary upload helper, photo queries, tag queries"
git push origin japinder-hashtag-logic
```

---

## ✅ UPDATED CHECKLIST

```
[✅] lib/hashtags.ts
[✅] lib/validateUpload.ts
[✅] lib/formatDate.ts
[✅] lib/searchHelpers.ts
[ ] lib/cloudinary.ts — uploadToCloudinary() function
[ ] lib/photoQueries.ts — fetchPhotos() aur fetchPhotoById()
[ ] lib/tagQueries.ts — fetchPopularTags() aur fetchTagByName()
[ ] Garvit ko batao jab teeno ready ho jayein
```
