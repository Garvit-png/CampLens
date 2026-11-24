// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GALLERY PAGE (/gallery)
// Yeh file sirf ek kaam karti hai:
//   URL se "tag" parameter padho aur GalleryView ko do
//   /gallery?tag=Damru26 → GalleryView ko "Damru26" pass karo
// Poora gallery logic GalleryView component mein hai.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import GalleryView from "@/components/GalleryView"

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams
  // key={tag} → tag change hone pe GalleryView fresh start ho
  return <GalleryView key={tag ?? ""} initialSearch={tag ?? ""} />
}
