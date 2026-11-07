// Upar wali bar (sticky). Login hone ke baad hi links dikhte hain.
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LensMark, Squiggle } from "@/components/Illustrations";
import { getCollege, getInitials } from "@/lib/helpers";
import { useSession } from "@/lib/session";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/upload", label: "Upload" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { collegeId, user, switchCampus } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentPath = usePathname();
  const router = useRouter();

  const college = getCollege(collegeId);
  const isSignedIn = Boolean(user?.fullName); // onboarding complete ho chuka hai

  function handleSwitchCampus() {
    switchCampus();
    setIsMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-6">
        <Link href={isSignedIn ? "/gallery" : "/"} className="group flex items-center gap-2.5">
          <LensMark className="h-9 w-9 transition-transform duration-300 group-hover:rotate-[20deg]" />
          <span className="font-display text-2xl">CampusLens</span>
        </Link>

        {isSignedIn && (
          <>
            <div className="hidden items-center gap-7 md:flex">
              {navLinks.map((link) => {
                const isActive = currentPath.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href} className="relative py-1 font-semibold">
                    {link.label}
                    {isActive && <Squiggle className="absolute -bottom-1.5 left-0 h-2 w-full" />}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleSwitchCampus}
                className="flex items-center gap-2 rounded-full border-2 border-ink bg-white py-1 pl-1 pr-3.5 text-sm font-semibold transition hover:bg-sun"
                title="Switch campus"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-pink font-display text-xs text-white">
                  {college ? getInitials(college.name) : "?"}
                </span>
                Switch campus
              </button>
            </div>

            <button
              type="button"
              className="rounded-full border-2 border-ink px-4 py-1 font-semibold md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
          </>
        )}
      </nav>

      {isSignedIn && isMenuOpen && (
        <div className="flex flex-col border-t-2 border-ink px-6 py-3 font-display text-2xl md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`py-2 ${currentPath.startsWith(link.href) ? "text-pink" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <button type="button" onClick={handleSwitchCampus} className="py-2 text-left font-sans text-base font-semibold text-ink-soft">
            Switch campus
          </button>
        </div>
      )}
    </header>
  );
}
