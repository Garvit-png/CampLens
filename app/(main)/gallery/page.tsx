// Gallery ("/gallery" ya "/gallery?tag=Khatam").
// Ye page bas URL se "tag" padhta hai aur GalleryView ko de deta hai.
// searchParams ek Promise hai (data thodi der mein aata hai), isliye await karte hain.

import GalleryView from "@/components/GalleryView";

interface GalleryPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { tag } = await searchParams;

  // key={tag}: URL ka tag badle to GalleryView fresh start ho
  return <GalleryView key={tag ?? ""} initialSearch={tag ?? ""} />;
}
