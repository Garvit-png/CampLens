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

      // URL se code nikalo — Google OAuth PKCE code bhejta hai
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      console.log('Confirm page code:', code ? 'found' : 'not found')
      console.log('Confirm page hash:', window.location.hash ? 'has hash' : 'no hash')

      if (code) {
        // PKCE: code exchange karo session ke liye
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        console.log('Exchange result:', !!data.session, exchangeError?.message)

        if (exchangeError) {
          setError('Sign in failed: ' + exchangeError.message)
          return
        }

        if (data.session) {
          router.replace('/onboarding')
          return
        }
      }

      // Hash mein token check karo (implicit flow fallback)
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        // onAuthStateChange handle karega
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth event:', event, !!session)
          if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            subscription.unsubscribe()
            router.replace('/onboarding')
          }
        })
        setTimeout(() => setError('Sign in timed out.'), 10000)
        return
      }

      // Koi token nahi
      setError('No login token found. Please try again.')
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
