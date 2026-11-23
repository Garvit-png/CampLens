// ============================================================
// FILE: app/layout.tsx — ROOT LAYOUT
// ============================================================
// Yeh SABSE UPAR wala wrapper hai — har page is ke andar render hota hai.
//
// STRUCTURE:
//   <html>
//     <body>
//       <SessionProvider>  ← session data sab pages ko milta hai
//         <Navbar />       ← hamesha upar dikhta hai
//         <main>           ← actual page yahan render hota hai
//           {children}
//         </main>
//         <Footer />       ← hamesha neeche dikhta hai
//       </SessionProvider>
//     </body>
//   </html>
//
// FONTS:
// Teen fonts use ho rahe hain — typewriter, serif, handwriting
// Yeh fonts Google Fonts se Next.js automatically download karta hai
// User ke browser se Google Fonts server pe request NAHI jati (privacy)
// ============================================================

import type { Metadata } from "next";
// Metadata type — page ki title aur description ke liye

import { Caveat, Courier_Prime, DM_Serif_Display } from "next/font/google";
// next/font/google → Google Fonts ko locally serve karta hai
// Privacy + performance ke liye: fonts build time pe download hote hain
// Caveat          → handwriting font (photo captions ke liye)
// Courier_Prime   → typewriter font (normal body text ke liye)
// DM_Serif_Display → serif font (headings ke liye — "CampusLens" jaise)

import Footer from "@/components/Footer";
// Footer component — har page ke neeche
// "@/" → project root se path (tsconfig mein set hai)

import Navbar from "@/components/Navbar";
// Navbar component — har page ke upar

import { SessionProvider } from "@/lib/session";
// SessionProvider — poori app ko wrap karta hai
// Iske andar koi bhi page useSession() use kar sakta hai

import "./globals.css";
// Global CSS — Tailwind, custom classes, CSS variables
// Sirf root layout mein import karte hain — automatically sab pages ko milta hai


// ----------------------------------------------------------
// FONT CONFIGURATION
// ----------------------------------------------------------
// variable → CSS custom property naam
// Yeh <html> element pe class ki tarah lagte hain
// globals.css mein "font-sans" → var(--font-courier) mapped hai
// ----------------------------------------------------------
const courier = Courier_Prime({
  variable: "--font-courier",
  // CSS mein: font-family: var(--font-courier) se use kar sakte hain
  subsets: ["latin"],
  // Sirf Latin characters download karo — file size kam
  weight: ["400", "700"],
  // 400 = normal, 700 = bold — sirf yeh do weights chahiye
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  // Serif font sirf ek weight mein use hota hai
});

const caveat = Caveat({
  variable: "--font-caveat",
  // Handwriting font — photo captions ke liye
  subsets: ["latin"],
});


// ----------------------------------------------------------
// METADATA — Browser tab aur SEO ke liye
// ----------------------------------------------------------
// Next.js yeh automatically <head> mein inject karta hai:
//   <title>CampusLens</title>
//   <meta name="description" content="..." />
// ----------------------------------------------------------
export const metadata: Metadata = {
  title: "CampusLens",
  description: "A shared archive of college memories.",
  // Favicon: app/icon.png (512x512 square logo) + app/apple-icon.png (180x180)
  // Next.js inhe file convention se khud <link> tags mein daal deta hai.
};


// ----------------------------------------------------------
// RootLayout COMPONENT
// ----------------------------------------------------------
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // children → current page ka content (Next.js automatically pass karta hai)
  // React.ReactNode → koi bhi valid React content ho sakta hai

  return (
    <html
      lang="en"
      // lang="en" → screen readers ko batata hai language English hai
      // Accessibility ke liye important

      className={`${courier.variable} ${dmSerif.variable} ${caveat.variable} antialiased`}
      // Teen font variables inject kar rahe hain
      // antialiased → Tailwind class: font smoothing ON karo
      //   Text edges smooth dikhenge (jagged nahi)
    >
      <body className="flex min-h-screen flex-col font-sans">
        {/*
          flex min-h-screen flex-col:
            Sticky footer pattern — body pura screen cover kare
            flex-col = upar se neeche layout
            min-h-screen = minimum poori window height

          font-sans:
            Tailwind class jo --font-courier use karta hai (globals.css mein mapped)
            Default body font → typewriter look
        */}

        <SessionProvider>
          {/*
            SessionProvider poora app wrap karta hai.
            Iske andar koi bhi component useSession() call kar sakta hai.
            Yahan isliye hai taaki Navbar bhi session access kar sake.
          */}

          <Navbar />
          {/* Top navigation — har page pe fixed dikhta hai */}

          <main className="flex-1">
            {/*
              flex-1 → sticky footer ke liye: main content sab available space lo
              Agar content kam bhi ho → footer bottom mein rahega
            */}
            {children}
            {/* Yahan actual page render hoga:
                "/" → app/page.tsx (college select)
                "/login" → app/login/page.tsx
                "/gallery" → app/(main)/gallery/page.tsx
                Next.js file-based routing automatically handle karta hai
            */}
          </main>

          <Footer />
          {/* Bottom footer — har page pe */}

        </SessionProvider>
      </body>
    </html>
  );
}
