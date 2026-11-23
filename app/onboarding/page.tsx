"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Developing from "@/components/ui/Developing";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Onboarding is no longer needed — students select college/batch directly on home page
    router.replace("/");
  }, [router]);

  return <Developing text="Redirecting…" />;
}