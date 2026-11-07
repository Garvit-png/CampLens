// College ko postage stamp (daak ticket) jaisa dikhata hai.
// Kinaare ke gol chhed ".postage" class se aate hain (globals.css mein).

import { getInitials } from "@/lib/helpers";
import type { College } from "@/types";

const stampColors = ["bg-rust", "bg-teal", "bg-plum", "bg-mustard"];

interface CollegeStampProps {
  college: College;
  index: number;
}

export default function CollegeStamp({ college, index }: CollegeStampProps) {
  const color = stampColors[index % stampColors.length];

  return (
    // drop-shadow bahar wale div pe, kyunki mask lagne ke baad andar ki shadow kat jaati hai
    <div className="drop-shadow-[0_8px_10px_rgba(60,40,20,0.3)]">
      <div className="postage">
        <div className={`${color} flex aspect-[4/5] flex-col justify-between p-4 text-paper-light`}>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-90">
            <span>CampusLens Post</span>
            <span>₹5</span>
          </div>

          <p className="font-serif text-7xl leading-none">{getInitials(college.name)}</p>

          <div>
            <p className="font-serif text-xl leading-tight">{college.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest opacity-80">{college.city} · India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
