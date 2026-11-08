// ============================================================
// FILE: app/page.tsx — HOME PAGE ("/")
// ============================================================
// Yeh CampusLens ka PEHLA PAGE hai.
// User yahan aata hai aur apna college choose karta hai.
//
// FLOW:
//   1. Pehle se logged in hai? → Gallery pe redirect (seedha andar)
//   2. Nahi → 4 college stamps dikhao
//   3. Search box se naam/city se filter kar sako
//   4. College click karo → Login page pe jao
//
// Next.js mein app/page.tsx → "/" URL automatically
// ============================================================

"use client";
// 'use client' zaroori hai:
// - useSession() (React Context) use kar rahe hain
// - useRouter() use kar rahe hain
// - useState use kar rahe hain
// Yeh sab browser mein chalte hain, server pe nahi

import { useRouter } from "next/navigation";
// useRouter → programmatically page navigate karne ke liye
// router.push("/login") → user ko login page pe le jao
// router.replace("/gallery") → history mein replace (back button se nahi aayega)

import { useEffect, useState } from "react";
// useEffect → side effects (jaise redirect) ke liye
// useState   → searchText store karne ke liye

import CollegeStamp from "@/components/CollegeStamp";
// Postage stamp style college card component

import Developing from "@/components/Developing";
// Loading/placeholder component — jab data ready nahi hota

import Postmark from "@/components/Postmark";
// Decorative circular postmark stamp (visual element)

import { colleges } from "@/lib/mockData";
// 4 colleges ki list (abhi fake, real mein Supabase se aayegi)

import { useSession } from "@/lib/session";
// Session se isReady, collegeId, user aur selectCollege milenge


export default function SelectSchoolPage() {
  // Default export → Next.js yeh "/" pe render karega

  const { isReady, collegeId, user, selectCollege } = useSession();
  // isReady    → localStorage padh liya? (false = abhi loading)
  // collegeId  → kaunsa college selected hai (null = koi nahi)
  // user       → login kiya hua user (null = koi nahi)
  // selectCollege → college choose karne ka function

  const router = useRouter();
  // Router object — navigation ke liye

  const [searchText, setSearchText] = useState("");
  // Search box mein jo user type kar raha hai woh yahan store hoga
  // "" = khaali (sab colleges dikhao)


  const isAlreadySignedIn = isReady && collegeId !== null && Boolean(user?.fullName);
  // Pehle se completely signed in hai? Teeno conditions:
  // 1. isReady → localStorage padh liya
  // 2. collegeId !== null → college selected hai
  // 3. Boolean(user?.fullName) → naam bhi fill hai (onboarding complete)
  // user?.fullName → optional chaining: user null ho to crash na kare


  useEffect(() => {
    if (isAlreadySignedIn) router.replace("/gallery");
    // Pehle se signed in → gallery pe bhej do
    // .replace() → browser history mein home page nahi bachega
    //   (Back button press karo → gallery pe hi rahoge, home nahi jaoge)
  }, [isAlreadySignedIn, router]);
  // isAlreadySignedIn change hone pe dobara check karo
  // (jab localStorage load ho tab bhi trigger hoga)


  if (!isReady || isAlreadySignedIn) {
    return <Developing />;
    // Do cases mein loading show karo:
    // 1. isReady false → localStorage abhi load ho raha hai
    // 2. isAlreadySignedIn → redirect ho raha hai gallery pe
    //    (redirect instant nahi hota, wait karo)
  }


  // ----------------------------------------------------------
  // SEARCH FILTER
  // ----------------------------------------------------------
  const query = searchText.trim().toLowerCase();
  // .trim() → "  rishihood  " → "rishihood"
  // .toLowerCase() → "RISHIHOOD" → "rishihood" (case insensitive)

  const visibleColleges = colleges.filter(
    (college) =>
      college.name.toLowerCase().includes(query) ||
      college.city.toLowerCase().includes(query)
    // Naam mein match hai → dikhao
    // Ya City mein match hai → dikhao
    // "pune" type karo → Northfield (Pune) dikhega
  );


  // ----------------------------------------------------------
  // COLLEGE SELECT HANDLER
  // ----------------------------------------------------------
  function handlePick(id: string) {
    selectCollege(id);
    // Session mein college store karo
    router.push("/login");
    // Login page pe le jao
  }


  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      {/*
        max-w-6xl → maximum width limit (bade screens pe bahut wide nahi hoga)
        mx-auto   → horizontally center karo
        px-6      → horizontal padding (edges pe space)
        py-16     → vertical padding
        md:py-20  → medium screens pe zyada padding
      */}

      <section className="relative">
        {/* relative → Postmark ko absolute position karne ke liye reference */}

        <p className="label">Step 1 of 3 · Choose your campus</p>
        {/* label → custom Tailwind class (globals.css mein defined) */}
        {/* Small uppercase text — step counter */}

        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] md:text-7xl">
          Select your school.
        </h1>
        {/*
          font-serif → DM Serif Display font (headings ke liye)
          text-5xl   → mobile: 3rem font size
          md:text-7xl → desktop: 4.5rem (bada)
          leading-[1.05] → line height: 1.05 (tight, display headings ke liye)
        */}

        <p className="mt-5 max-w-lg text-muted">
          Every campus keeps its own archive. Pick yours to see its fests, farewells and late
          nights — in prints.
        </p>
        {/* text-muted → custom color (globals.css mein defined) — lighter gray text */}

        <Postmark
          label="CAMPUSLENS • ARCHIVE • EST 2026 •"
          center="POST"
          className="absolute -top-4 right-0 hidden w-36 rotate-12 text-rust/70 md:block"
          // absolute → parent section ke andar position karo
          // -top-4 → 16px upar se (section ke upar overlap)
          // right-0 → right corner mein
          // hidden → mobile pe hide karo
          // rotate-12 → 12 degree rotation (decorative)
          // text-rust/70 → rust color, 70% opacity
          // md:block → medium screens pe dikhao
        />

        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          // onChange → har keypress pe setSearchText call hoga
          // e.target.value → input mein jo likha hai woh value
          placeholder="Search by college or city…"
          aria-label="Search colleges"
          // aria-label → screen readers ke liye (accessibility)
          className="field mt-10 max-w-md"
          // field → custom Tailwind class (globals.css mein) — input styling
        />
      </section>

      {visibleColleges.length === 0 ? (
        // Ternary operator: condition ? value_if_true : value_if_false
        <p className="mt-16 text-muted">No college matches &quot;{searchText}&quot;.</p>
        // Koi match nahi mila → message dikhao
        // &quot; → HTML entity for " character (JSX mein direct " avoid karte hain)
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/*
            grid → CSS Grid layout
            grid-cols-1     → mobile: 1 column
            sm:grid-cols-2  → small screens: 2 columns
            lg:grid-cols-4  → large screens: 4 columns (sab colleges ek row mein)
            gap-10          → grid items ke beech 40px space
          */}

          {visibleColleges.map((college, index) => (
            // .map() → har college ke liye ek element render karo
            // college → current college object
            // index   → position number (0, 1, 2, 3)

            <button
              key={college.id}
              // key → React ko har item uniquely identify karne ke liye zaroori
              type="button"
              onClick={() => handlePick(college.id)}
              // Click pe handlePick call karo → college select + login redirect

              className={`text-left transition duration-300 hover:-translate-y-2 hover:rotate-0 ${
                index % 2 === 0 ? "-rotate-2" : "rotate-2"
              }`}
              // hover:-translate-y-2 → hover pe 8px upar uthta hai
              // hover:rotate-0 → hover pe seedha ho jaata hai
              // index % 2 === 0 ? "-rotate-2" : "rotate-2"
              //   Even index (0, 2) → left tilt
              //   Odd index (1, 3) → right tilt
              //   Scattered look jaise table pe rakhe photos

              aria-label={`Select ${college.name}`}
              // Screen reader ke liye button ka description
            >
              <CollegeStamp college={college} index={index} />
              {/* Postage stamp component — college ki info stamp style mein */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
