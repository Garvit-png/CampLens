"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Developing from "@/components/Developing";
import { createClient } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setErrorMessage("Sign in failed. Please try again.");
    }
    // Already admin? Redirect to admin panel
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/admin");
      }
    });
  }, [router]);

  async function handleAdminLogin() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setErrorMessage(`Error: ${error.message}`);
        setIsLoading(false);
      }
      // Error nahi → Google page pe redirect ho jayega

    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong. Try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="font-serif text-4xl leading-tight">Admin Sign In</h1>
        <p className="mt-4 text-sm text-muted">
          Sign in with your admin Google account to access the admin panel.
        </p>
      </div>

      {errorMessage && (
        <p className="text-xs font-bold text-rust w-full text-center" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleAdminLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 rounded-md border-2 border-ink bg-white px-6 py-4 font-bold transition hover:bg-paper-light disabled:opacity-50"
      >
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        {isLoading ? "Redirecting to Google…" : "Sign in with Google"}
      </button>

      <p className="text-xs text-muted text-center">
        Only authorized admin accounts can access the panel.
      </p>

      <a
        href="/"
        className="text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        ← Back to Gallery
      </a>
    </div>
  );
}