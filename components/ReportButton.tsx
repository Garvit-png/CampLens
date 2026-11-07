// Galat photo ko report karne ka button.
"use client";

import { useState } from "react";

export default function ReportButton() {
  const [isReported, setIsReported] = useState(false);

  function handleReport() {
    // Browser ka OK / Cancel popup
    if (window.confirm("Report this photo to the campus moderators?")) {
      setIsReported(true); // baad mein yahan backend ko request jaayegi
    }
  }

  if (isReported) {
    return (
      <p className="rubber-stamp -rotate-3 text-rust" role="status">
        Reported · under review
      </p>
    );
  }

  return (
    <button type="button" onClick={handleReport} className="text-xs font-bold uppercase tracking-widest text-muted underline underline-offset-4 hover:text-rust">
      Report this photo
    </button>
  );
}
