// Login ("/login"). Sirf chune hue college ke email domain se login hoga.
// Note: ye check sirf browser mein hai (jaldi error dikhane ke liye).
// Asli check server pe hoga. Email bhejna abhi fake hai — baad mein Supabase Auth lagega.
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CollegeStamp from "@/components/CollegeStamp";
import Developing from "@/components/Developing";
import { getCollege } from "@/lib/helpers";
import { colleges } from "@/lib/mockData";
import { useSession } from "@/lib/session";

export default function LoginPage() {
  const { isReady, collegeId, signIn, switchCampus } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const college = getCollege(collegeId);

  // College nahi chuna → pehle college select karo
  useEffect(() => {
    if (isReady && !college) router.replace("/");
  }, [isReady, college, router]);

  if (!college) {
    return <Developing />;
  }

  const domain = college.emailDomains[0];

  // Error ho to message, sab theek ho to "" (khaali)
  function validateEmail(value: string): string {
    if (value.trim() === "") return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "That doesn't look like a valid email.";
    const emailDomain = value.split("@")[1].toLowerCase(); // "@" ke baad wala hissa
    if (!college!.emailDomains.includes(emailDomain)) return `Use your @${domain} email.`;
    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // form submit pe page reload na ho

    const error = validateEmail(email);
    setErrorMessage(error);
    if (error) return;

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 900)); // fake wait
    signIn(email.trim().toLowerCase());
    router.push("/onboarding");
  }

  function handleChangeSchool() {
    switchCampus();
    router.push("/");
  }

  // Chune hue college ka index (stamp ka color same rahe)
  const collegeIndex = colleges.findIndex((c) => c.id === college.id);

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-16 md:grid-cols-[1fr_1.2fr] md:py-24">
      <div className="mx-auto w-60 -rotate-3">
        <CollegeStamp college={college} index={collegeIndex} />
      </div>

      <div>
        <p className="label">Step 2 of 3 · Sign in</p>
        <h1 className="font-serif text-5xl leading-tight">Welcome back to {college.name}.</h1>
        <p className="mt-4 text-sm text-muted">Use your college email — we&apos;ll check it belongs to your campus.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="label">College email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`yourname@${domain}`}
              className="field"
              aria-invalid={errorMessage !== ""}
            />
            {errorMessage && (
              <p className="mt-2 text-xs font-bold text-rust" role="alert">{errorMessage}</p>
            )}
          </div>

          <button type="submit" disabled={isSending} className="btn w-full">
            {isSending ? "Checking…" : "Sign in"}
          </button>
        </form>

        <button type="button" onClick={handleChangeSchool} className="mt-6 text-sm text-muted underline underline-offset-4 hover:text-ink">
          Not your school? Change it
        </button>
      </div>
    </div>
  );
}
