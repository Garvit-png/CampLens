// "(main)" ek route group hai: bracket wala folder URL mein nahi aata.
// (/gallery hi rahega, /main/gallery nahi). Iska fayda: andar ke saare pages
// (gallery, upload, profile, photo) ek hi guard (RequireSession) share karte hain.

import RequireSession from "@/components/RequireSession";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <RequireSession>{children}</RequireSession>;
}
