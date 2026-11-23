// ============================================================
// FILE: app/(main)/gallery/page.tsx — GALLERY PAGE ("/gallery")
// ============================================================
// Yeh page photos dikhata hai — lekin asli kaam GalleryView component karta hai.
// Yeh file sirf URL se "tag" parameter padhti hai aur GalleryView ko deta hai.
//
// URL EXAMPLES:
//   /gallery           → tag = "" (sab photos)
//   /gallery?tag=Damru26 → tag = "Damru26" (sirf Damru26 wali photos)
//
// searchParams ek PROMISE hai (Next.js 15+ mein async hai)
// Isliye "await" use kiya hai — data thodi der mein aata hai.
// ============================================================

import GalleryView from "@/components/GalleryView";
// GalleryView component — poora gallery UI + filters ismein hain

// ----------------------------------------------------------
// PROPS INTERFACE
// ----------------------------------------------------------
// searchParams ek object hai jisme URL query parameters aate hain
// Promise<{ tag?: string }> → async hai, tag optional hai
// ----------------------------------------------------------
interface GalleryPageProps {
  searchParams: Promise<{ tag?: string }>;
}

// ----------------------------------------------------------
// GALLERY PAGE COMPONENT
// ----------------------------------------------------------
// "async" isliye kyunki searchParams ek Promise hai — await karna padta hai
// ----------------------------------------------------------
export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { tag } = await searchParams;
  // searchParams resolve karo → { tag: "Damru26" } ya { tag: undefined }

  // key={tag ?? ""} → agar tag change ho toh GalleryView FRESH start ho
  // Jaise /gallery?tag=Damru26 se /gallery?tag=Khatam pe jao
  // → purana state (filters, scroll) reset ho jaata hai
  // React key change = component unmount + remount = clean slate
  return <GalleryView key={tag ?? ""} initialSearch={tag ?? ""} />;
  // tag ?? "" → agar tag undefined hai toh "" (khaali string) use karo
}
