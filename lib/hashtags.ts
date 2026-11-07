export function extractHashtags(caption: string): string[] {
    const matches = caption.match(/#(\w+)/g);

    if (!matches) {
        return [];
    }

    const hashtags = matches.map(tag => tag.slice(1));

    return [...new Set(hashtags)];
}



export async function saveHashtagsToDatabase(
    supabase: any,
    photoId: string,
    hashtags: string[],
    collegeId: string
): Promise<void> {

    for (const tagName of hashtags) {

        const { data: existingTag } = await supabase
            .from("tags")
            .select("id, usage_count")
            .eq("name", tagName)
            .maybeSingle();

        let tagId: string;

        if (existingTag) {
            tagId = existingTag.id;

            await supabase
                .from("tags")
                .update({ usage_count: existingTag.usage_count + 1 })
                .eq("id", tagId);

        } else {
            const { data: newTag } = await supabase
                .from("tags")
                .insert({
                    name: tagName,
                    college_id: collegeId,
                    usage_count: 1
                })
                .select("id")
                .single();

            tagId = newTag.id;
        }

        await supabase
            .from("photo_tags")
            .upsert(
                {
                    photo_id: photoId,
                    tag_id: tagId
                },
                { onConflict: "photo_id,tag_id" }
            );
    }
}




export async function processPhotoHashtags(
    supabase: any,
    photoId: string,
    caption: string,
    collegeId: string
): Promise<string[]> {

    const hashtags = extractHashtags(caption);

    await saveHashtagsToDatabase(
        supabase,
        photoId,
        hashtags,
        collegeId
    );

    return hashtags;
}