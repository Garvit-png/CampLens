// Poore page ka loading state: camera jiska flash baar baar chamakta hai.

import { FlashCamera } from "@/components/Illustrations";

export default function PageLoader({ text = "Loading your campus" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center py-36" role="status" aria-live="polite">
      <FlashCamera className="w-36 animate-bob" />
      <p className="mt-6 font-display text-xl">{text}</p>
      <span className="mt-3 flex gap-1.5" aria-hidden="true">
        <span className="h-2 w-2 animate-bounce rounded-full bg-pink" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-sun [animation-delay:120ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-leaf [animation-delay:240ms]" />
      </span>
    </div>
  );
}
