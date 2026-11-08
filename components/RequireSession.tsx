"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Developing from "@/components/Developing";
import { useSession } from "@/lib/session";

export default function RequireSession({ children }: { children: React.ReactNode }) {
  const { isReady, supabaseUser, profile } = useSession();
  const router = useRouter();

  let redirectTo: string | null = null;

  if (isReady) {
    if (!supabaseUser) {
      // Supabase session nahi → home pe bhejo (college select karo)
      redirectTo = "/";
    } else if (!profile?.is_onboarding_complete) {
      // Logged in but onboarding nahi hua → onboarding pe bhejo
      redirectTo = "/onboarding";
    }
    // College selection ab home page se hoti hai — Supabase email domain se auto-detect
  }

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!isReady || redirectTo) return <Developing />;

  return children;
}
