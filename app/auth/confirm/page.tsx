'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Developing from '@/components/Developing'

export default function ConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    async function handle() {
      // Google/Supabase ne error bheja ho (e.g. access_denied)
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const urlError =
        params.get('error_description') ?? hashParams.get('error_description')
      if (urlError) {
        setError(urlError)
        return
      }

      // IMPORTANT: code ko manually exchange MAT karo.
      // @supabase/ssr ka browser client hamesha PKCE use karta hai aur
      // detectSessionInUrl=true hai, toh client init hote hi woh ?code= ko
      // khud exchange kar leta hai aur code_verifier delete kar deta hai.
      // Doosri baar exchangeCodeForSession call karne se error aata tha.
      // getSession() init (aur us auto-exchange) ke complete hone ka wait karta hai.
      const supabase = createClient()
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (data.session) {
        router.replace('/onboarding')
        return
      }

      setError(sessionError?.message ?? 'No login session found. Please try again.')
    }

    handle()
  }, [router])

  if (error) {
    return (
      <div className="mx-auto max-w-sm px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Sign in failed</h1>
        <p className="mt-3 text-sm text-muted">{error}</p>
        <a href="/login" className="btn mt-8 inline-block">Try again</a>
      </div>
    )
  }

  return <Developing text="Signing you in…" />
}
