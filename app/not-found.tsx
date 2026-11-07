// 404 page — galat URL ya notFound() call hone pe dikhta hai (Next.js special file).

import Link from "next/link";
import { EmptyFrame } from "@/components/Illustrations";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <EmptyFrame className="w-52" />
      <h1 className="misprint mt-6 font-display text-7xl">404</h1>
      <p className="mt-4 text-lg text-ink-soft">This page isn&apos;t on the wall. The link may be broken, or the photo was taken down.</p>
      <Link href="/" className="btn mt-8">Go to the home page</Link>
    </div>
  );
}
