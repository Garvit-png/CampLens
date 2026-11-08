// ============================================================
// FILE: app/login/page.tsx — LOGIN PAGE ("/login")
// ============================================================
// User apni college email se sign in karta hai.
// Supabase "Magic Link" bhejta hai — password nahi chahiye!
//
// MAGIC LINK KYA HOTA HAI?
// User email type kare → Supabase us email pe ek special link bhejta hai
// User link click kare → automatically logged in
// Password yaad rakhne ki zaroorat nahi
//
// FLOW:
//   1. College select nahi kiya? → Home pe redirect
//   2. Email daalo (sirf college domain allowed)
//   3. Submit → Supabase magic link bhejta hai
//   4. "Check your email" message dikhao
//   5. User email mein link click kare → /auth/callback → /onboarding
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CollegeStamp from "@/components/CollegeStamp";
import Developing from "@/components/Developing";
import { getCollege } from "@/lib/helpers";
import { colleges } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
// Real Supabase client — magic link bhejne ke liye
import { useSession } from "@/lib/session";


export default function LoginPage() {
  const { isReady, collegeId, switchCampus } = useSession();
  // signIn ab use nahi karenge — Supabase auth handle karega

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  // emailSent = true → "Check your email" screen dikhao

  const college = getCollege(collegeId);

  useEffect(() => {
    if (isReady && !college) router.replace("/");
  }, [isReady, college, router]);

  if (!college) return <Developing />;

  const domain = college.emailDomains[0];


  // ----------------------------------------------------------
  // EMAIL VALIDATION
  // ----------------------------------------------------------
  function validateEmail(value: string): string {
    if (value.trim() === "") return "Please enter your email.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "That doesn't look like a valid email.";

    const emailDomain = value.split("@")[1].toLowerCase();
    if (!college!.emailDomains.includes(emailDomain))
      return `Use your @${domain} email.`;

    return "";
  }


  // ----------------------------------------------------------
  // FORM SUBMIT — REAL SUPABASE MAGIC LINK
  // ----------------------------------------------------------
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = validateEmail(email);
    setErrorMessage(error);
    if (error) return;

    setIsSending(true);

    try {
      const supabase = createClient()
      // Browser-side Supabase client banao

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        // signInWithOtp = "Sign In With One Time Password"
        // Yeh magic link bhejta hai email pe

        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Magic link click karne ke baad yahan redirect hoga
          // window.location.origin = "http://localhost:3000" ya production URL
        },
      })

      if (authError) {
        // Exact error message dikhao debugging ke liye
        setErrorMessage(`Error: ${authError.message}`)
        console.error("Auth error:", authError.message, authError)
        return
      }

      setEmailSent(true)
      // Success → "Check your email" screen dikhao

    } catch (err) {
      setErrorMessage("Network error. Check your connection.")
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  function handleChangeSchool() {
    switchCampus();
    router.push("/");
  }

  const collegeIndex = colleges.findIndex((c) => c.id === college.id);


  // ----------------------------------------------------------
  // EMAIL SENT SUCCESS SCREEN
  // ----------------------------------------------------------
  if (emailSent) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="rubber-stamp -rotate-3 text-teal text-2xl">Sent!</p>
        <h1 className="mt-8 font-serif text-4xl">Check your email.</h1>
        <p className="mt-4 text-muted">
          We sent a magic link to <strong>{email}</strong>.
          <br />
          Click the link in the email to sign in.
        </p>
        <p className="mt-8 text-xs text-muted">
          Didn&apos;t get it? Check spam, or{" "}
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="underline hover:text-ink"
          >
            try again
          </button>
          .
        </p>
      </div>
    )
  }


  // ----------------------------------------------------------
  // LOGIN FORM
  // ----------------------------------------------------------
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-16 md:grid-cols-[1fr_1.2fr] md:py-24">

      {/* College Stamp */}
      <div className="mx-auto w-60 -rotate-3">
        <CollegeStamp college={college} index={collegeIndex} />
      </div>

      {/* Form */}
      <div>
        <p className="label">Step 2 of 3 · Sign in</p>
        <h1 className="font-serif text-5xl leading-tight">
          Welcome back to {college.name}.
        </h1>
        <p className="mt-4 text-sm text-muted">
          Use your college email — we&apos;ll send you a magic link.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="label">College email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`yourname@${domain}`}
              className="field"
              aria-invalid={errorMessage !== ""}
            />
            {errorMessage && (
              <p className="mt-2 text-xs font-bold text-rust" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSending} className="btn w-full">
            {isSending ? "Sending…" : "Send magic link"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleChangeSchool}
          className="mt-6 text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Not your school? Change it
        </button>
      </div>
    </div>
  );
}
