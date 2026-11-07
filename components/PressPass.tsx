// Fest ka "press pass" — lanyard pe latka hua card. Profile aur onboarding preview mein.

import { getInitials } from "@/lib/helpers";

interface PressPassProps {
  name: string;
  collegeName: string;
  batchYear: string | number | null;
  email: string;
  uploads?: number;
  className?: string;
}

export default function PressPass({ name, collegeName, batchYear, email, uploads, className = "" }: PressPassProps) {
  const initials = name.trim() ? getInitials(name) : "?";

  return (
    <div className={`relative mx-auto w-full max-w-[19rem] ${className}`}>
      {/* lanyard ki patti */}
      <div className="mx-auto h-20 w-9 bg-[repeating-linear-gradient(135deg,var(--color-pink)_0_10px,var(--color-sun)_10px_20px)] border-x-2 border-ink" />
      {/* clip */}
      <div className="relative z-10 mx-auto -mt-1 h-7 w-14 rounded-md border-2 border-ink bg-sky">
        <div className="mx-auto mt-2 h-1.5 w-7 rounded-full bg-ink" />
      </div>

      <div className="-mt-3 overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[6px_6px_0_var(--color-ink)]">
        <div className="flex items-center justify-between bg-pink px-5 pb-3 pt-6 text-white">
          <span className="font-display text-2xl">Press</span>
          <span className="text-sm font-semibold">All access</span>
        </div>

        <div className="px-5 pb-5 pt-5">
          <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-ink bg-sun font-display text-4xl">
            <span key={initials} className="animate-pop">{initials}</span>
          </div>
          <p className="mt-4 break-words font-display text-[1.65rem] leading-tight">{name.trim() || "Your name"}</p>
          <p className="mt-1 text-ink-soft">{collegeName}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t-2 border-dashed border-ink/30 pt-4 text-sm">
            <div>
              <dt className="text-ink-soft">Batch</dt>
              <dd className="font-semibold">{batchYear ? `Class of ${batchYear}` : "Not set"}</dd>
            </div>
            {uploads !== undefined && (
              <div>
                <dt className="text-ink-soft">Uploads</dt>
                <dd className="font-semibold">{uploads}</dd>
              </div>
            )}
            <div className="col-span-2 min-w-0">
              <dt className="text-ink-soft">Email</dt>
              <dd className="truncate font-semibold">{email}</dd>
            </div>
          </dl>
        </div>

        {/* neeche barcode */}
        <div className="h-10 border-t-2 border-ink bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_2px,transparent_2px_5px,var(--color-ink)_5px_6px,transparent_6px_10px)] opacity-80" />
      </div>
    </div>
  );
}
