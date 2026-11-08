// ============================================================
// FILE: app/login/page.tsx — LOGIN PAGE ("/login")
// ============================================================
// Yahan user apni COLLEGE EMAIL se sign in karta hai.
//
// IMPORTANT: Sirf college ka registered email domain allowed hai.
//   ✅ garvit@rishihood.edu.in → allowed
//   ❌ garvit@gmail.com         → blocked
//   ❌ garvit@yahoo.com         → blocked
//
// FLOW:
//   1. College select nahi kiya? → Home page pe redirect
//   2. College stamp dikhao (left side)
//   3. Email input + validation
//   4. Submit → "Checking..." (fake delay) → Onboarding pe jao
//
// NOTE: Abhi sirf browser-side validation hai.
// Real mein: Supabase Auth → server pe magic link email jayegi
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CollegeStamp from "@/components/CollegeStamp";
// Left side pe college ka stamp dikhane ke liye

import Developing from "@/components/Developing";
// Redirect ho raha ho tab placeholder

import { getCollege } from "@/lib/helpers";
// College ID se poora College object dhundhta hai

import { colleges } from "@/lib/mockData";
// Sab colleges — CollegeStamp ka index find karne ke liye

import { useSession } from "@/lib/session";
// Session se: collegeId, signIn function, switchCampus function


export default function LoginPage() {
  const { isReady, collegeId, signIn, switchCampus } = useSession();
  // isReady      → localStorage load hua?
  // collegeId    → kaunsa college selected hai (null = koi nahi)
  // signIn       → email se login karne ka function
  // switchCampus → alag college choose karna (sab clear karo)

  const router = useRouter();

  const [email, setEmail] = useState("");
  // Email input ki value yahan store hogi

  const [errorMessage, setErrorMessage] = useState("");
  // Validation error message — khaali = koi error nahi

  const [isSending, setIsSending] = useState(false);
  // true = form submit ho raha hai (button disable karne ke liye)


  const college = getCollege(collegeId);
  // collegeId se College object dhundho
  // Example: "rishihood" → { name: "Rishihood University", emailDomains: [...], ... }


  useEffect(() => {
    if (isReady && !college) router.replace("/");
    // Guard: Agar college select nahi kiya → home pe bhej do
    // isReady check: localStorage load hone ke baad hi check karo
    // !college: getCollege ne undefined return kiya (collegeId null hai)
  }, [isReady, college, router]);


  if (!college) {
    return <Developing />;
    // College nahi mila ya redirect ho raha hai → loading dikhao
  }


  const domain = college.emailDomains[0];
  // College ka pehla (primary) email domain
  // Example: "rishihood.edu.in"
  // Placeholder mein use hoga: "yourname@rishihood.edu.in"


  // ----------------------------------------------------------
  // EMAIL VALIDATION FUNCTION
  // ----------------------------------------------------------
  // Return value: error message string ya "" (khaali = valid)
  // Empty string = sab theek
  // Koi text = error message dikhao
  // ----------------------------------------------------------
  function validateEmail(value: string): string {
    if (value.trim() === "") return "Please enter your email.";
    // Khaali email → error

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "That doesn't look like a valid email.";
      // Regex: basic email format check
      // /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      //   ^ = start
      //   [^\s@]+ = ek ya zyada characters (space aur @ ke alawa)
      //   @ = @ symbol
      //   [^\s@]+ = domain name
      //   \. = dot
      //   [^\s@]+ = TLD (.com, .in, etc.)
      //   $ = end
    }

    const emailDomain = value.split("@")[1].toLowerCase();
    // "garvit@rishihood.edu.in".split("@") → ["garvit", "rishihood.edu.in"]
    // [1] → "rishihood.edu.in"
    // .toLowerCase() → case insensitive check

    if (!college!.emailDomains.includes(emailDomain)) {
      return `Use your @${domain} email.`;
      // College ka domain match nahi karta → specific error message
      // Template literal: "Use your @rishihood.edu.in email."
      // college! → non-null assertion (TypeScript ko batao: college null nahi hai)
    }

    return "";
    // Sab checks pass → khaali string = valid email
  }


  // ----------------------------------------------------------
  // FORM SUBMIT HANDLER
  // ----------------------------------------------------------
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Default browser form submit prevent karo (page reload rok do)

    const error = validateEmail(email);
    // Email validate karo

    setErrorMessage(error);
    // Error message set karo (UI mein dikhega)

    if (error) return;
    // Error hai → yahan rok do, submit mat karo

    setIsSending(true);
    // Loading state ON karo → button "Checking..." dikhega

    await new Promise((resolve) => setTimeout(resolve, 900));
    // 900ms ka artificial delay — real API call simulate karna
    // Real mein: Supabase magic link bhejega (1-2 seconds lagenge)
    // await → yahan ruko jab tak 900ms poori na ho jaaye

    signIn(email.trim().toLowerCase());
    // Session mein login karo
    // .trim() → extra spaces remove
    // .toLowerCase() → lowercase mein store karo

    router.push("/onboarding");
    // Onboarding page pe jao (naam + batch bharna hai)
  }


  // ----------------------------------------------------------
  // CAMPUS CHANGE HANDLER
  // ----------------------------------------------------------
  function handleChangeSchool() {
    switchCampus();
    // Session clear karo (college aur user dono)
    router.push("/");
    // Home pe jao → college dobara choose karo
  }


  const collegeIndex = colleges.findIndex((c) => c.id === college.id);
  // College ka index dhundho (0, 1, 2, 3)
  // CollegeStamp ko index chahiye — color scheme ke liye
  // findIndex → matching element ka index return karta hai (-1 agar nahi mila)


  return (
    <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-16 md:grid-cols-[1fr_1.2fr] md:py-24">
      {/*
        grid → two-column layout on medium screens
        md:grid-cols-[1fr_1.2fr] → left column 1 part, right column 1.2 parts
                                    right side thoda bada
        items-center → dono columns vertically center aligned
      */}

      {/* LEFT: College Stamp */}
      <div className="mx-auto w-60 -rotate-3">
        {/* -rotate-3 → thoda left tilt — photo/postcard feel */}
        <CollegeStamp college={college} index={collegeIndex} />
      </div>

      {/* RIGHT: Login Form */}
      <div>
        <p className="label">Step 2 of 3 · Sign in</p>

        <h1 className="font-serif text-5xl leading-tight">
          Welcome back to {college.name}.
        </h1>

        <p className="mt-4 text-sm text-muted">
          Use your college email — we&apos;ll check it belongs to your campus.
          {/* &apos; → apostrophe character ' HTML entity */}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          {/* noValidate → browser ki default validation band karo (hum khud kar rahe hain) */}
          {/* space-y-5 → form ke children ke beech 20px vertical space */}

          <div>
            <label htmlFor="email" className="label">College email</label>
            {/* htmlFor → input ke id se connect karta hai (click pe focus) */}

            <input
              id="email"
              type="email"
              value={email}
              // Controlled input: React ka state → input value
              onChange={(e) => setEmail(e.target.value)}
              // Har character type hone pe email state update hoti hai
              placeholder={`yourname@${domain}`}
              // Template literal: "yourname@rishihood.edu.in"
              className="field"
              aria-invalid={errorMessage !== ""}
              // aria-invalid → screen readers ko batao: invalid hai ya nahi
              // errorMessage khaala hai → false (valid)
              // errorMessage mein kuch hai → true (invalid)
            />

            {errorMessage && (
              // Short circuit rendering: errorMessage truthy ho tab hi render karo
              <p className="mt-2 text-xs font-bold text-rust" role="alert">
                {errorMessage}
                {/* role="alert" → screen reader turant padhega (accessibility) */}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSending} className="btn w-full">
            {isSending ? "Checking…" : "Sign in"}
            {/* Ternary: submit ho raha hai → "Checking…", nahi → "Sign in" */}
            {/* Ellipsis … → animated feel (real loading indicator nahi, sirf text change) */}
          </button>
        </form>

        <button
          type="button"
          onClick={handleChangeSchool}
          className="mt-6 text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Not your school? Change it
          {/* Agar galat college select kiya → yeh click karo */}
        </button>
      </div>
    </div>
  );
}
