// ============================================================
// FILE: components/Postmark.tsx — GOL DAAK MHAR (DECORATIVE)
// ============================================================
// Gol postmark stamp — sirf decoration ke liye (functional nahi).
// Gallery aur home page pe角落 mein dikhta hai.
//
// SVG ka use:
//   - textPath se text ko circle ke path pe chalaya jaata hai
//   - Do circles (outer + inner) — real postmark jaisa
//   - Beech mein bada text (jaise "POST")
// ============================================================

interface PostmarkProps {
  label: string;   // Gol ghoomta hua text (outer circle pe)
  center: string;  // Beech ka bada text (jaise "POST" ya "'26")
  className?: string; // Additional Tailwind classes (position, rotation, color)
}

export default function Postmark({ label, center, className = "" }: PostmarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      // viewBox → SVG ka coordinate system (120x120 units)
      className={className}
      aria-hidden="true"
      // aria-hidden → decorative hai, screen reader skip karo
    >
      {/* defs → reusable SVG elements (path yahan define kiya, neeche use kiya) */}
      <defs>
        {/* Circular path — text iske upar chalega */}
        <path
          id="postmark-ring"
          d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
          // M60,60     → center point pe move
          // m-44,0     → 44 left (radius)
          // a44,44 0 1,1 88,0 → arc: full circle (right side)
          // a44,44 0 1,1 -88,0 → arc: full circle (left side)
          // Result: ek perfect circle of radius 44 centered at (60,60)
        />
      </defs>

      {/* Outer circle (bada ring) */}
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
      {/* cx,cy → center coordinates */}
      {/* r → radius */}
      {/* fill="none" → transparent fill (sirf outline) */}
      {/* stroke="currentColor" → color parent se inherit karo (text color) */}

      {/* Inner circle (chhota ring) */}
      <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="1.5" />

      {/* Circular text — path ke upar chalta hai */}
      <text fontSize="9" letterSpacing="2.2" fontWeight="700" fill="currentColor">
        <textPath href="#postmark-ring">
          {/* textPath → text ko path ke shape mein ghooma do */}
          {/* href="#postmark-ring" → upar defined path use karo */}
          {label}
          {/* "CAMPUSLENS • ARCHIVE • EST 2026 •" — gol ghoomta hua */}
        </textPath>
      </text>

      {/* Center text (bada) */}
      <text
        x="60" y="66"
        // x,y → text ka position (60 = center, 66 = thoda neeche for vertical centering)
        textAnchor="middle"
        // textAnchor="middle" → text horizontally center
        fontSize="17" fontWeight="700" fill="currentColor"
      >
        {center}
        {/* "POST" ya "'26" — beech mein bada text */}
      </text>
    </svg>
  );
}
