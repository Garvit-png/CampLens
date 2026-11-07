// Upar wali bar. Login hone ke baad hi links dikhte hain.
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { getCollege } from "@/lib/helpers";
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
    <header className="border-b-2 border-ink bg-paper/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href={isSignedIn ? "/gallery" : "/"} className="flex items-center gap-2">
          {/* Chhota camera lens jaisa logo */}
          <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink">
            <span className="h-3 w-3 rounded-full bg-rust" />
          </span>
          <span className="font-serif text-2xl">CampusLens</span>
        </Link>

        {isSignedIn && (
          <>
            <div className="hidden items-center gap-7 text-sm font-bold uppercase tracking-wider md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={currentPath.startsWith(link.href) ? "text-rust" : "hover:text-rust"}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleSwitchCampus}
                className="rubber-stamp -rotate-2 text-teal hover:rotate-0"
                title="Switch campus"
              >
                {college?.name ?? "Campus"}
              </button>
            </div>

            <button
              type="button"
              className="text-sm font-bold uppercase md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? "Close" : "Menu"}
            </button>
          </>
        )}
      </nav>

      {isSignedIn && isMenuOpen && (
        <div className="flex flex-col border-t-2 border-ink px-6 py-2 text-sm font-bold uppercase md:hidden">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="py-2.5">
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
