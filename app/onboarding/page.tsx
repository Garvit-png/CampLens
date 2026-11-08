// ============================================================
// FILE: app/onboarding/page.tsx — ONBOARDING ("/onboarding")
// ============================================================
// Login ke baad user apna NAAM aur BATCH YEAR bharta hai.
//
// INTERESTING FEATURE:
// Right side mein live Student ID Card preview hai.
// Jaise naam type karo → card pe instantly update hota hai.
// (React controlled components ka magic!)
//
// FLOW:
//   1. Login nahi kiya? → Redirect
//   2. Form + Live ID card dikhao
//   3. Submit → saveProfile() → Gallery pe jao
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Developing from "@/components/Developing";

import { getCollege } from "@/lib/helpers";

import { useSession } from "@/lib/session";

import type { SessionUser } from "@/types";
// SessionUser type — form component ko pass karne ke liye


// ----------------------------------------------------------
// BATCH YEARS LIST
// ----------------------------------------------------------
// Is saal se agle 5 saal tak ke options generate karo
// Dynamic: har saal automatically update hoga
// ----------------------------------------------------------
const thisYear = new Date().getFullYear();
// new Date() → current date/time
// .getFullYear() → sirf year nikalo (2026)

const batchYears: number[] = [];
// Khaali array banao numbers ke liye

for (let year = thisYear; year <= thisYear + 5; year++) {
  batchYears.push(year);
  // thisYear se start karo, 5 saal aage tak
  // 2026: [2026, 2027, 2028, 2029, 2030, 2031]
}


// ----------------------------------------------------------
// MAIN PAGE COMPONENT — Guard + Data Check
// ----------------------------------------------------------
export default function OnboardingPage() {
  const { isReady, collegeId, user } = useSession();
  const router = useRouter();
  const college = getCollege(collegeId);
  // collegeId se College object dhundho

  useEffect(() => {
    if (isReady && (!college || !user)) {
      router.replace(college ? "/login" : "/");
      // college hai but user nahi → login pe bhejo
      // college bhi nahi → home pe bhejo
    }
  }, [isReady, college, user, router]);

  if (!college || !user) {
    return <Developing />;
    // Data ready nahi ya redirect ho raha → loading
  }

  return <OnboardingForm collegeName={college.name} user={user} />;
  // Form ko alag component mein isliye:
  // Jab user data aa jaaye (localStorage se load ho) tab hi form render ho
  // Warna purana naam pehle se filled nahi milega edit mode mein
}


// ----------------------------------------------------------
// ONBOARDING FORM COMPONENT
// ----------------------------------------------------------
// Alag component isliye rakha taaki clearly samajh aaye kya ho raha hai
// Props mein user milta hai → pehle se bhare fields (edit mode ke liye)
// ----------------------------------------------------------
function OnboardingForm({ collegeName, user }: { collegeName: string; user: SessionUser }) {
  const { saveProfile } = useSession();
  // saveProfile → naam + batch session mein save karta hai

  const router = useRouter();

  const [fullName, setFullName] = useState(user.fullName);
  // user.fullName se initialize karo
  // Naya user: "" (khaali)
  // Edit karna: purana naam pehle se filled hoga

  const [batchYear, setBatchYear] = useState(user.batchYear ? String(user.batchYear) : "");
  // user.batchYear: 2027 → "2027" (select ke liye string chahiye)
  // null → "" (khaali option dikhao)
  // String() → number ko string mein convert karo

  const [errorMessage, setErrorMessage] = useState("");


  // ----------------------------------------------------------
  // FORM SUBMIT
  // ----------------------------------------------------------
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Page reload rokao

    if (fullName.trim().length < 2) {
      return setErrorMessage("Please enter your full name.");
      // Naam bahut chhota hai (1 character ya khaali) → error
      // return → yahan hi rokao, aage mat jao
    }

    if (!batchYear) {
      return setErrorMessage("Please pick your batch.");
      // Batch select nahi ki → error
    }

    saveProfile(fullName.trim(), Number(batchYear));
    // Session mein naam aur batch save karo
    // .trim() → extra spaces remove
    // Number(batchYear) → "2027" → 2027 (string → number)

    router.push("/gallery");
    // Gallery pe jao — onboarding complete!
  }


  return (
    <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-24">
      {/* Two column layout on desktop: Form | ID Card Preview */}

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
              // Har keystroke pe fullName update → ID card live update
              className="field"
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
              {/* Default empty option */}

              {batchYears.map((year) => (
                <option key={year} value={year}>
                  Class of {year}
                  {/* "Class of 2026", "Class of 2027" etc. */}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <p className="text-xs font-bold text-rust" role="alert">
              {errorMessage}
            </p>
          )}

          <button type="submit" className="btn w-full">
            Open the archive
          </button>
        </form>
      </div>

      {/* RIGHT: Live ID Card Preview */}
      <div className="rotate-2 rounded-md border-2 border-ink bg-paper-light shadow-[6px_6px_0_var(--color-ink)]">
        {/*
          rotate-2 → thoda tilted card
          shadow-[6px_6px_0_var(--color-ink)] → hard shadow (retro look)
          Arbitrary Tailwind value: square brackets mein custom value
        */}

        {/* Card Header */}
        <div className="flex items-center justify-between rounded-t-sm bg-teal px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-paper-light">
          <span>{collegeName}</span>
          {/* College naam left mein */}
          <span>Student ID</span>
          {/* Right mein "Student ID" */}
        </div>

        {/* Card Body */}
        <div className="flex gap-5 p-5">

          {/* Avatar placeholder — naam ka pehla letter */}
          <div className="grid h-28 w-24 shrink-0 place-items-center bg-ink/10 font-serif text-5xl text-ink/60">
            {fullName.trim().charAt(0).toUpperCase() || "?"}
            {/*
              fullName.trim() → spaces remove karo
              .charAt(0) → pehla character
              .toUpperCase() → capital mein
              || "?" → naam khaali ho to "?" dikhao

              LIVE UPDATE: jaise fullName state change hoti hai, yeh character turant update hota hai
            */}
          </div>

          {/* Details */}
          <dl className="min-w-0 space-y-2 text-sm">
            {/* dl = definition list (term + description pairs) */}

            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Name</dt>
              <dd className="truncate font-hand text-2xl leading-none">
                {fullName || "Your name"}
                {/* fullName hai → dikhao, khaali hai → "Your name" placeholder */}
                {/* font-hand → Caveat handwriting font */}
                {/* LIVE: naam type karo → yahan instantly dikhta hai */}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Batch</dt>
              <dd>
                {batchYear ? `Class of ${batchYear}` : "—"}
                {/* Batch selected → "Class of 2027", nahi → "—" */}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Email</dt>
              <dd className="truncate">{user.email}</dd>
              {/* truncate → email bahut lamba ho to "..." lagao */}
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
