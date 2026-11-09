'use client';

// ============================================================
// FILE: components/Navbar.tsx — CAMPUSLENS TOP NAVIGATION
// ============================================================
// 'use client' is required because this component uses React state (useState)
// to toggle the mobile hamburger menu open/closed on user clicks.
// ============================================================

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  // State to track whether the mobile dropdown menu is open (true) or closed (false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to close the mobile menu whenever a user clicks any navigation link
  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    // Navbar container:
    // - sticky top-0: stays pinned to the top when scrolling
    // - z-50: stays above all page content
    // - bg-[#FCF7EE]: custom warm paper background color
    <nav className="sticky top-0 z-50 border-b border-[#e5dccb] bg-[#FCF7EE] shadow-xs">
      <div className="w-full px-3 sm:px-4 md:px-5">

        {/* Main Navbar Row */}
        <div className="flex h-16 md:h-18 items-center justify-between py-2">

          {/* ===== 1. LOGO & BRAND NAME ===== */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
            onClick={closeMobileMenu}
          >
            {/* Custom Stamp & Camera Logo image (PNG cropped & high-res) */}
            <Image
              src="/logo.png"
              alt="CampusLens Logo"
              width={130}
              height={108}
              className="h-12 md:h-13 w-auto object-contain shrink-0"
              priority
              unoptimized
            />

            {/* Brand Title: #C4512F (Rust) color */}
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-[#C4512F]">
              CampusLens
            </span>
          </Link>

          {/* ===== 2. DESKTOP NAVIGATION LINKS (Hidden on mobile, visible on md screens) ===== */}
          <div className="hidden items-center gap-7 md:flex">

            {/* Gallery link: transitions to #C4512F on hover */}
            <Link
              href="/gallery"
              className="font-medium text-gray-700 transition-colors hover:text-[#C4512F]"
            >
              Gallery
            </Link>

            {/* Upload link: transitions to #C4512F on hover */}
            <Link
              href="/upload"
              className="font-medium text-gray-700 transition-colors hover:text-[#C4512F]"
            >
              Upload
            </Link>

            {/* Profile link: transitions to #C4512F on hover */}
            <Link
              href="/profile"
              className="font-medium text-gray-700 transition-colors hover:text-[#C4512F]"
            >
              Profile
            </Link>

            {/* Login Button:
                - Default background: #C4512F
                - Hover background: darker rust shade #a83d1e
            */}
            <Link
              href="/login"
              className="rounded-lg bg-[#C4512F] px-5 py-2 font-medium text-white transition-colors hover:bg-[#a83d1e] shadow-xs"
            >
              Login
            </Link>

          </div>

          {/* ===== 3. MOBILE HAMBURGER TOGGLE BUTTON (Visible only on mobile) ===== */}
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
            <Link
              href="/gallery"
              onClick={closeMobileMenu}
              className="rounded-md px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-[#f1e8d6] hover:text-[#C4512F]"
            >
              Gallery
            </Link>

            <Link
              href="/upload"
              onClick={closeMobileMenu}
              className="rounded-md px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-[#f1e8d6] hover:text-[#C4512F]"
            >
              Upload
            </Link>

            <Link
              href="/profile"
              onClick={closeMobileMenu}
              className="rounded-md px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-[#f1e8d6] hover:text-[#C4512F]"
            >
              Profile
            </Link>

            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="rounded-md bg-[#C4512F] px-4 py-2.5 text-center font-medium text-white transition-colors hover:bg-[#a83d1e]"
            >
              Login
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
}
