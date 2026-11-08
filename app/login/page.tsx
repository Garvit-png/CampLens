"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CollegeStamp from "@/components/CollegeStamp";
import Developing from "@/components/Developing";
import { getCollege } from "@/lib/helpers";
import { colleges } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selected_college_id");
    if (!saved) {
      router.replace("/");
    } else {
      setCollegeId(saved);
    }
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError) {
      setErrorMessage("Link expired. Please request a new magic link.");
    }
  }, [router]);

  const college = getCollege(collegeId ?? "");
  if (!collegeId || !college) return <Developing />;

  const domain = college.emailDomains[0];

  function validateEmail(value: string): string {
    if (value.trim() === "") return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "That doesn't look like a valid email.";
    const emailDomain = value.split("@")[1].toLowerCase();
    if (!college!.emailDomains.includes(emailDomain))
      return `Use your @${domain} email.`;
    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateEmail(email);
    setErrorMessage(error);
    if (error) return;

    setIsSending(true);
    try {
      const supabase = createClient();

      // OTP email bhejo — user 8-digit code type karega
      // Yeh PKCE problem se free hai
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          data: {
            college_id: collegeId, // extra data pass karo
          }
        },
      });

      if (authError) {
        setErrorMessage(`Error: ${authError.message}`);
        return;
      }
      setEmailSent(true);
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error. Check your connection.");
    } finally {
      setIsSending(false);
    }
  }

  function handleChangeSchool() {
    localStorage.removeItem("selected_college_id");
    router.push("/");
  }

  const collegeIndex = colleges.findIndex((c) => c.id === college.id);

  // OTP entry screen
  if (emailSent) {
    return (
      <OtpScreen
        email={email}
        onBack={() => setEmailSent(false)}
        onSuccess={() => router.replace("/onboarding")}
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-16 md:grid-cols-[1fr_1.2fr] md:py-24">
      <div className="mx-auto w-60 -rotate-3">
        <CollegeStamp college={college} index={collegeIndex} />
      </div>
      <div>
        <p className="label">Step 2 of 3 · Sign in</p>
        <h1 className="font-serif text-5xl leading-tight">Welcome back to {college.name}.</h1>
        <p className="mt-4 text-sm text-muted">
          Use your college email — we&apos;ll send you a one-time code.
        </p>
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
            {isSending ? "Sending…" : "Send code"}
          </button>
        </form>
        <button
          type="button"
          onClick={handleChangeSchool}
          className="mt-6 text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Not your school? Change it
        </button>
      </div>
    </div>
  );
}


// OTP verification component
function OtpScreen({
  email,
  onBack,
  onSuccess,
}: {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.trim().length < 6) {
      setError("Please enter the 8-digit code.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const supabase = createClient();

      // OTP verify karo — PKCE nahi, direct verify
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: "email",
        // type: "email" = email OTP verify karo
      });

      if (verifyError) {
        setError(`Invalid code: ${verifyError.message}`);
        return;
      }

      // Success — onboarding pe jao
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <p className="label">Step 2 of 3 · Verify</p>
      <h1 className="font-serif text-4xl">Enter your code.</h1>
      <p className="mt-3 text-sm text-muted">
        We sent a 8-digit code to <strong>{email}</strong>.
        <br />Check your inbox (and spam folder).
      </p>

      <form onSubmit={handleVerify} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="otp" className="label">8-digit code</label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            // inputMode="numeric" → mobile pe number keyboard khulega
            maxLength={8}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            // /\D/g = non-digits remove karo (sirf numbers allow)
            placeholder="12345678"
            className="field text-2xl tracking-widest"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-xs font-bold text-rust" role="alert">{error}</p>
          )}
        </div>

        <button type="submit" disabled={isVerifying} className="btn w-full">
          {isVerifying ? "Verifying…" : "Verify"}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Use a different email
      </button>
    </div>
  );
}
