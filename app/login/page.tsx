// Login ("/login"). Sirf chune hue college ke email domain se login hoga.
// Note: ye check sirf browser mein hai (jaldi error dikhane ke liye).
// Asli check server pe hoga. Email bhejna abhi fake hai — baad mein Supabase Auth lagega.
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FestTicket from "@/components/FestTicket";
import PageLoader from "@/components/PageLoader";
import Spinner from "@/components/Spinner";
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
    return <PageLoader />;
  }

  const domain = college.emailDomains[0];

  // Error ho to message, sab theek ho to "" (khaali)
  function validateEmail(value: string): string {
    if (value.trim() === "") return "Enter your college email to continue.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "That doesn't look like an email address.";
    const emailDomain = value.split("@")[1].toLowerCase(); // "@" ke baad wala hissa
    if (!college!.emailDomains.includes(emailDomain)) return `Only @${domain} emails can join this campus.`;
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

  // Chune hue college ka index (ticket ka rang same rahe)
  const collegeIndex = colleges.findIndex((c) => c.id === college.id);

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-24">
      <div className="-rotate-3 md:order-2">
        <FestTicket college={college} index={collegeIndex} />
      </div>

      <div>
        <h1 className="font-display text-5xl leading-[1.02] md:text-6xl">Show your ticket at the gate.</h1>
        <p className="mt-5 text-lg text-ink-soft">Sign in with your {college.name} email so we know you belong here.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
          <div>
            <label htmlFor="email" className="label">College email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`yourname@${domain}`}
              className={`field ${errorMessage ? "border-alarm" : ""}`}
              aria-invalid={errorMessage !== ""}
            />
            {errorMessage && (
              <p className="mt-2 font-semibold text-alarm" role="alert">{errorMessage}</p>
            )}
          </div>

          <button type="submit" disabled={isSending} className="btn w-full">
            {isSending ? (
              <>
                <Spinner /> Checking your email
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <button type="button" onClick={handleChangeSchool} className="mt-6 font-semibold text-ink-soft underline decoration-2 underline-offset-4 hover:text-ink">
          Wrong college? Pick another
        </button>
      </div>
    </div>
  );
}
