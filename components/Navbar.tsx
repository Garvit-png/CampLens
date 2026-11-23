'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '@/lib/session';

export default function Navbar() {
  const { collegeId, college, clearStudent, isAdmin, isAdminReady, adminSignOut } = useSession();
  const currentPath = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Student has picked a college
  const hasCollege = Boolean(collegeId);

  function linkClass(href: string) {
    const active = currentPath.startsWith(href);
    return `font-medium transition-colors hover:text-[#C4512F] ${active ? 'text-[#C4512F]' : 'text-gray-700'}`;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e5dccb] bg-[#FCF7EE] shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <Link href={hasCollege ? '/gallery' : '/'} className="flex items-center gap-2">
          <Image src="/logo.png" alt="CampusLens" width={110} height={90}
            className="h-11 w-auto" priority unoptimized />
          <span className="text-2xl font-bold text-[#C4512F]">CampusLens</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {hasCollege && (
            <>
              <Link href="/gallery" className={linkClass('/gallery')}>Gallery</Link>
              {/* College name — click to change college */}
              <button onClick={clearStudent}
                className="text-sm text-muted border border-dashed border-ink/30 px-3 py-1 rounded hover:border-rust hover:text-rust transition-colors">
                {college?.name ?? 'College'} ✕
              </button>
            </>
          )}

          {/* Admin button — always visible, opens admin login */}
          <Link href={isAdmin ? '/admin' : '/login'}
            className="text-xs font-bold uppercase tracking-wider border border-ink/40 px-3 py-1.5 rounded hover:bg-ink hover:text-paper-light transition-colors">
            {isAdmin ? '⚙ Admin Panel' : 'Admin'}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="rounded p-2 text-xl text-gray-700 hover:bg-[#f1e8d6] md:hidden">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-[#e5dccb] bg-[#FCF7EE] px-4 py-4 md:hidden">
          {hasCollege && (
            <>
              <Link href="/gallery" onClick={() => setMenuOpen(false)} className="font-medium">Gallery</Link>
              <button onClick={() => { clearStudent(); setMenuOpen(false); }}
                className="text-left text-sm text-rust">Change College</button>
            </>
          )}
          <Link href={isAdmin ? '/admin' : '/login'} onClick={() => setMenuOpen(false)}
            className="text-sm font-bold uppercase">
            {isAdmin ? '⚙ Admin Panel' : 'Admin Login'}
          </Link>
        </div>
      )}
    </nav>
  );
}
