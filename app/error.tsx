// ============================================================
// FILE: app/error.tsx — ERROR BOUNDARY (500 PAGE)
// ============================================================
// Kisi bhi page mein runtime error aaye toh white screen ki jagah yeh dikhta hai.
// Yeh Next.js ka SPECIAL FILE hai — automatically error boundary ban jaata hai.
//
// IMPORTANT:
//   - Error pages HAMESHA "use client" hote hain
//   - Server components crash ho toh yeh catch karta hai
//   - "error" prop mein actual error aata hai
//   - "reset" function call karo → page dobara render try karega
// ============================================================

"use client";
// Error boundary zaroor client component hai (Next.js rule)

// ----------------------------------------------------------
// PROPS
// ----------------------------------------------------------
// error → Error object (kya gadbad hui, stack trace, etc.)
// reset  → function: call karo toh page dobara render karega
// ----------------------------------------------------------
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  // Developer ke liye: asli error console mein log karo
  // Production mein: yahan Sentry ya similar error tracking service call hogi

  return (
    <div className="mx-auto max-w-sm px-6 py-32">
      <h1 className="font-serif text-5xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">Please try again in a moment.</p>

      <button type="button" onClick={reset} className="btn mt-8">
        Try again
        {/* reset() → page dobara render try karo (error resolve ho gaya ho toh) */}
      </button>
    </div>
  );
}
