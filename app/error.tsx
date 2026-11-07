// Kisi page mein error aaye to white screen ki jagah ye dikhta hai (Next.js special file).
// Error pages hamesha "use client" hote hain.
"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error); // developer ke liye asli error console mein

  return (
    <div className="mx-auto max-w-sm px-6 py-32">
      <h1 className="font-serif text-5xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">Please try again in a moment.</p>
      <button type="button" onClick={reset} className="btn mt-8">
        Try again
      </button>
    </div>
  );
}
