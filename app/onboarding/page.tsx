// Onboarding ("/onboarding"). Login ke baad naam aur batch bharo.
// Side mein student ID card live update hota hai — jo likhoge woh card pe dikhega.
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Developing from "@/components/Developing";
import { getCollege } from "@/lib/helpers";
import { useSession } from "@/lib/session";
import type { SessionUser } from "@/types";

// Batch years: is saal se agle 5 saal tak
const thisYear = new Date().getFullYear();
const batchYears: number[] = [];
for (let year = thisYear; year <= thisYear + 5; year++) {
  batchYears.push(year);
}

export default function OnboardingPage() {
  const { isReady, collegeId, user } = useSession();
  const router = useRouter();
  const college = getCollege(collegeId);

  // Login nahi kiya → login page
  useEffect(() => {
    if (isReady && (!college || !user)) router.replace(college ? "/login" : "/");
  }, [isReady, college, user, router]);

  if (!college || !user) {
    return <Developing />;
  }

  // Form alag component mein hai, taaki woh tabhi bane jab user data aa chuka ho
  // (tab "Edit profile" pe purana naam pehle se bhara milega)
  return <OnboardingForm collegeName={college.name} user={user} />;
}

function OnboardingForm({ collegeName, user }: { collegeName: string; user: SessionUser }) {
  const { saveProfile } = useSession();
  const router = useRouter();

  const [fullName, setFullName] = useState(user.fullName);
  const [batchYear, setBatchYear] = useState(user.batchYear ? String(user.batchYear) : "");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fullName.trim().length < 2) return setErrorMessage("Please enter your full name.");
    if (!batchYear) return setErrorMessage("Please pick your batch.");

    saveProfile(fullName.trim(), Number(batchYear));
    router.push("/gallery");
  }

  return (
    <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-24">
      <div>
        <p className="label">Step 3 of 3 · Your ID card</p>
        <h1 className="font-serif text-5xl">Who&apos;s in the photo?</h1>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="fullName" className="label">Full name</label>
            <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="field" />
          </div>

          <div>
            <label htmlFor="batch" className="label">Batch</label>
            <select id="batch" value={batchYear} onChange={(e) => setBatchYear(e.target.value)} className="field">
              <option value="">Select</option>
              {batchYears.map((year) => (
                <option key={year} value={year}>Class of {year}</option>
              ))}
            </select>
          </div>

          {errorMessage && <p className="text-xs font-bold text-rust" role="alert">{errorMessage}</p>}

          <button type="submit" className="btn w-full">Open the archive</button>
        </form>
      </div>

      {/* Live ID card preview */}
      <div className="rotate-2 rounded-md border-2 border-ink bg-paper-light shadow-[6px_6px_0_var(--color-ink)]">
        <div className="flex items-center justify-between rounded-t-sm bg-teal px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-paper-light">
          <span>{collegeName}</span>
          <span>Student ID</span>
        </div>
        <div className="flex gap-5 p-5">
          <div className="grid h-28 w-24 shrink-0 place-items-center bg-ink/10 font-serif text-5xl text-ink/60">
            {fullName.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <dl className="min-w-0 space-y-2 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Name</dt>
              <dd className="truncate font-hand text-2xl leading-none">{fullName || "Your name"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Batch</dt>
              <dd>{batchYear ? `Class of ${batchYear}` : "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted">Email</dt>
              <dd className="truncate">{user.email}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
