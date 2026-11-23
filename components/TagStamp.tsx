// ============================================================
// FILE: components/TagStamp.tsx — HASHTAG KA RUBBER STAMP
// ============================================================
// Gallery mein "Popular stamps" section mein yeh dikhte hain.
// Ek hashtag ko rubber stamp jaisa dikhata hai — with count.
//
// INTERACTION:
//   - Click karo → us tag ki search ho jaati hai
//   - Active tag → highlighted (darker/pressed look)
//   - Same tag dobara click → search clear ho jaati hai
// ============================================================

import { cleanHashtag } from "@/lib/helpers";
// cleanHashtag → "#Damru26" → "Damru26" (display ke liye clean)

interface TagStampProps {
  tag: string;       // Hashtag text (without #)
  count: number;     // Kitni photos mein yeh tag use hua
  index: number;     // Position — rotation decide karta hai
  isActive: boolean; // Abhi search mein active hai ya nahi
  onClick: () => void; // Click handler
}

export default function TagStamp({ tag, count, index, isActive, onClick }: TagStampProps) {
  // index ke hisaab se rotation — scattered stamp look
  const rotations = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2"];
  const rotation = rotations[index % rotations.length];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      // aria-pressed → screen reader ko batao: yeh toggle button hai, active ya nahi

      className={`rubber-stamp ${isActive ? "text-ink" : "text-rust"} ${rotation} hover:rotate-0`}
      // rubber-stamp → custom CSS class (stamp look — border, slight texture)
      // isActive → text-ink (dark, pressed look)
      // !isActive → text-rust (orange-red, normal look)
      // hover:rotate-0 → hover pe seedha ho jaata hai
    >
      #{cleanHashtag(tag)}
      {/* Display: "#Damru26" — # explicitly add kar rahe hain */}

      <span className="ml-1.5 text-[10px] opacity-60">
        ×{count}
        {/* "×4" — kitni photos mein use hua */}
      </span>
    </button>
  );
}
