// Gol daak-ghar wali mohar (postmark) — sirf decoration ke liye.
// SVG mein text ko circle ke path pe chalaya hai (textPath).

interface PostmarkProps {
  label: string; // gol ghoomta hua text
  center: string; // beech ka bada text
  className?: string;
}

export default function Postmark({ label, center, className = "" }: PostmarkProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <path id="postmark-ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fontSize="9" letterSpacing="2.2" fontWeight="700" fill="currentColor">
        <textPath href="#postmark-ring">{label}</textPath>
      </text>
      <text x="60" y="66" textAnchor="middle" fontSize="17" fontWeight="700" fill="currentColor">
        {center}
      </text>
    </svg>
  );
}
