'use client'

// Yeh page BROWSER mein chalta hai
// Server pe cookie set karne ki jagah, browser khud session set karta hai
// Yeh Vercel pe 100% reliable hai

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Developing from '@/components/Developing'

export default function ConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    async function exchangeCode() {
      // URL se code nikalo
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (!code) {
        setError('No code found')
        return
      }

      // Browser-side Supabase client se code exchange karo
      // Yeh automatically localStorage/cookies mein session save karega
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Exchange error:', error.message)
        setError(error.message)
        return
      }

      // Session set ho gaya — onboarding pe jao
      router.replace('/onboarding')
    }

    exchangeCode()
  }, [router])

  if (error) {
    return (
      <div className="mx-auto max-w-sm px-6 py-32 text-center">
        <h1 className="font-serif text-3xl">Link expired</h1>
        <p className="mt-3 text-muted text-sm">{error}</p>
        <a href="/" className="btn mt-6 inline-block">Try again</a>
      </div>
    )
  }

  return <Developing text="Signing you in…" />
}
