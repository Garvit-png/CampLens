// 404 page — galat URL ya notFound() call hone pe dikhta hai (Next.js special file).

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-32">
      <p className="rubber-stamp -rotate-3 text-rust">Return to sender · 404</p>
      <h1 className="mt-6 font-serif text-5xl">Page not found</h1>
      <p className="mt-3 text-sm text-muted">The link may be broken, or the photo was removed.</p>
      <Link href="/" className="btn mt-8">
        Back home
      </Link>
    </div>
  );
}
