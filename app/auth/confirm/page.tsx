'use client'

// Yeh page email link click karne ke baad khulta hai
// URL mein hash hoga: /auth/confirm#access_token=xxx&type=magiclink
// Supabase client hash se automatically session set karta hai

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Developing from '@/components/Developing'

export default function ConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let redirected = false

    function goToOnboarding() {
      if (!redirected) {
        redirected = true
        router.replace('/onboarding')
      }
    }

    // onAuthStateChange - implicit flow mein SIGNED_IN event aayega
    // jab Supabase client hash se token detect karega
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Confirm page auth event:', event, !!session)
      if (event === 'SIGNED_IN' && session) {
        goToOnboarding()
      } else if (event === 'TOKEN_REFRESHED' && session) {
        goToOnboarding()
      }
    })

    // Pehle se session check karo
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Confirm page existing session:', !!session)
      if (session) {
        goToOnboarding()
      }
    })

    // 10 second timeout
    const timer = setTimeout(() => {
      if (!redirected) {
        setErrorMsg('Could not sign in. The link may have expired.')
        setStatus('error')
      }
    }, 10000)

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [router])

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Link expired</h1>
        <p className="mt-3 text-sm text-muted">{errorMsg}</p>
        <a href="/" className="btn mt-8 inline-block">Try again</a>
      </div>
    )
  }

  return <Developing text="Signing you in…" />
}
