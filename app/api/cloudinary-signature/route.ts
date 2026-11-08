// ============================================================
// FILE: app/api/cloudinary-signature/route.ts
// ============================================================
// Yeh SERVER-SIDE API route hai.
// Browser direct Cloudinary pe upload nahi kar sakta bina signature ke.
// Yeh route:
//   1. Current user verify karta hai (logged in hai?)
//   2. Cloudinary signature generate karta hai (API secret se)
//   3. Browser ko signature + timestamp bhejta hai
//
// SECURITY:
//   CLOUDINARY_API_SECRET kabhi browser tak nahi pahunchta.
//   Sirf is server route mein use hota hai.
// ============================================================

import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Cloudinary configure karo (server-side only)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Secret — server only!
})

export async function POST() {
  // Step 1: User logged in hai? Verify karo
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Step 2: Current timestamp (seconds mein)
  const timestamp = Math.round(Date.now() / 1000)

  // Step 3: Cloudinary signature banao
  // Signature = timestamp + folder + API secret ka hash
  // Cloudinary verify karega ki upload valid hai
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'camplens' },
    process.env.CLOUDINARY_API_SECRET!
  )

  // Step 4: Browser ko bhejo (secret nahi, sirf signature)
  return NextResponse.json({
    timestamp,
    signature,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  })
}
