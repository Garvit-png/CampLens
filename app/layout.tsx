// Root layout: har page ka common frame. Navbar upar, Footer neeche, beech mein page.
// SessionProvider sabko wrap karta hai, taaki har page chuna hua college aur user jaan sake.

import type { Metadata } from "next";
import { Familjen_Grotesk, Shrikhand } from "next/font/google";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "@/lib/session";
import "./globals.css";

// Shrikhand: Gujarati lettering se inspired retro display font (headings)
// Familjen Grotesk: thoda quirky sans-serif (baaki sab text)
const shrikhand = Shrikhand({ variable: "--font-shrikhand", subsets: ["latin"], weight: "400" });
const familjen = Familjen_Grotesk({ variable: "--font-familjen", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusLens",
  description: "The photo wall for your whole campus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shrikhand.variable} ${familjen.variable} antialiased`}>
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
