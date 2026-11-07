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
            // i was having troble using this next response...so
            // had to read on teh net how to solve this
            // got to know that i need to use next response instead
            // to send the http response to the server else the funciton wil exit
            
        }
    
}