// Root layout: har page ka common frame. Navbar upar, Footer neeche, beech mein page.
// SessionProvider sabko wrap karta hai, taaki har page chuna hua college aur user jaan sake.

import type { Metadata } from "next";
import { Caveat, Courier_Prime, DM_Serif_Display } from "next/font/google";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "@/lib/session";
import "./globals.css";

// Teen fonts: typewriter (normal text), serif (headings), handwriting (photo captions)
const courier = Courier_Prime({ variable: "--font-courier", subsets: ["latin"], weight: ["400", "700"] });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400" });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusLens",
  description: "A shared archive of college memories.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${courier.variable} ${dmSerif.variable} ${caveat.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
