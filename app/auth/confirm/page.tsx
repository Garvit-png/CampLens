'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Developing from '@/components/Developing'

export default function ConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function handleAuth() {
      // URL se params nikalo
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorParam = params.get('error')

      // Error aaya? (jaise expired link)
      if (errorParam) {
        setErrorMsg('Link expired. Please request a new magic link.')
        setStatus('error')
        return
      }

      const supabase = createClient()

      // PKCE flow: ?code= wala URL
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Code exchange error:', error.message)
          setErrorMsg('Link expired or already used. Please request a new one.')
          setStatus('error')
          return
        }
        router.replace('/onboarding')
        return
      }

      // Implicit flow: #access_token= wala hash
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        // Hash mein token hai — onAuthStateChange detect karega
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe()
            router.replace('/onboarding')
          }
        })

        // 5 second timeout
        setTimeout(() => {
          setErrorMsg('Could not verify login. Please try again.')
          setStatus('error')
        }, 5000)
        return
      }

      // Koi token nahi — already logged in?
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/onboarding')
        return
      }

      setErrorMsg('No login token found. Please request a new magic link.')
      setStatus('error')
    }

    handleAuth()
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
