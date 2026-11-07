// Neeche: concert crowd ka illustration, yellow patti pe.

import { CrowdHands } from "@/components/Illustrations";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-28 border-t-2 border-ink bg-sun">
      <CrowdHands className="-mt-px block h-auto w-full" />
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-xl">CampusLens</p>
          <p className="text-sm text-white/75">Made by students, for the photo dump nobody organised. {currentYear}</p>
        </div>
      </div>
    </footer>
  );
}
