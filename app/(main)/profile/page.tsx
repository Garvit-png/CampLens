"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Developing from "@/components/ui/Developing";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // No student profiles anymore — redirect to home
    router.replace("/");
  }, [router]);

  return <Developing text="Redirecting…" />;
}