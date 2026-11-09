'use client'
// Yeh page Google OAuth ke baad khulta hai
// URL mein hash hoga: /auth/callback#access_token=xxx&type=magiclink
// Supabase implicit flow: client browser hash se token read karta hai
// onAuthStateChange mein SIGNED_IN event aayega

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Developing from '@/components/Developing'

export default function CallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let done = false

    function goToOnboarding() {
      if (!done) {
        done = true
        router.replace('/onboarding')
      }
    }

    // onAuthStateChange: Supabase URL hash se token detect karega
    // aur SIGNED_IN event fire karega
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Callback auth event:', event, !!session)
      if (session && (
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'TOKEN_REFRESHED'
      )) {
        goToOnboarding()
      }
    })

    // Error check
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      setError(params.get('error_description') ?? 'Sign in failed')
      return
    }

    // Timeout
    const timer = setTimeout(() => {
      if (!done) setError('Sign in timed out. Please try again.')
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
