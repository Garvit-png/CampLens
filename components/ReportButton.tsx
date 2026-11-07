// Galat photo ko report karne ka button.
"use client";

import { useState } from "react";
import { FlagIcon } from "@/components/Icons";

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
      <p className="inline-flex animate-pop items-center gap-2 rounded-lg bg-sun px-3 py-1.5 text-sm font-semibold" role="status">
        Reported. A moderator will review it.
      </p>
    );
  }

  return (
    <button type="button" onClick={handleReport} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft underline decoration-2 underline-offset-4 transition hover:text-alarm">
      <FlagIcon className="h-4 w-4" />
      Report this photo
    </button>
  );
}
