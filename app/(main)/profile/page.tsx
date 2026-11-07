// Profile ("/profile"). Press pass + apni upload ki hui photos.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import PhotoCard from "@/components/PhotoCard";
import PressPass from "@/components/PressPass";
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
  const firstName = user.fullName.split(" ")[0];

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_1.3fr]">
        <PressPass
          name={user.fullName}
          collegeName={college.name}
          batchYear={user.batchYear}
          email={user.email}
          uploads={myPhotos.length}
          className="-rotate-2"
        />

        <div>
          <h1 className="font-display text-5xl leading-[1.02] md:text-6xl">Hey {firstName}.</h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            {myPhotos.length === 0
              ? "You haven't added any photos yet. Your camera roll is probably full of them."
              : `You've added ${myPhotos.length} ${myPhotos.length === 1 ? "photo" : "photos"} to the ${college.name} wall.`}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/upload" className="btn">Upload photos</Link>
            <Link href="/onboarding" className="btn-ghost">Edit pass</Link>
            <button type="button" onClick={handleSignOut} className="btn-ghost">Sign out</button>
          </div>
        </div>
      </div>

      <h2 className="mt-20 border-b-2 border-ink pb-5 font-display text-4xl">Your photos</h2>

      {myPhotos.length === 0 ? (
        <EmptyState title="Nothing here yet" message="Photos you upload will show up here, and on the campus wall.">
          <Link href="/upload" className="btn">Upload your first photo</Link>
        </EmptyState>
      ) : (
        <div className="mt-10 columns-2 gap-6 md:columns-3 lg:columns-4">
          {myPhotos.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
