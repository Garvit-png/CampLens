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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Confirm event:', event, !!session)
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        redirect()
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirect()
    })

    const timer = setTimeout(() => {
      if (!done) {
        setError('Sign in timed out. Please try again.')
      }
    }, 10000)

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
