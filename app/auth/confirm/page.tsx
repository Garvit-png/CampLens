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
      const supabase = createClient()
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        // PKCE: code exchange browser mein karo
        // localStorage mein code_verifier available hai
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Exchange error:', error.message)
          setError('Sign in failed: ' + error.message)
          return
        }

        console.log('Session created:', data.session?.user?.email)
        router.replace('/onboarding')
        return
      }

      // Koi code nahi — already session hai?
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/onboarding')
        return
      }

      setError('No login token found. Please try signing in again.')
    }

    handle()
  }, [router])

  if (error) {
    return (
      <div className="mx-auto max-w-sm px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Sign in failed</h1>
        <p className="mt-3 text-sm text-muted">{error}</p>
        <a href="/" className="btn mt-8 inline-block">Try again</a>
      </div>
    )
  }

  return <Developing text="Signing you in…" />
}
