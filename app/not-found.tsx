// Yeh automatically tab dikhega jab koi URL exist na kare
// Example: /random-page → 404 Not Found

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center 
                    justify-center text-center px-4"
    >
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold text-gray-800 mb-3">
        404 — Page Nahi Mila
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Yeh page exist nahi karta. Shayad URL galat hai ya page delete ho gaya.
      </p>
      <Link
        href="/"
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl 
                   hover:bg-indigo-700 transition-colors font-medium"
      >
        🏠 Home Pe Wapas Jao
      </Link>
    </div>
  );
}
