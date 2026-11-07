// Pehla page ("/"): "Select your school".
// College chuno → login page. Agar pehle se logged in ho to seedha gallery.
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FestTicket from "@/components/FestTicket";
import { SearchIcon } from "@/components/Icons";
import { Bunting, HeroScene, ScribbleArrow } from "@/components/Illustrations";
import PageLoader from "@/components/PageLoader";
import { colleges } from "@/lib/mockData";
import { useSession } from "@/lib/session";

export default function SelectSchoolPage() {
  const { isReady, collegeId, user, selectCollege } = useSession();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const isAlreadySignedIn = isReady && collegeId !== null && Boolean(user?.fullName);

  // Pehle se login hai → gallery pe bhej do
  useEffect(() => {
    if (isAlreadySignedIn) router.replace("/gallery");
  }, [isAlreadySignedIn, router]);

  if (!isReady || isAlreadySignedIn) {
    return <PageLoader />;
  }

  // Naam ya city se college dhoondo
  const query = searchText.trim().toLowerCase();
  const visibleColleges = colleges.filter(
    (college) => college.name.toLowerCase().includes(query) || college.city.toLowerCase().includes(query)
  );

  function handlePick(id: string) {
    selectCollege(id);
    router.push("/login");
  }

  return (
    <>
      <Bunting className="h-12 w-full md:h-16" />

      <div className="mx-auto max-w-6xl px-6">
        {/* ---------- Hero ---------- */}
        <section className="grid items-center gap-6 pb-10 pt-6 md:grid-cols-[1.15fr_1fr] md:pb-16">
          <div>
            <h1 className="animate-register font-display text-[3.4rem] leading-[0.95] md:text-[5.6rem]">
              The photo wall for your whole campus.
            </h1>
            <p className="mt-7 max-w-md text-lg text-ink-soft">
              Damru night, farewell hugs, the 2 am dhol. Find every shot by hashtag, or add the ones on your phone.
            </p>
          </div>
          <HeroScene className="mx-auto w-full max-w-md" />
        </section>

        {/* ---------- College picker ---------- */}
        <section id="campus" className="border-t-2 border-ink pt-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="relative">
              <h2 className="font-display text-4xl">Pick your college</h2>
              <p className="mt-2 text-ink-soft">Each campus has its own private wall. Only your college email gets in.</p>
              <ScribbleArrow className="absolute -bottom-12 left-60 hidden w-20 rotate-12 md:block" />
            </div>

            <div className="relative w-full md:max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="College or city"
                aria-label="Search colleges"
                className="field pl-11"
              />
            </div>
          </div>

          {visibleColleges.length === 0 ? (
            <p className="mt-12 text-lg text-ink-soft">No college matches “{searchText}”. Try the city name instead.</p>
          ) : (
            <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
              {visibleColleges.map((college, index) => (
                <button
                  key={college.id}
                  type="button"
                  onClick={() => handlePick(college.id)}
                  className="group rounded-2xl text-left"
                  aria-label={`Select ${college.name}`}
                >
                  <FestTicket college={college} index={index} />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
