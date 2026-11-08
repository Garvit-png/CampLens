// ============================================================
// FILE: components/Navbar.tsx — TOP NAVIGATION BAR
// ============================================================
// Har page ke upar yeh bar dikhti hai.
// Login hone ke baad hi links (Gallery, Upload, Profile) dikhte hain.
// Mobile pe hamburger menu hai.
// ============================================================

"use client";
// Client component: useState, usePathname, useRouter use kar rahe hain

import Link from "next/link";
// Link → Next.js smart anchor (page reload nahi hota)

import { usePathname, useRouter } from "next/navigation";
// usePathname → current URL path batata hai (active link highlight ke liye)
// useRouter    → programmatic navigation ke liye

import { useState } from "react";

import { getCollege } from "@/lib/helpers";
// College ID se College object — naam dikhane ke liye

import { useSession } from "@/lib/session";
// Session se collegeId, user, switchCampus

// Navigation links — ek jagah define karo, kahin bhi change na karna pade
const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/upload",  label: "Upload"  },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { collegeId, user, switchCampus } = useSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Mobile menu open hai ya nahi — toggle button

  const currentPath = usePathname();
  // Current URL path — "/gallery", "/upload" etc.
  // Active link ko highlight karne ke liye

  const router = useRouter();

  const college = getCollege(collegeId);
  // College object — naam dikhane ke liye

  const isSignedIn = Boolean(user?.fullName);
  // user?.fullName → agar user hai aur uska naam hai → true
  // Boolean() → undefined/false ko false mein convert karo
  // Pehle se logged in hai → links dikhao, nahi toh sirf logo

  // ----------------------------------------------------------
  // CAMPUS SWITCH HANDLER
  // ----------------------------------------------------------
  function handleSwitchCampus() {
    switchCampus();
    // Session clear karo (college + user dono)
    setIsMenuOpen(false);
    // Mobile menu band karo
    router.push("/");
    // Home page pe jao → college dobara choose karo
  }


  return (
    <header className="border-b-2 border-ink bg-paper/80 backdrop-blur">
      {/* border-b-2 → bottom border 2px (section separator) */}
      {/* bg-paper/80 → paper color with 80% opacity (semi-transparent) */}
      {/* backdrop-blur → background blur effect (modern glass look) */}

      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        {/* flex → items ek line mein */}
        {/* justify-between → logo left, links right */}

        {/* --- LOGO --- */}
        <Link href={isSignedIn ? "/gallery" : "/"} className="flex items-center gap-2">
          {/* Login hai → gallery pe jao, nahi → home pe */}
          <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink">
            <span className="h-3 w-3 rounded-full bg-rust" />
            {/* Camera lens logo — circle ke andar chhoti dot */}
          </span>
          <span className="font-serif text-2xl">CampusLens</span>
        </Link>

        {/* --- DESKTOP NAV LINKS (sirf login ke baad) --- */}
        {isSignedIn && (
          <>
            <div className="hidden items-center gap-7 text-sm font-bold uppercase tracking-wider md:flex">
              {/* hidden md:flex → mobile pe hide, desktop pe dikhao */}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={currentPath.startsWith(link.href) ? "text-rust" : "hover:text-rust"}
                  // Active link → rust color (highlighted)
                  // startsWith → "/gallery" matches "/gallery" AND "/gallery?tag=Damru"
                >
                  {link.label}
                </Link>
              ))}

              {/* Campus switch button (stamp style) */}
              <button
                type="button"
                onClick={handleSwitchCampus}
                className="rubber-stamp -rotate-2 text-teal hover:rotate-0"
                title="Switch campus"
              >
                {college?.name ?? "Campus"}
                {/* College naam ya "Campus" fallback */}
              </button>
            </div>

            {/* --- MOBILE HAMBURGER BUTTON --- */}
            <button
              type="button"
              className="text-sm font-bold uppercase md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              // Toggle: open hai → "Close", band hai → "Menu"
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
          </>
        )}
      </nav>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {isSignedIn && isMenuOpen && (
        <div className="flex flex-col border-t-2 border-ink px-6 py-2 text-sm font-bold uppercase md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              // Link click pe menu band karo
              className="py-2.5"
            >
              {link.label}
            </Link>
          ))}
          <button type="button" onClick={handleSwitchCampus} className="py-2.5 text-left text-teal">
            Switch campus
          </button>
        </div>
      )}
    </header>
  );
}
