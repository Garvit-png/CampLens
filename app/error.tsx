// Kisi page mein error aaye to white screen ki jagah ye dikhta hai (Next.js special file).
// Error pages hamesha "use client" hote hain.
"use client";

import { FlashCamera } from "@/components/Illustrations";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error); // developer ke liye asli error console mein

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <FlashCamera className="w-32 -rotate-12" />
      <h1 className="mt-6 font-display text-5xl">That shot didn&apos;t come out.</h1>
      <p className="mt-4 text-lg text-ink-soft">Something broke while loading this page. Try again, and if it keeps happening, refresh.</p>
      <button type="button" onClick={reset} className="btn mt-8">Try again</button>
    </div>
  );
}
