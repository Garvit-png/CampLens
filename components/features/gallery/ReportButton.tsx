// ============================================================
// FILE: components/ReportButton.tsx — PHOTO REPORT BUTTON
// ============================================================
// Photo detail page pe yeh button dikhta hai.
// User inappropriate photo ko report kar sakta hai.
//
// FLOW:
//   1. "Report this photo" button click karo
//   2. Browser confirm popup — "Report this photo to moderators?"
//   3. OK → "Reported · under review" stamp dikhao
//   4. Cancel → kuch nahi hota
//
// ABHI: Sirf UI state change (demo)
// REAL MEIN: Backend ko request jayegi, admin review karega
// ============================================================

"use client";
// Client component: useState use kar rahe hain

import { useState } from "react";

export default function ReportButton() {
  const [isReported, setIsReported] = useState(false);
  // false = abhi report nahi kiya
  // true = report ho gaya (stamp dikhao)

  function handleReport() {
    // window.confirm → browser ka native OK/Cancel popup
    // true → OK dabaya, false → Cancel dabaya
    if (window.confirm("Report this photo to the campus moderators?")) {
      setIsReported(true);
      // Report ho gaya → state update → stamp dikhao
      // Baad mein: yahan backend API call jaayegi
      // jaise: await fetch('/api/report', { method: 'POST', body: { photoId } })
    }
  }

  // --- REPORTED STATE (stamp dikhao) ---
  if (isReported) {
    return (
      <p className="rubber-stamp -rotate-3 text-rust" role="status">
        {/* role="status" → screen reader ko batao: yeh status update hai */}
        Reported · under review
        {/* Stamp style mein — jaise "REPORTED" stamp lag gaya photo pe */}
      </p>
    );
  }

  // --- DEFAULT STATE (button dikhao) ---
  return (
    <button
      type="button"
      onClick={handleReport}
      className="text-xs font-bold uppercase tracking-widest text-muted underline underline-offset-4 hover:text-rust"
      // underline underline-offset-4 → underline with gap
      // hover:text-rust → hover pe orange-red (attention color)
    >
      Report this photo
    </button>
  );
}
