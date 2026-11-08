// ============================================================
// FILE: app/(main)/profile/page.tsx — PROFILE PAGE ("/profile")
// ============================================================
// User apni profile dekhta hai:
//   - Student ID card (naam, batch, email, college)
//   - Apni upload ki hui photos
//   - Edit aur Sign Out buttons
// ============================================================

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import EmptyState from "@/components/EmptyState";
import PhotoCard from "@/components/PhotoCard";

import { getCollege, sortNewestFirst } from "@/lib/helpers";
// getCollege       → college ID se College object
// sortNewestFirst  → photos ko newest pehle sort karo

import { useSession } from "@/lib/session";

export default function ProfilePage() {
  const { collegeId, user, collegePhotos, signOut } = useSession();
  // collegeId     → kis college ka hai
  // user          → naam, email, batch
  // collegePhotos → is college ki saari photos
  // signOut       → logout function

  const router = useRouter();
  const college = getCollege(collegeId);

  // RequireSession guard ne pehle hi check kar liya hai
  // Agar yahan pohonch gaye → user aur college dono hain
  if (!user || !college) return null;

  // Sirf IS user ki photos (abhi naam se match — real mein user ID se hoga)
  const myPhotos = sortNewestFirst(
    collegePhotos.filter((p) => p.uploaderName === user.fullName)
  );
  // .filter() → sirf woh photos jinka uploader naam = current user ka naam
  // sortNewestFirst → naye photos pehle dikhe

  // ----------------------------------------------------------
  // SIGN OUT HANDLER
  // ----------------------------------------------------------
  function handleSignOut() {
    signOut();
    // Session se user hatao (college rehta hai)

    router.push("/login");
    // Login page pe jao
  }


  return (
    <div className="mx-auto max-w-6xl px-6 py-14">

      {/* --- HEADER: ID Card + Buttons --- */}
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">

        {/* Student ID Card */}
        <div className="w-full max-w-md -rotate-1 rounded-md border-2 border-ink bg-paper-light shadow-[6px_6px_0_var(--color-ink)]">
          {/* -rotate-1 → thoda tilted (realistic card feel) */}
          {/* shadow-[...] → hard shadow (retro look) */}

          {/* Card header */}
          <div className="flex justify-between bg-teal px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-paper-light">
            <span>{college.name}</span>
            <span>Student ID</span>
          </div>

          {/* Card body */}
          <div className="flex gap-5 p-5">

            {/* Avatar (first letter of name) */}
            <div className="grid h-28 w-24 shrink-0 place-items-center bg-ink/10 font-serif text-5xl text-ink/60">
              {user.fullName.charAt(0).toUpperCase()}
              {/* Naam ka pehla letter bada dikhao */}
            </div>

            {/* Details */}
            <div className="min-w-0 space-y-1.5">
              <p className="truncate font-serif text-3xl leading-tight">
                {user.fullName}
                {/* truncate → naam bahut lamba ho to "..." lagao */}
              </p>
              <p className="text-sm">Class of {user.batchYear}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link href="/onboarding" className="btn-ghost">
            Edit
            {/* Onboarding pe wapas jao → naam/batch change karo */}
          </Link>
          <button type="button" onClick={handleSignOut} className="btn-ghost">
            Sign out
            {/* Logout karo → login pe jao */}
          </button>
        </div>
      </div>

      {/* --- MY PHOTOS SECTION --- */}
      <h2 className="mt-16 border-y-2 border-ink py-4 font-serif text-3xl">
        Your prints <span className="text-muted">· {myPhotos.length}</span>
        {/* "Your prints · 5" — count dikhao */}
      </h2>

      {/* Empty state: koi photo nahi upload ki */}
      {myPhotos.length === 0 ? (
        <EmptyState
          title="Your roll is empty"
          message="Photos you upload will show up here."
        >
          <Link href="/upload" className="btn">Upload a photo</Link>
        </EmptyState>
      ) : (
        /* Photos grid */
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {myPhotos.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
