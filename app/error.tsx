"use client";
// Error boundary = client component hona zaroori hai

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error; // Kya error aayi
  reset: () => void; // Dobara try karne ka function
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Error ko log karo (production mein Sentry ya similar tool use karo)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center 
                    justify-center text-center px-4"
    >
      <div className="text-8xl mb-6">😵</div>
      <h1 className="text-4xl font-bold text-gray-800 mb-3">
        Kuch Gadbad Ho Gayi
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Ek unexpected error aayi. Hum isko fix karne ki koshish karenge.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          // reset() → same page dobara try karo
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl 
                     hover:bg-indigo-700 transition-colors font-medium"
        >
          🔄 Dobara Try Karo
        </button>
        <a
          href="/"
          className="border-2 border-gray-300 text-gray-600 px-6 py-3 
                     rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          🏠 Home Pe Jao
        </a>
      </div>
    </div>
  );
}
