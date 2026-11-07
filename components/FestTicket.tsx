// College = fest ka entry ticket. Hover pe stub thoda "fatne" lagta hai.
// Notch (gol kat) globals.css ke .ticket-main / .ticket-stub mask se aate hain.

import { getInitials } from "@/lib/helpers";
import type { College } from "@/types";

// Har ticket alag rang ka. Tailwind ko poori class names chahiye.
const palettes = [
  { body: "bg-pink text-white", stub: "bg-white text-ink" },
  { body: "bg-sun text-ink", stub: "bg-white text-ink" },
  { body: "bg-ink text-white", stub: "bg-sun text-ink" },
  { body: "bg-leaf text-white", stub: "bg-white text-ink" },
];

interface FestTicketProps {
  college: College;
  index: number;
}

export default function FestTicket({ college, index }: FestTicketProps) {
  const colors = palettes[index % palettes.length];
  // Ticket number: college id se bana hua (har baar same)
  const serial = String(
    [...college.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 7
  ).padStart(5, "0");

  return (
    // drop-shadow bahar, kyunki mask andar ki shadow kaat deta hai
    <div className="flex drop-shadow-[4px_4px_0_var(--color-ink)] transition-[filter] duration-200 group-hover:drop-shadow-[7px_7px_0_var(--color-ink)]">
      <div className={`ticket-main flex min-h-44 flex-1 flex-col justify-between rounded-l-2xl p-5 pr-7 ${colors.body}`}>
        <p className="text-sm font-semibold opacity-80">Admit one</p>
        <p className="font-display text-2xl leading-tight md:text-[1.7rem]">{college.name}</p>
        <p className="text-sm font-semibold opacity-80">{college.city}</p>
      </div>

      {/* stub — perforation dashed line ke saath */}
      <div
        className={`ticket-stub flex w-24 shrink-0 origin-bottom-left flex-col items-center justify-between rounded-r-2xl border-l-[3px] border-dashed border-ink/40 py-5 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:rotate-6 ${colors.stub}`}
      >
        <span className="font-display text-3xl">{getInitials(college.name)}</span>
        <span className="text-xs font-semibold tracking-wide [writing-mode:vertical-rl]">No. {serial}</span>
      </div>
    </div>
  );
}
