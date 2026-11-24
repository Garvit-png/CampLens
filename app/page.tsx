"use client"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOME PAGE (/)
// Student kya karta hai:
//   1. College search karo → stamp click karo
//   2. Batch year select karo (optional)
//   3. "Open Archive" → gallery khulti hai
// No login needed!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CollegeStamp from "@/components/CollegeStamp"
import Postmark from "@/components/Postmark"
import Developing from "@/components/Developing"
import { createClient } from "@/lib/supabaseClient"
import { useSession } from "@/lib/session"
import type { College } from "@/types"

// Batch years dropdown: current year se agle 7 saal
const BATCHES = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + 2 - i)

export default function HomePage() {
  const { collegeId, setCollege, setBatch } = useSession()
  const router = useRouter()

  const [colleges, setColleges] = useState<College[]>([])  // DB se load hogi
  const [search, setSearch] = useState("")                  // Search input
  const [picked, setPicked] = useState<string | null>(null) // College ID jo select hua
  const [batch, setBatchLocal] = useState("")               // Selected batch
  const [step, setStep] = useState<"college" | "batch">("college") // Current step

  // App load hote hi DB se saare colleges load karo
  useEffect(() => {
    createClient()
      .from("colleges")
      .select("id, name, city, college_email_domains(domain)")
      .eq("is_active", true)
      .then(({ data }) => {
        if (!data) return
        setColleges(data.map((c: any) => ({
          id: c.id,
          name: c.name,
          city: c.city,
          emailDomains: c.college_email_domains?.map((d: any) => d.domain) ?? [],
        })))
      })
  }, [])

  // Agar college pehle se localStorage mein saved hai → seedha gallery
  useEffect(() => {
    if (collegeId) router.replace("/gallery")
  }, [collegeId, router])

  // Step 1: College stamp click → Step 2 pe jao
  function pickCollege(id: string) {
    setPicked(id)
    setStep("batch")
  }

  // Step 2: Form submit → college + batch session mein save karo → gallery
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!picked) return
    setCollege(picked)         // Session mein college set karo (photos load honge)
    if (batch) setBatch(batch) // Batch bhi save karo (analytics ke liye)
    router.push("/gallery")
  }

  // Colleges load nahi hue abhi
  if (!colleges.length) return <Developing text="Loading colleges…" />

  // ── STEP 2: Batch selection ──────────────────
  if (step === "batch") {
    const college = colleges.find(c => c.id === picked)
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="label">Step 2 of 2</p>
        <h1 className="font-serif text-4xl mt-2">What's your batch?</h1>
        <p className="mt-3 text-sm text-muted">Selected: <strong>{college?.name}</strong></p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {/* Batch dropdown — optional */}
          <select value={batch} onChange={e => setBatchLocal(e.target.value)}
            className="field w-full text-center text-lg">
            <option value="">Select batch (optional)</option>
            {BATCHES.map(y => <option key={y} value={y}>Class of {y}</option>)}
          </select>
          <button type="submit" className="btn w-full py-4 text-lg">Open the Archive →</button>
          <button type="button" onClick={() => setStep("college")}
            className="text-sm text-muted underline underline-offset-4">← Change college</button>
        </form>
      </div>
    )
  }

  // ── STEP 1: College selection ────────────────
  // Search: naam ya city se filter karo
  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="relative">
        <p className="label">Step 1 of 2 · Choose your campus</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-tight md:text-7xl">Select your school.</h1>
        <p className="mt-4 max-w-lg text-muted">Every campus keeps its own archive of memories.</p>

        {/* Decorative postmark stamp (top right) */}
        <Postmark label="CAMPUSLENS • ARCHIVE • EST 2026 •" center="POST"
          className="absolute -top-4 right-0 hidden w-36 rotate-12 text-rust/70 md:block" />

        {/* Search input */}
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by college or city…" className="field mt-8 max-w-md" />
      </section>

      {/* College stamps grid */}
      {filtered.length === 0
        ? <p className="mt-16 text-muted">No college matches "{search}".</p>
        : (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((c, i) => (
              <button key={c.id} type="button" onClick={() => pickCollege(c.id)}
                className={`text-left transition duration-300 hover:-translate-y-2 hover:rotate-0 ${i % 2 === 0 ? "-rotate-2" : "rotate-2"}`}>
                <CollegeStamp college={c} index={i} />
              </button>
            ))}
          </div>
        )
      }
    </div>
  )
}
