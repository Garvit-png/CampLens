// ============================================================
// FILE: components/CollegeStamp.tsx — COLLEGE KA POSTAGE STAMP
// ============================================================
// College ko daak ticket (postage stamp) jaisa dikhata hai.
// Home page pe 4 colleges stamp style mein dikhte hain.
//
// DESIGN:
//   - Gol chhed wala border (.postage class — globals.css mein)
//   - College ke initials bade letters mein (RU, NIT)
//   - College naam aur city
//   - Har college ka alag color (cyclic)
// ============================================================

import { getInitials } from "@/lib/helpers";
// getInitials → "Rishihood University" → "RU"

import type { College } from "@/types";

// 4 colors — index ke hisaab se cyclic assign hote hain
const stampColors = ["bg-rust", "bg-teal", "bg-plum", "bg-mustard"];
// 0: rust (orange-red)
// 1: teal (green-blue)
// 2: plum (purple)
// 3: mustard (yellow-orange)

interface CollegeStampProps {
  college: College; // College object (id, name, city, emailDomains)
  index: number;    // Position — color decide karta hai
}

export default function CollegeStamp({ college, index }: CollegeStampProps) {
  const color = stampColors[index % stampColors.length];
  // index % 4 → 0,1,2,3, 0,1,2,3... (cyclic)
  // Pehla college → rust, doosra → teal, etc.

  return (
    // drop-shadow bahar wale div pe — kyunki .postage mask lagane ke baad
    // andar ki shadow kat jaati hai (CSS masking limitation)
    <div className="drop-shadow-[0_8px_10px_rgba(60,40,20,0.3)]">
      {/* Custom shadow: 8px down, 10px blur, brown tint (vintage feel) */}

      <div className="postage">
        {/* .postage → custom CSS class (globals.css) — stamp border with holes */}

        <div className={`${color} flex aspect-[4/5] flex-col justify-between p-4 text-paper-light`}>
          {/* aspect-[4/5] → width:height = 4:5 (portrait stamp ratio) */}
          {/* flex-col justify-between → content top, middle, bottom mein spread */}

          {/* Top: "CampusLens Post" + price */}
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-90">
            <span>CampusLens Post</span>
            <span>₹5</span>
            {/* Decorative — jaise real stamp pe "India Post ₹5" hota hai */}
          </div>

          {/* Middle: College initials (bada) */}
          <p className="font-serif text-7xl leading-none">
            {getInitials(college.name)}
            {/* "Rishihood University" → "RU" bade letters mein */}
          </p>

          {/* Bottom: College naam + city */}
          <div>
            <p className="font-serif text-xl leading-tight">{college.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest opacity-80">
              {college.city} · India
              {/* "Sonipat · India" */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
