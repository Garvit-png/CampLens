// Onboarding ("/onboarding"). Login ke baad naam aur batch bharo.
// Side mein press pass live update hota hai — jo likhoge woh card pe dikhega.
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageLoader from "@/components/PageLoader";
import PressPass from "@/components/PressPass";
import Spinner from "@/components/Spinner";
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
    return <PageLoader />;
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
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fullName.trim().length < 2) return setErrorMessage("Add your full name so friends can find you.");
    if (!batchYear) return setErrorMessage("Pick the year you graduate.");

    setIsSaving(true);
    saveProfile(fullName.trim(), Number(batchYear));
    router.push("/gallery");
  }

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-14 px-6 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
      <div className="md:pt-16">
        <h1 className="font-display text-5xl leading-[1.02] md:text-6xl">Get your press pass.</h1>
        <p className="mt-5 text-lg text-ink-soft">Your name shows up on every photo you add.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
          <div>
            <label htmlFor="fullName" className="label">Full name</label>
            <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Aarav Sharma" className="field" />
          </div>

          <div>
            <label htmlFor="batch" className="label">Graduating batch</label>
            <select id="batch" value={batchYear} onChange={(e) => setBatchYear(e.target.value)} className="field">
              <option value="">Choose a year</option>
              {batchYears.map((year) => (
                <option key={year} value={year}>Class of {year}</option>
              ))}
            </select>
          </div>

          {errorMessage && <p className="font-semibold text-alarm" role="alert">{errorMessage}</p>}

          <button type="submit" disabled={isSaving} className="btn w-full">
            {isSaving ? (
              <>
                <Spinner /> Printing your pass
              </>
            ) : (
              "Open the photo wall"
            )}
          </button>
        </form>
      </div>

      {/* Live preview */}
      <PressPass name={fullName} collegeName={collegeName} batchYear={batchYear} email={user.email} className="rotate-2" />
    </div>
  );
}
