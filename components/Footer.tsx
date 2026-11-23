// ============================================================
// FILE: components/Footer.tsx — PAGE KA BOTTOM SECTION
// ============================================================
// Har page ke neeche yeh dikhta hai (root layout mein hai).
// Simple footer — CampusLens naam + tagline.
// ============================================================

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-paper px-6 py-8 text-center">
      {/* border-t-2 → top border 2px (separator from main content) */}
      {/* text-center → content center mein */}

      <p className="font-serif text-lg">CampusLens</p>
      {/* font-serif → DM Serif Display font (brand name) */}

      <p className="mt-1 text-xs uppercase tracking-widest text-muted">
        A shared archive of college memories
        {/* Tagline — small uppercase text */}
      </p>
    </footer>
  );
}
