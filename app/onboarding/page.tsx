// ============================================================
// FILE: app/onboarding/page.tsx — ONBOARDING ("/onboarding")
// ============================================================
// Magic link click karne ke baad yahan aata hai user.
// Naam aur batch year bharta hai → Supabase profiles table mein save.
//
// FLOW:
//   /auth/callback → /onboarding → user naam+batch bhare → /gallery
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Developing from "@/components/Developing";
import { createClient } from "@/lib/supabase/client";
// Real Supabase client — profile save karne ke liye

const thisYear = new Date().getFullYear();
const batchYears: number[] = [];
for (let year = thisYear; year <= thisYear + 5; year++) {
  batchYears.push(year);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [fullName, setFullName] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ----------------------------------------------------------
  // Page load pe: current user check karo + college dhundho
  // ----------------------------------------------------------
  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()

      // Supabase se current logged-in user lo
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        // User logged in nahi → login pe bhejo
        router.replace("/")
        return
      }

      setUserEmail(user.email ?? "")

      // Existing profile check karo — agar already complete hai toh gallery pe
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, batch_year, college_id, is_onboarding_complete")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profile?.is_onboarding_complete) {
        router.replace("/gallery")
        return
      }

      // Pehle se profile hai? Fields pre-fill karo
      if (profile) {
        setFullName(profile.full_name ?? "")
        setBatchYear(profile.batch_year ? String(profile.batch_year) : "")
        setCollegeId(profile.college_id ?? "")
      }

      // User ke email domain se college dhundho
      const emailDomain = (user.email ?? "").split("@")[1]
      const { data: domainRow } = await supabase
        .from("college_email_domains")
        .select("college_id, colleges(name)")
        .eq("domain", emailDomain)
        .maybeSingle()

      if (domainRow) {
        const cid = domainRow.college_id
        setCollegeId(cid)
        // colleges join se naam lo
        const cname = (domainRow.colleges as { name?: string } | null)?.name ?? ""
        setCollegeName(cname)
      }

      setIsLoading(false)
    }

    loadUserData()
  }, [router])


  // ----------------------------------------------------------
  // FORM SUBMIT — Profile Supabase mein save karo
  // ----------------------------------------------------------
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (fullName.trim().length < 2)
      return setErrorMessage("Please enter your full name.")
    if (!batchYear)
      return setErrorMessage("Please pick your batch.")

    setIsSaving(true)
    setErrorMessage("")

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setErrorMessage("Session expired. Please sign in again.")
        return
      }

      // Profiles table mein upsert karo (insert ya update)
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          // upsert = agar user_id pehle se hai → update, nahi hai → insert
          college_id: collegeId || null,
          full_name: fullName.trim(),
          batch_year: Number(batchYear),
          is_onboarding_complete: true,
          // true karo → ab gallery access milega
        })

      if (error) {
        console.error("Profile save error:", error.message)
        setErrorMessage("Could not save profile. Try again.")
        return
      }

      router.push("/gallery")
      // Profile saved → gallery pe jao!

    } catch (err) {
      console.error(err)
      setErrorMessage("Something went wrong.")
    } finally {
      setIsSaving(false)
    }
  }


  if (isLoading) return <Developing text="Loading your profile…" />

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-24">

      {/* LEFT: Form */}
      <div>
        <p className="label">Step 3 of 3 · Your ID card</p>
        <h1 className="font-serif text-5xl">Who&apos;s in the photo?</h1>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="fullName" className="label">Full name</label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="field"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="batch" className="label">Batch</label>
            <select
              id="batch"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              className="field"
            >
              <option value="">Select</option>
              {batchYears.map((year) => (
                <option key={year} value={year}>Class of {year}</option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <p className="text-xs font-bold text-rust" role="alert">{errorMessage}</p>
          )}

          <button type="submit" disabled={isSaving} className="btn w-full">
            {isSaving ? "Saving…" : "Open the archive"}
          </button>
        </form>
      </div>

      {/* RIGHT: Live ID Card Preview */}
      <div className="rotate-2 rounded-md border-2 border-ink bg-paper-light shadow-[6px_6px_0_var(--color-ink)]">
        <div className="flex items-center justify-between rounded-t-sm bg-teal px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-paper-light">
          <span>{collegeName || "Your College"}</span>
          <span>Student ID</span>
        </div>
        <div className="flex gap-5 p-5">
          <div className="grid h-28 w-24 shrink-0 place-items-center bg-ink/10 font-serif text-5xl text-ink/60">
            {fullName.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <dl className="min-w-0 space-y-2 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Name</dt>
              <dd className="truncate font-hand text-2xl leading-none">
                {fullName || "Your name"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Batch</dt>
              <dd>{batchYear ? `Class of ${batchYear}` : "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Email</dt>
              <dd className="truncate">{userEmail}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
