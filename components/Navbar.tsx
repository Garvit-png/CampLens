'use client';

// ============================================================
// FILE: components/Navbar.tsx — CAMPUSLENS TOP NAVIGATION
// ============================================================
// Design: Keshav (custom logo, warm paper background, rust accents, responsive)
// Logic:  Garvit (Supabase session aware)
//   - Gallery / Upload / Profile links sirf login + onboarding ke baad dikhte hain
//   - Current page ka link rust color mein highlight hota hai
//   - Logged in → "Sign out" button, logged out → "Login" button
// 'use client' isliye kyunki useState (mobile menu) aur useSession (hooks) use hote hain.
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '@/lib/session';

const navLinks = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/upload', label: 'Upload' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { supabaseUser, profile, signOut } = useSession();
  const currentPath = usePathname();
  const router = useRouter();

  // Mobile dropdown menu open (true) ya closed (false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Signed in = Google login + onboarding complete
  const isSignedIn = Boolean(supabaseUser && profile?.is_onboarding_complete);

  // Kisi bhi link pe click → mobile menu band karo
  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  async function handleSignOut() {
    await signOut();
    closeMobileMenu();
    router.push('/');
  }

  function linkClass(href: string, mobile: boolean) {
    const isActive = currentPath.startsWith(href);
    const base = mobile
      ? 'rounded-md px-3 py-2 font-medium transition-colors hover:bg-[#f1e8d6] hover:text-[#C4512F]'
      : 'font-medium transition-colors hover:text-[#C4512F]';
    return `${base} ${isActive ? 'text-[#C4512F]' : 'text-gray-700'}`;
  }

  return (
    // sticky top-0 → scroll karne pe bhi upar chipka rahe; z-50 → content ke upar
    <nav className="sticky top-0 z-50 border-b border-[#e5dccb] bg-[#FCF7EE] shadow-xs">
      <div className="w-full px-3 sm:px-4 md:px-5">

        {/* Main Navbar Row */}
        <div className="flex h-16 md:h-18 items-center justify-between py-2">

          {/* ===== 1. LOGO & BRAND NAME ===== */}
          <Link
            href={isSignedIn ? '/gallery' : '/'}
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
            onClick={closeMobileMenu}
          >
            <Image
              src="/logo.png"
              alt="CampusLens Logo"
              width={130}
              height={108}
              className="h-12 md:h-13 w-auto object-contain shrink-0"
              priority
              unoptimized
            />
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-[#C4512F]">
              CampusLens
            </span>
          </Link>

          {/* ===== 2. DESKTOP NAVIGATION (md+ screens) ===== */}
          <div className="hidden items-center gap-7 md:flex">
            {isSignedIn &&
              navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href, false)}>
                  {link.label}
                </Link>
              ))}

            {isSignedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-[#C4512F] px-5 py-2 font-medium text-[#C4512F] transition-colors hover:bg-[#C4512F] hover:text-white shadow-xs"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-[#C4512F] px-5 py-2 font-medium text-white transition-colors hover:bg-[#a83d1e] shadow-xs"
              >
                Login
              </Link>
            )}
          </div>

          {/* ===== 3. MOBILE HAMBURGER TOGGLE (sirf mobile pe) ===== */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-2xl text-gray-700 transition-colors hover:bg-[#f1e8d6] hover:text-[#C4512F] md:hidden"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* ===== 4. MOBILE DROPDOWN MENU ===== */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="flex flex-col gap-3 border-t border-[#e5dccb] py-4 md:hidden"
          >
            {isSignedIn &&
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={linkClass(link.href, true)}
                >
                  {link.label}
                </Link>
              ))}

            {isSignedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md border border-[#C4512F] px-4 py-2.5 text-center font-medium text-[#C4512F] transition-colors hover:bg-[#C4512F] hover:text-white"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="rounded-md bg-[#C4512F] px-4 py-2.5 text-center font-medium text-white transition-colors hover:bg-[#a83d1e]"
              >
                Login
              </Link>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}
