// ============================================================
// FILE: components/EmptyState.tsx — "KUCH NAHI HAI" MESSAGE
// ============================================================
// Jab koi data nahi milta (jaise search mein 0 results):
// Ek khaali polaroid + message + optional button dikhata hai.
//
// USE CASES:
//   - Gallery: "No prints for #xyz"
//   - Profile: "Your roll is empty"
//   - Photo detail: "Print not found"
// ============================================================

interface EmptyStateProps {
  title: string;
  // Bada heading — "No photos here yet"

  message: string;
  // Chhota description — "Try another stamp, change the filters"

  children?: React.ReactNode;
  // Optional: button ya link (jaise "Clear search" ya "Upload a photo")
  // ? matlab optional — agar pass na karo toh kuch nahi dikhega
}

export default function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center">

      {/* Khaali polaroid (visual metaphor — "koi photo nahi") */}
      <div className="polaroid w-44 rotate-3">
        {/* w-44 → 176px width polaroid */}
        {/* rotate-3 → thoda tilted (scattered feel) */}

        <div className="grid aspect-square place-items-center bg-ink/85 text-xs uppercase tracking-widest text-paper/50">
          No print
          {/* Dark background pe "No print" text — khaali photo jaisa feel */}
        </div>

        <p className="mt-2 font-hand text-xl">nothing yet…</p>
        {/* Handwriting style text — photo caption jaisa */}
      </div>

      {/* Heading */}
      <h3 className="mt-8 font-serif text-3xl">{title}</h3>

      {/* Description */}
      <p className="mt-2 max-w-sm text-sm text-muted">{message}</p>
      {/* max-w-sm → maximum 384px (text too wide nahi hoga) */}

      {/* Optional button/link (agar children pass kiya) */}
      {children && (
        <div className="mt-6">{children}</div>
        // children → <Link>, <button>, ya kuch bhi React content
        // && → short circuit: children hai tabhi render karo
      )}
    </div>
  );
}
