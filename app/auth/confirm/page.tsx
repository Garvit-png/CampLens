"use client"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH CONFIRM PAGE (/auth/confirm)
// Google login ke baad Supabase yahan redirect karta hai
// Yeh page kya karta hai:
//   1. URL mein code dhundho
//   2. Supabase se session banao
//   3. Admin panel pe bhejo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabaseClient"
import Developing from "@/components/Developing"

export default function ConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  useEffect(() => {
    async function handleAuth() {
      // URL mein error hai? (access denied etc.)
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const urlError = params.get("error_description") ?? hashParams.get("error_description")
      if (urlError) { setError(urlError); return }

      const sb = createClient()

      // Pehle se session hai? (page refresh case)
      const { data: { session } } = await sb.auth.getSession()
      if (session) { router.replace("/admin"); return }

      // Session nahi — SIGNED_IN event ka wait karo
      // Supabase URL hash mein token detect karega aur session set karega
      const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
        if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          subscription.unsubscribe()
          router.replace("/admin")
        }
      })

      // 10 second mein kuch nahi hua → error
      setTimeout(() => setError("Login timed out. Please try again."), 10000)
    }
    handleAuth()
  }, [router])

  if (error) return (
    <div className="mx-auto max-w-sm px-6 py-32 text-center">
      <h1 className="font-serif text-4xl">Sign in failed</h1>
      <p className="mt-3 text-sm text-muted">{error}</p>
      <a href="/login" className="btn mt-8 inline-block">Try again</a>
    </div>
  )

  return <Developing text="Signing you in…" />
}
