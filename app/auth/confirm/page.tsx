'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Developing from '@/components/Developing'

export default function ConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    async function handleAuth() {
      const supabase = createClient()

      // Implicit flow: token URL hash mein hota hai
      // Example: /auth/confirm#access_token=xxx&refresh_token=yyy
      // Supabase client automatically hash se session set karta hai
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session error:', error.message)
        setError(error.message)
        return
      }

      if (session) {
        // Session mil gaya → onboarding pe jao
        console.log('Session found:', session.user.email)
        router.replace('/onboarding')
        return
      }

      // Session nahi mila → thoda wait karo (hash process hone mein time lagta hai)
      // onAuthStateChange se session aayega
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth event on confirm:', event)
        if (session) {
          subscription.unsubscribe()
          router.replace('/onboarding')
        } else if (event === 'SIGNED_OUT') {
          setError('Sign in failed. Please try again.')
        }
      })

      // 5 seconds baad bhi session nahi → error
      setTimeout(() => {
        setError('Could not verify your login. Please try again.')
      }, 5000)
    }

    handleAuth()
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
