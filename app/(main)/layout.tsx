// ============================================================
// FILE: app/(main)/layout.tsx — PROTECTED PAGES LAYOUT
// ============================================================
// "(main)" ek ROUTE GROUP hai.
// Bracket wala folder URL mein NAHI aata:
//   /gallery (sahi)    ← URL mein "(main)" nahi dikhta
//   /main/gallery (galat)
//
// ISKA FAYDA:
// Gallery, Upload, Profile, Photo — sab pages ek hi guard share karte hain.
// Guard = RequireSession component — bina login andar nahi ja sakte.
//
// STRUCTURE:
//   RequireSession (guard)
//     └── children (gallery, upload, profile, photo — jo bhi URL pe ho)
// ============================================================

import RequireSession from "@/components/RequireSession";
// Guard component — login check karta hai

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // children → current page (gallery, upload, profile, ya photo detail)

  return <RequireSession>{children}</RequireSession>;
  // Sab (main) pages automatically RequireSession se wrapped hote hain
  // Agar login nahi kiya → redirect ho jaayega
}
