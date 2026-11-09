'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Developing from '@/components/Developing'

export default function ConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let done = false

    function redirect() {
      if (!done) {
        done = true
        router.replace('/onboarding')
      }
    }

    // Har auth event handle karo
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Confirm event:', event, !!session)

      if (session && (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION'
        // INITIAL_SESSION = page load pe existing session
        // Agar user pehle se logged in hai → seedha redirect
      )) {
        redirect()
      }
    })

    // Timeout thoda zyada rakho — Google redirect time leta hai
    const timer = setTimeout(() => {
      if (!done) {
        setError('Sign in timed out. Please try again.')
      }
    }, 15000)

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
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
