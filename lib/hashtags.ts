// ============================================================
// FILE: lib/hashtags.ts — HASHTAG LOGIC (JAPINDER KA KAAM)
// ============================================================
// Yeh file caption text se hashtags nikaalti hai aur
// Supabase database mein save karti hai.
//
// Garvit ki upload API is file ki processPhotoHashtags() call karegi:
//   await processPhotoHashtags(supabase, photo.id, caption, collegeId)
//
// TEEN FUNCTIONS:
//   1. extractHashtags()     → caption se #tags nikaalo
//   2. saveHashtagsToDatabase() → tags Supabase mein save karo
//   3. processPhotoHashtags()   → dono ek saath (main entry point)
// ============================================================


// ----------------------------------------------------------
// FUNCTION 1: extractHashtags
// ----------------------------------------------------------
// Caption text se saare hashtags nikaalta hai.
//
// Input:  "Freshers night! #Damru26 #IITD #NeverForget"
// Output: ["Damru26", "IITD", "NeverForget"]
//
// REGEX EXPLANATION: /#(\w+)/g
//   #     → hash symbol se start hona chahiye
//   (     → group start (yeh part capture hoga)
//   \w+   → word characters: letters, numbers, underscore (ek ya zyada)
//   )     → group end
//   g     → global flag = saare matches nikaalo, sirf pehla nahi
// ----------------------------------------------------------
export function extractHashtags(caption: string): string[] {
    // string[] → array of strings return karta hai

    const matches = caption.match(/#(\w+)/g);
    // .match() → regex se matching parts nikaalo
    // Result: ["#Damru26", "#IITD", "#NeverForget"]
    // Agar koi match nahi → null

    if (!matches) {
        return [];
        // Koi hashtag nahi mila → khaali array return karo
    }

    const hashtags = matches.map(tag => tag.slice(1));
    // .map() → har element pe function apply karo
    // tag.slice(1) → "#Damru26" → "Damru26" (pehla character # hatao)
    // Result: ["Damru26", "IITD", "NeverForget"]

    return [...new Set(hashtags)];
    // new Set() → duplicate values hata do
    //   Agar caption mein "#IITD #IITD" hai → ["IITD", "IITD"] → Set → ["IITD"]
    // [...new Set()] → Set ko wapas array mein convert karo
    // Result: unique hashtags ki list
}


// ----------------------------------------------------------
// FUNCTION 2: saveHashtagsToDatabase
// ----------------------------------------------------------
// Hashtags array lo aur Supabase database mein save karo.
//
// LOGIC (har hashtag ke liye):
//   Step A: Kya yeh tag pehle se database mein hai?
//   Step B: Hai → sirf usage_count badhao (+1)
//   Step C: Nahi hai → naya tag insert karo
//   Step D: Photo aur tag ka connection banao (photo_tags table)
//
// ASYNC/AWAIT:
//   Database operations time lete hain (network request).
//   async = yeh function time le sakta hai
//   await = yahan ruko jab tak database se response na aaye
// ----------------------------------------------------------
export async function saveHashtagsToDatabase(
    supabase: any,        // Supabase client (Garvit provide karega)
    photoId: string,      // Kis photo ka tag hai
    hashtags: string[],   // ["Damru26", "IITD", "NeverForget"]
    collegeId: string     // Kis college ka tag hai
): Promise<void> {
    // Promise<void> → kuch return nahi karta (sirf save karta hai)

    for (const tagName of hashtags) {
        // for...of → array ke har item pe ek ek karke kaam karo

        // --- STEP A: Check karo tag pehle se hai ya nahi ---
        const { data: existingTag } = await supabase
            .from("tags")                    // tags table
            .select("id, usage_count")       // sirf yeh do columns chahiye
            .eq("name", tagName)             // jahan name = tagName
            .eq("college_id", collegeId)     // tags college-wise unique hain (UNIQUE(college_id, name))
            .maybeSingle();
            // maybeSingle() → ek row return karo, agar nahi mila to null (error nahi)

        let tagId: string;
        // let → value baad mein assign hogi (const nahi kyunki dono branches mein set hoga)

        if (existingTag) {
            // --- STEP B: Tag pehle se hai → usage_count badhao ---
            tagId = existingTag.id;
            // Pehle se tag ka ID use karo

            await supabase
                .from("tags")
                .update({ usage_count: existingTag.usage_count + 1 })
                // usage_count + 1 → ek aur photo mein use ho gaya
                .eq("id", tagId);
                // kaunsi row update karni hai? jiska id = tagId

        } else {
            // --- STEP C: Tag naya hai → database mein insert karo ---
            const { data: newTag, error: insertError } = await supabase
                .from("tags")
                .insert({
                    name: tagName,          // "Damru26"
                    college_id: collegeId,   // kis college ka tag hai
                    usage_count: 1           // pehli baar use ho raha hai
                })
                .select("id")              // naye row ka ID wapas do
                .single();
                // single() → ek hi row insert hui, uska ID chahiye

            if (insertError || !newTag) {
                console.error("Tag insert failed:", tagName, insertError?.message);
                continue; // is tag ko skip karo, baaki tags save karte raho
            }
            tagId = newTag.id;
            // Naye tag ka ID save karo
        }

        // --- STEP D: Photo ↔ Tag connection banao ---
        await supabase
            .from("photo_tags")             // junction table (many-to-many)
            .upsert(                         // insert OR update
                {
                    photo_id: photoId,       // kaunsi photo
                    tag_id: tagId,           // kaunsa tag
                },
                { onConflict: "photo_id,tag_id", ignoreDuplicates: true }
                // onConflict → agar yeh combination pehle se hai toh error mat do
                // (duplicate photo-tag link prevent karo)
            );
    }
}


// ----------------------------------------------------------
// FUNCTION 3: processPhotoHashtags (MAIN — yeh call hogi)
// ----------------------------------------------------------
// Garvit ki upload API yeh function call karegi.
// Caption lo → hashtags nikaalo → database mein save karo.
//
// Input:
//   supabase  → database connection
//   photoId   → newly uploaded photo ka ID
//   caption   → "Freshers night! #Damru26 #IITD"
//   collegeId → college ka ID
//
// Output: nikale gaye hashtags ki list (logging ke liye)
// ----------------------------------------------------------
export async function processPhotoHashtags(
    supabase: any,
    photoId: string,
    caption: string,
    collegeId: string
): Promise<string[]> {
    // Promise<string[]> → string array return karega (tags ki list)

    const hashtags = extractHashtags(caption);
    // Step 1: Caption se hashtags nikaalo
    // "Freshers night! #Damru26 #IITD" → ["Damru26", "IITD"]

    await saveHashtagsToDatabase(
        supabase,
        photoId,
        hashtags,
        collegeId
    );
    // Step 2: Database mein save karo (await = ruko jab tak save na ho)

    return hashtags;
    // Step 3: Tags ki list return karo (Garvit log kar sakta hai)
}
