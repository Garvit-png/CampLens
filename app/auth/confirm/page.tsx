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

    // Implicit flow: Supabase client URL hash se automatically session set karta hai
    // #access_token=xxx&refresh_token=yyy → client detect karta hai
    // onAuthStateChange mein SIGNED_IN event aayega
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth confirm event:', event, session?.user?.email)

      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        router.replace('/onboarding')
      }
    })

    // Fallback: pehle se session hai?
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe()
        router.replace('/onboarding')
      }
    })

    // 8 seconds mein kuch nahi → error
    const timer = setTimeout(() => {
      setError('Could not verify. The link may have expired.')
    }, 8000)

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [router])

  if (error) {
    return (
      <div className="mx-auto max-w-sm px-6 py-32 text-center">
        <h1 className="font-serif text-3xl">Link expired</h1>
        <p className="mt-3 text-sm text-muted">{error}</p>
        <a href="/" className="btn mt-6 inline-block">Try again</a>
      </div>
    )
  }

  return <Developing text="Signing you in…" />
}
