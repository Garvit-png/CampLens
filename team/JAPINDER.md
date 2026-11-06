# 👨‍💻 JAPINDER KA KAAM — CampusLens Project

> **Japinder aur Garvit saath milke Stage 5 (Photo Upload) karenge.**
> Garvit kaam karega (Cloudinary API, database save, security).
> Tera kaam hai: **Caption se hashtags nikalna** aur **tags database mein save karna**.
> Yeh pure backend ka kaam hai — koi UI nahi banana.

---

## 📋 TERA TOTAL KAAM (Quick Summary)

| # | Kaam | File | Difficulty |
|---|------|------|------------|
| 1 | Caption se hashtags nikalna (regex) | `lib/hashtags.ts` | ⭐⭐ Medium |
| 2 | Tags database mein save karna | `lib/hashtags.ts` | ⭐⭐ Medium |
| 3 | Photo-tag connection save karna | `lib/hashtags.ts` | ⭐⭐ Medium |
| 4 | File type + size validation | `lib/validateUpload.ts` | ⭐ Easy |
| 5 | Dates readable format mein banana | `lib/formatDate.ts` | ⭐ Easy |
| 6 | Search text clean karna | `lib/searchHelpers.ts` | ⭐ Easy |

> Teeno nayi files (4, 5, 6) pure logic hain — koi UI nahi, koi database nahi.
> Garvit, Keshav, Vansh teeno inhe import karke use karenge.

---

## 💻 SETUP (Sirf ek baar)

```bash
# Clone karo
git clone https://github.com/garvit-username/CampusLens.git
cd CampusLens
npm install

# Apni branch banao
git checkout -b japinder-hashtag-logic

# Garvit se .env.local ki values maango, file banao
cp .env.example .env.local
# Values paste karo

# Start karo
npm run dev
```

---

## 🧠 PEHLE YEH SAMJHO — Tera kaam kya hai?

Jab koi photo upload karta hai, caption kuch aisa hota hai:

```
"Freshers night 2024! Best memories 🎉 #Damru26 #IITD #NeverForget"
```

Is caption se:
1. `#Damru26`, `#IITD`, `#NeverForget` nikalne hain
2. Pehle check karo kya yeh tags database mein already hain
3. Nahi hain toh naye banao
4. Photo aur tags ka connection `photo_tags` table mein save karo

Yeh sab teri ek function `saveHashtagsFromCaption()` karega.

---

## 📝 KAAM 1 — Caption se Hashtags Nikalna

### File banao: `lib/hashtags.ts`

```typescript
// =============================================================
// lib/hashtags.ts
// =============================================================
// Yeh file caption text se hashtags nikaalti hai
// aur unhe Supabase database mein save karti hai.
//
// Garvit ki upload API is file ki functions call karegi.
// =============================================================


// ---------------------------------------------------------------
// FUNCTION 1: extractHashtags
// ---------------------------------------------------------------
// Kaam: Caption string se saare hashtags nikalo
//
// Input:  "Freshers night! #Damru26 #IITD #NeverForget"
// Output: ["Damru26", "IITD", "NeverForget"]
//
// Regex kya hota hai?
// Regex = Regular Expression = ek pattern jo text mein search karta hai
// Example: /[a-z]+/ → sirf lowercase letters dhundho
// ---------------------------------------------------------------

export function extractHashtags(caption: string): string[] {
  // caption nahi hai ya empty hai → empty array return karo
  if (!caption || caption.trim() === '') {
    return []
  }

  // Regex pattern: /#(\w+)/g
  // #    → hash symbol se start hona chahiye
  // (    → group start (yeh part capture karenge)
  // \w+  → ek ya zyada word characters (a-z, A-Z, 0-9, _)
  // )    → group end
  // g    → global flag = saare matches nikalo, sirf pehla nahi
  //
  // Example:
  // "#Damru26 #IITD" pe match karoge toh:
  // Match 1: full="#Damru26", group1="Damru26"
  // Match 2: full="#IITD",    group1="IITD"
  const hashtagRegex = /#(\w+)/g

  const hashtags: string[] = []
  // [] = empty array jisme results store honge

  // matchAll → sab matches ek saath nikalo
  const matches = caption.matchAll(hashtagRegex)
  // matchAll returns an iterator (ek ke baad ek results deta hai)

  for (const match of matches) {
    // match[0] = "#Damru26" (poora match)
    // match[1] = "Damru26"  (pehla group — # ke baad wala part)

    const tag = match[1].trim()
    // .trim() → extra spaces remove karo

    // Duplicate check: agar yeh tag already array mein hai toh skip karo
    // includes() → array mein value hai ya nahi check karta hai
    if (tag && !hashtags.includes(tag)) {
      hashtags.push(tag)
      // .push() → array ke end mein add karo
    }
  }

  return hashtags
  // Example output: ["Damru26", "IITD", "NeverForget"]
}


// ---------------------------------------------------------------
// FUNCTION 2: saveHashtagsToDatabase
// ---------------------------------------------------------------
// Kaam: Hashtags array lo aur Supabase mein save karo
//
// Input:
//   - supabase: database connection (Garvit dega)
//   - photoId: kaunsi photo ka tag hai ("abc-123-xyz")
//   - hashtags: ["Damru26", "IITD", "NeverForget"]
//   - collegeId: kaunse college ka tag hai
//
// Output: void (kuch return nahi, sirf save karta hai)
//
// ASYNC/AWAIT kya hota hai?
// Database operations time lete hain (network request jati hai).
// async = "yeh function time le sakta hai"
// await = "yahan ruko jab tak result aaye"
// Jaise delivery ka wait karna — jab tak aaye, baaki kaam mat karo
// ---------------------------------------------------------------

export async function saveHashtagsToDatabase(
  supabase: any,        // Supabase client (Garvit provide karega)
  photoId: string,      // Photo ka unique ID
  hashtags: string[],   // ["Damru26", "IITD", "NeverForget"]
  collegeId: string     // College ka ID
): Promise<void> {

  // Agar koi hashtag nahi hai → kuch karne ki zaroorat nahi
  if (hashtags.length === 0) {
    console.log('Koi hashtag nahi mila caption mein')
    return
  }

  // Har hashtag ke liye loop chalao
  for (const tagName of hashtags) {
    // for...of = array ke har item pe ek ek karke kaam karo

    try {
      // -----------------------------------------------------------
      // STEP A: Check karo kya yeh tag already database mein hai
      // -----------------------------------------------------------
      // .from('tags')     → tags table
      // .select('id')     → sirf id column chahiye
      // .eq('name', tagName) → jahan name = tagName
      // .single()         → sirf ek row chahiye
      const { data: existingTag, error: fetchError } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .maybeSingle()
      // maybeSingle() → agar nahi mila toh null aata hai (error nahi)
      // single()      → agar nahi mila toh error aata hai

      // fetchError matlab database se connect hi nahi ho paya
      if (fetchError) {
        console.error(`Tag "${tagName}" fetch karne mein error:`, fetchError.message)
        continue
        // continue → is iteration skip karo, next hashtag pe jao
      }

      let tagId: string
      // let = value baad mein assign karenge (const nahi kyunki change hogi)

      if (existingTag) {
        // -----------------------------------------------------------
        // STEP B: Tag already hai → uska ID use karo
        // -----------------------------------------------------------
        tagId = existingTag.id
        console.log(`Tag "${tagName}" already hai, ID: ${tagId}`)

        // Usage count badha do (kitni photos mein use hua)
        // .update() → existing row update karo
        // .eq()     → kaunsi row update karni hai
        await supabase
          .from('tags')
          .update({ usage_count: existingTag.usage_count + 1 })
          .eq('id', tagId)

      } else {
        // -----------------------------------------------------------
        // STEP C: Tag naya hai → database mein insert karo
        // -----------------------------------------------------------
        // .insert() → naya row banana
        // .select('id') → naye row ka ID wapas chahiye
        // .single()     → ek hi row insert hogi
        const { data: newTag, error: insertError } = await supabase
          .from('tags')
          .insert({
            name: tagName,         // Tag ka naam: "Damru26"
            college_id: collegeId, // Kis college ka tag hai
            usage_count: 1,        // Pehli baar use ho raha hai
          })
          .select('id')
          .single()

        if (insertError || !newTag) {
          console.error(`Tag "${tagName}" insert karne mein error:`, insertError?.message)
          continue
        }

        tagId = newTag.id
        console.log(`Naya tag "${tagName}" bana, ID: ${tagId}`)
      }

      // -----------------------------------------------------------
      // STEP D: Photo aur Tag ka connection banana (photo_tags table)
      // -----------------------------------------------------------
      // photo_tags ek junction table hai
      // Ek photo ke multiple tags ho sakte hain
      // Ek tag multiple photos mein ho sakta hai
      //
      // .upsert() = insert OR update
      // Agar (photoId + tagId) combination already hai → skip
      // Nahi hai → insert karo
      // onConflict → duplicate pe kya karo (ignore = skip)
      const { error: linkError } = await supabase
        .from('photo_tags')
        .upsert(
          {
            photo_id: photoId, // Kaunsi photo
            tag_id: tagId,     // Kaunsa tag
          },
          { onConflict: 'photo_id,tag_id' }
          // onConflict → agar yeh combination already hai toh error mat do
        )

      if (linkError) {
        console.error(`Photo-tag link error (${tagName}):`, linkError.message)
        continue
      }

      console.log(`✅ Tag "${tagName}" photo se link ho gaya`)

    } catch (unexpectedError) {
      // catch → koi bhi unexpected error aaye toh yahan aao
      // Ek tag fail ho toh baaki ko kharab mat karo — continue karo
      console.error(`Unexpected error for tag "${tagName}":`, unexpectedError)
      continue
    }
  }

  console.log(`✅ Saare ${hashtags.length} hashtags save ho gaye photo: ${photoId}`)
}


// ---------------------------------------------------------------
// FUNCTION 3: processPhotoHashtags  (Main function — yeh call hogi)
// ---------------------------------------------------------------
// Kaam: Caption lo, hashtags nikalo, save karo — sab ek jagah
//
// Garvit apni upload API mein sirf yeh ek function call karega:
//   await processPhotoHashtags(supabase, photoId, caption, collegeId)
//
// Input:
//   - supabase:  database connection
//   - photoId:   newly uploaded photo ka ID
//   - caption:   "Freshers night! #Damru26 #IITD"
//   - collegeId: college ka ID
//
// Output: nikale gaye hashtags ka array (logging ke liye)
// ---------------------------------------------------------------

export async function processPhotoHashtags(
  supabase: any,
  photoId: string,
  caption: string,
  collegeId: string
): Promise<string[]> {

  // Step 1: Caption se hashtags nikalo
  const hashtags = extractHashtags(caption)
  // Example: ["Damru26", "IITD", "NeverForget"]

  console.log(`Caption se ${hashtags.length} hashtags mile:`, hashtags)

  // Step 2: Database mein save karo
  // Agar hashtags hain tabhi save karo
  if (hashtags.length > 0) {
    await saveHashtagsToDatabase(supabase, photoId, hashtags, collegeId)
  }

  // Step 3: Kya nikala woh return karo (Garvit log kar sakta hai)
  return hashtags
}
```

---

## ✅ Test Karo — Kya Sahi Kaam Kar Raha Hai?

### Unit test (manually browser console mein):

Terminal mein yeh run karo:

```bash
# Node.js se directly test karo
node -e "
const { extractHashtags } = require('./lib/hashtags')

// Test 1: Normal case
const result1 = extractHashtags('Freshers night! #Damru26 #IITD #NeverForget')
console.log('Test 1:', result1)
// Expected: ['Damru26', 'IITD', 'NeverForget']

// Test 2: No hashtags
const result2 = extractHashtags('Simple caption without tags')
console.log('Test 2:', result2)
// Expected: []

// Test 3: Duplicate hashtags
const result3 = extractHashtags('#IITD best college #IITD again')
console.log('Test 3:', result3)
// Expected: ['IITD']  (duplicate nahi hoga)

// Test 4: Empty caption
const result4 = extractHashtags('')
console.log('Test 4:', result4)
// Expected: []
"
```

---

## 📁 JAPINDER KI FILES (yeh sab banana hai)

```
CampusLens/
└── lib/
    ├── hashtags.ts         ← Caption se hashtags nikalna + save karna (tera ✅)
    ├── validateUpload.ts   ← File type/size validation (tera ✅)
    ├── formatDate.ts       ← Dates ko readable banana (tera ✅)
    └── searchHelpers.ts    ← Search text clean karna (tera ✅)
```

**Yeh Garvit karega (tujhe nahi banana):**
```
❌ app/api/upload/route.ts          ← Garvit
❌ app/api/cloudinary-signature/    ← Garvit
❌ lib/supabase/                    ← Garvit
❌ Koi bhi UI/page                  ← Keshav
```

---

## 🤝 Garvit ke saath coordination
ae
Garvit ki upload API mein yeh line hogi (woh likhega):
```typescript
import { processPhotoHashtags } from '@/lib/hashtags'

// Upload hone ke baad woh call karega:
await processPhotoHashtags(supabase, photo.id, caption, collegeId)
```

Tera kaam hai sirf `lib/hashtags.ts` ready rakhna.

---

## 🔄 Git — Roz karo

```bash
# Latest code lo
git pull origin main

# Apni branch pe switch karo
git checkout japinder-hashtag-logic

# Kaam karo...

# Save karo
git add lib/hashtags.ts
git commit -m "hashtags: extractHashtags function ready"

# Push karo
git push origin japinder-hashtag-logic
```

---

## ✅ CHECKLIST

```
[ ] lib/hashtags.ts file bani
[ ] extractHashtags() sahi se hashtags nikaal raha hai
[ ] Duplicate hashtags nahi aa rahe
[ ] Empty caption pe empty array aata hai
[ ] saveHashtagsToDatabase() likha
[ ] processPhotoHashtags() (main function) ready
[ ] lib/validateUpload.ts file bani
[ ] File type check kaam kar raha hai
[ ] File size check kaam kar raha hai
[ ] lib/formatDate.ts file bani
[ ] formatDate() sahi output de raha hai
[ ] timeAgo() sahi output de raha hai
[ ] lib/searchHelpers.ts file bani
[ ] cleanSearchQuery() # remove kar raha hai
[ ] Garvit ko bataya ki files ready hain
```
