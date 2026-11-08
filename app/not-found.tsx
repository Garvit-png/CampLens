// ============================================================
// FILE: app/not-found.tsx — 404 PAGE
// ============================================================
// Jab koi URL exist nahi karta toh yeh page dikhta hai.
// Yeh Next.js ka SPECIAL FILE hai — automatically 404 handle karta hai.
//
// EXAMPLES:
//   /random-page     → 404 (yeh route exist nahi karta)
//   /photo/xyz-invalid → 404 (agar notFound() call ho)
// ============================================================

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-32">

      {/* Rubber stamp style — "Return to sender" (daak wala theme) */}
      <p className="rubber-stamp -rotate-3 text-rust">
        Return to sender · 404
        {/* "Return to sender" → post office jaisa theme — galat address pe letter wapas */}
      </p>

      <h1 className="mt-6 font-serif text-5xl">Page not found</h1>
      <p className="mt-3 text-sm text-muted">
        The link may be broken, or the photo was removed.
      </p>

      <Link href="/" className="btn mt-8">
        Back home
        {/* Home page pe wapas jao */}
      </Link>
    </div>
  );
}
