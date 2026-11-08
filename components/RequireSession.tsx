// ============================================================
// FILE: components/RequireSession.tsx — AUTH GUARD
// ============================================================
// Yeh ek "DARWAAN" (guard) component hai.
// Protected pages (gallery, upload, profile) is se wrapped hain.
//
// CHECKS (teeno zaroori):
//   1. College select kiya hai?  → nahi to "/" (home)
//   2. Login kiya hai?          → nahi to "/login"
//   3. Profile fill kiya hai?   → nahi to "/onboarding"
//
// Agar koi check fail → user redirect ho jaata hai, page nahi dikhta.
// Agar sab pass → children render hote hain (actual page).
//
// NOTE: Yeh sirf UI guard hai — asli security server + database (RLS) mein hogi.
// ============================================================

"use client";
// Client component: useRouter, useEffect, useSession use kar rahe hain

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Developing from "@/components/Developing";
// Loading placeholder — redirect hone tak dikhata hai

import { useSession } from "@/lib/session";

export default function RequireSession({ children }: { children: React.ReactNode }) {
  // children → protected page content (gallery, upload, profile, etc.)

  const { isReady, collegeId, user } = useSession();
  // isReady   → localStorage load hua? (false = abhi checking)
  // collegeId → college selected hai? (null = nahi)
  // user      → login kiya? (null = nahi)

  const router = useRouter();

  // ----------------------------------------------------------
  // REDIRECT LOGIC
  // ----------------------------------------------------------
  // redirectTo = null → sab theek, page dikhao
  // redirectTo = "/..." → redirect karo, page mat dikhao
  // ----------------------------------------------------------
  let redirectTo: string | null = null;

  if (isReady) {
    // Sirf tab check karo jab localStorage load ho chuka hai
    // (warna pehle se null dikhega aur galati se redirect kar dega)

    if (!collegeId) redirectTo = "/";
    // College nahi chuna → home pe bhej do

    else if (!user) redirectTo = "/login";
    // College chuna but login nahi → login pe bhej do

    else if (!user.fullName) redirectTo = "/onboarding";
    // Login kiya but naam nahi bhara → onboarding pe bhej do
  }


  // ----------------------------------------------------------
  // REDIRECT EFFECT
  // ----------------------------------------------------------
  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
    // router.replace → redirect karo (browser history mein nahi jayega)
    // .push ki jagah .replace isliye: back button se wapas na aaye
  }, [redirectTo, router]);
  // redirectTo change hone pe effect chalega


  // ----------------------------------------------------------
  // RENDER LOGIC
  // ----------------------------------------------------------
  if (!isReady || redirectTo) {
    return <Developing />;
    // Do cases mein loading dikhao:
    // 1. !isReady → localStorage abhi load ho raha hai
    // 2. redirectTo → redirect ho raha hai (instant nahi hota)
  }

  return children;
  // Sab checks pass → actual page content dikhao
}
