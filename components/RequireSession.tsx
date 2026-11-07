// "Darwaan" (guard) component: andar wale pages tabhi dikhte hain jab
//   1. college chuna ho      → nahi to "/" (college select)
//   2. login kiya ho         → nahi to "/login"
//   3. profile bhari ho      → nahi to "/onboarding"
//
// Note: ye sirf UI ke liye hai. Asli security server + database (RLS) mein hogi.
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Developing from "@/components/Developing";
import { useSession } from "@/lib/session";

export default function RequireSession({ children }: { children: React.ReactNode }) {
  const { isReady, collegeId, user } = useSession();
  const router = useRouter();

  // Kahan bhejna hai? null = kahin nahi, page dikhao
  let redirectTo: string | null = null;
  if (isReady) {
    if (!collegeId) redirectTo = "/";
    else if (!user) redirectTo = "/login";
    else if (!user.fullName) redirectTo = "/onboarding";
  }

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!isReady || redirectTo) {
    return <Developing />;
  }
  return children;
}
