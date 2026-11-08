"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CollegeStamp from "@/components/CollegeStamp";
import Developing from "@/components/Developing";
import Postmark from "@/components/Postmark";
import { colleges } from "@/lib/mockData";
import { useSession } from "@/lib/session";

export default function SelectSchoolPage() {
  const { isReady, supabaseUser, profile } = useSession();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [domainError, setDomainError] = useState("");

  const isAlreadySignedIn = isReady && Boolean(supabaseUser) && Boolean(profile?.is_onboarding_complete);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Hash mein access_token hai? → confirm page pe bhejo
    if (window.location.hash.includes('access_token')) {
      router.replace('/auth/confirm' + window.location.hash);
      return;
    }

    // Domain not allowed error? (onboarding se aaya)
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'domain_not_allowed') {
      const email = params.get('email') ?? '';
      const domain = email.split('@')[1] ?? '';
      setDomainError(
        `"${domain}" is not a registered college domain. Please use your official college email account.`
      );
      // URL clean karo history se
      window.history.replaceState({}, '', '/');
    }

    if (isAlreadySignedIn) router.replace("/gallery");
  }, [isAlreadySignedIn, router]);

  if (!isReady || isAlreadySignedIn) return <Developing />;

  const query = searchText.trim().toLowerCase();
  const visibleColleges = colleges.filter(
    (c) => c.name.toLowerCase().includes(query) || c.city.toLowerCase().includes(query)
  );

  function handlePick(id: string) {
    localStorage.setItem("selected_college_id", id);
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <section className="relative">
        <p className="label">Step 1 of 3 · Choose your campus</p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] md:text-7xl">
          Select your school.
        </h1>
        <p className="mt-5 max-w-lg text-muted">
          Every campus keeps its own archive. Pick yours to see its fests, farewells and late nights — in prints.
        </p>
        <Postmark
          label="CAMPUSLENS • ARCHIVE • EST 2026 •"
          center="POST"
          className="absolute -top-4 right-0 hidden w-36 rotate-12 text-rust/70 md:block"
        />

        {/* Domain error message */}
        {domainError && (
          <div className="mt-6 rounded-md border-2 border-rust bg-rust/5 px-4 py-3">
            <p className="text-sm font-bold text-rust">⚠ Access Denied</p>
            <p className="mt-1 text-sm text-rust/80">{domainError}</p>
          </div>
        )}

        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by college or city…"
          aria-label="Search colleges"
          className="field mt-10 max-w-md"
        />
      </section>

      {visibleColleges.length === 0 ? (
        <p className="mt-16 text-muted">No college matches &quot;{searchText}&quot;.</p>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {visibleColleges.map((college, index) => (
            <button
              key={college.id}
              type="button"
              onClick={() => handlePick(college.id)}
              className={`text-left transition duration-300 hover:-translate-y-2 hover:rotate-0 ${
                index % 2 === 0 ? "-rotate-2" : "rotate-2"
              }`}
              aria-label={`Select ${college.name}`}
            >
              <CollegeStamp college={college} index={index} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
