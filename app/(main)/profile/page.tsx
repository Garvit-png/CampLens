// Profile ("/profile"). Student ID card + apni upload ki hui photos.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import PhotoCard from "@/components/PhotoCard";
import { getCollege, sortNewestFirst } from "@/lib/helpers";
import { useSession } from "@/lib/session";

export default function ProfilePage() {
  const { collegeId, user, collegePhotos, signOut } = useSession();
  const router = useRouter();
  const college = getCollege(collegeId);

  // Guard (RequireSession) ne pehle hi check kar liya hai ki user hai
  if (!user || !college) return null;

  // Sirf is user ki photos (abhi naam se match; baad mein user id se)
  const myPhotos = sortNewestFirst(collegePhotos.filter((p) => p.uploaderName === user.fullName));

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        {/* ID card */}
        <div className="w-full max-w-md -rotate-1 rounded-md border-2 border-ink bg-paper-light shadow-[6px_6px_0_var(--color-ink)]">
          <div className="flex justify-between bg-teal px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-paper-light">
            <span>{college.name}</span>
            <span>Student ID</span>
          </div>
          <div className="flex gap-5 p-5">
            <div className="grid h-28 w-24 shrink-0 place-items-center bg-ink/10 font-serif text-5xl text-ink/60">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="truncate font-serif text-3xl leading-tight">{user.fullName}</p>
              <p className="text-sm">Class of {user.batchYear}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/onboarding" className="btn-ghost">Edit</Link>
          <button type="button" onClick={handleSignOut} className="btn-ghost">Sign out</button>
        </div>
      </div>

      <h2 className="mt-16 border-y-2 border-ink py-4 font-serif text-3xl">
        Your prints <span className="text-muted">· {myPhotos.length}</span>
      </h2>

      {myPhotos.length === 0 ? (
        <EmptyState title="Your roll is empty" message="Photos you upload will show up here.">
          <Link href="/upload" className="btn">Upload a photo</Link>
        </EmptyState>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {myPhotos.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
