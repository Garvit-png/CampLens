import { NextRequest, NextResponse } from "next/server";
export async function GET(request:NextRequest) {
    const serchParams = request.nextUrl.searchParams
    const tag = serchParams.get('tag')
    // why we used here...get we alrady did that before?

    // now i will check the tag...if it is empty or if it does not exist 
    // i will then rgiev error using status code and also 
    // some messege like tag is invalid ig 
    if (!tag||tag.trim()==='')
        {

            return NextResponse.json(
                {error: 'Search tag is required/Invalid'},
                {status: 400}
            )

        }

        const cleanTag = tag.replace('#','').trim()
// if we had "#     Damru" now we have "     Damru" so trim gives us "Damru"...that is required

// but it can also be like..."damru" and we need "Damru"
try {
    // we will use real query ehre once we have superbase setup
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

    
