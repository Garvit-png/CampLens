"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import PhotoCard from "@/components/PhotoCard";
import { sortNewestFirst } from "@/lib/helpers";
import { useSession } from "@/lib/session";

export default function ProfilePage() {
  const { supabaseUser, profile, collegePhotos, signOut } = useSession();
  const router = useRouter();

  if (!supabaseUser || !profile) return null;

  const fullName = profile.full_name ?? "";
  const batchYear = profile.batch_year ?? "";
  const collegeName = (profile.colleges as { name?: string } | null)?.name ?? "";

  const myPhotos = sortNewestFirst(
    collegePhotos.filter((p) => p.uploaderName === fullName)
  );

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">

        {/* Student ID Card */}
        <div className="w-full max-w-md -rotate-1 rounded-md border-2 border-ink bg-paper-light shadow-[6px_6px_0_var(--color-ink)]">
          <div className="flex justify-between bg-teal px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-paper-light">
            <span>{collegeName}</span>
            <span>Student ID</span>
          </div>
          <div className="flex gap-5 p-5">
            <div className="grid h-28 w-24 shrink-0 place-items-center bg-ink/10 font-serif text-5xl text-ink/60">
              {fullName.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="truncate font-serif text-3xl leading-tight">{fullName}</p>
              <p className="text-sm">Class of {batchYear}</p>
              <p className="truncate text-sm text-muted">{supabaseUser.email}</p>
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
