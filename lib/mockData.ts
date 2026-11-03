// Dummy data — backend (Supabase + Cloudinary) ready hone tak pages isse chalte hain.
// Backend aane pe sirf ye file replace hogi, pages same rahenge.

import type { CampusEvent, College, Photo } from "@/types";

export const colleges: College[] = [
  { id: "rishihood", name: "Rishihood University", city: "Sonipat", emailDomains: ["rishihood.edu.in"] },
  { id: "northfield", name: "Northfield Institute of Technology", city: "Pune", emailDomains: ["northfield.edu.in"] },
  { id: "st-aurelia", name: "St. Aurelia College", city: "Bengaluru", emailDomains: ["staurelia.ac.in"] },
  { id: "riverbend", name: "Riverbend School of Design", city: "Ahmedabad", emailDomains: ["riverbend.edu.in"] },
];

export const events: CampusEvent[] = [
  // Rishihood
  { id: "damru-2026", collegeId: "rishihood", name: "Damru 2026", year: 2026 },
  { id: "khatam-2026", collegeId: "rishihood", name: "Khatam (Farewell) 2026", year: 2026 },
  { id: "hackathon-2025", collegeId: "rishihood", name: "Hack Night 2025", year: 2025 },
  { id: "sports-2025", collegeId: "rishihood", name: "Sports Day 2025", year: 2025 },
  { id: "orientation-2025", collegeId: "rishihood", name: "Orientation 2025", year: 2025 },
  { id: "damru-2024", collegeId: "rishihood", name: "Damru 2024", year: 2024 },
  // Baaki colleges
  { id: "spectra-2026", collegeId: "northfield", name: "Spectra TechFest 2026", year: 2026 },
  { id: "convocation-2025", collegeId: "northfield", name: "Convocation 2025", year: 2025 },
  { id: "carnival-2026", collegeId: "st-aurelia", name: "Spring Carnival 2026", year: 2026 },
  { id: "founders-2025", collegeId: "st-aurelia", name: "Founders' Day 2025", year: 2025 },
  { id: "designweek-2026", collegeId: "riverbend", name: "Design Week 2026", year: 2026 },
  { id: "gradshow-2025", collegeId: "riverbend", name: "Grad Show 2025", year: 2025 },
];

// picsum.photos se dummy photo. Same "seed" = har baar same photo.
function img(seed: string): string {
  return `https://picsum.photos/seed/${seed}/700/700`;
}

export const photos: Photo[] = [
  // ---------- Rishihood ----------
  { id: "p1", collegeId: "rishihood", imageUrl: img("damru-stage"), caption: "Headliner night on the main stage", hashtags: ["Damru26", "Music", "Night"], eventId: "damru-2026", year: 2026, uploaderName: "Aarav Sharma", uploadedAt: "2026-03-15" },
  { id: "p2", collegeId: "rishihood", imageUrl: img("damru-crowd"), caption: "The whole crowd, all at once", hashtags: ["Damru26", "Crowd"], eventId: "damru-2026", year: 2026, uploaderName: "Priya Verma", uploadedAt: "2026-03-16" },
  { id: "p3", collegeId: "rishihood", imageUrl: img("damru-food"), caption: "Longest queue at the food stalls", hashtags: ["Damru26", "Food"], eventId: "damru-2026", year: 2026, uploaderName: "Kabir Singh", uploadedAt: "2026-03-16" },
  { id: "p4", collegeId: "rishihood", imageUrl: img("damru-dhol"), caption: "Dhol at 2 am, no regrets", hashtags: ["Damru26", "Night", "Music"], eventId: "damru-2026", year: 2026, uploaderName: "Meera Nair", uploadedAt: "2026-03-17" },
  { id: "p5", collegeId: "rishihood", imageUrl: img("khatam-group"), caption: "Last day, last group photo", hashtags: ["Khatam", "Batch2026", "Friends"], eventId: "khatam-2026", year: 2026, uploaderName: "Rohan Gupta", uploadedAt: "2026-05-02" },
  { id: "p6", collegeId: "rishihood", imageUrl: img("khatam-cake"), caption: "The cake lasted two minutes", hashtags: ["Khatam", "Food"], eventId: "khatam-2026", year: 2026, uploaderName: "Sneha Iyer", uploadedAt: "2026-05-02" },
  { id: "p7", collegeId: "rishihood", imageUrl: img("khatam-hug"), caption: "See you on the other side", hashtags: ["Khatam", "Friends"], eventId: "khatam-2026", year: 2026, uploaderName: "Aarav Sharma", uploadedAt: "2026-05-03" },
  { id: "p8", collegeId: "rishihood", imageUrl: img("hack-laptops"), caption: "36 hours, 4 laptops, 1 working demo", hashtags: ["HackNight", "Code"], eventId: "hackathon-2025", year: 2025, uploaderName: "Ishaan Mehta", uploadedAt: "2025-10-12" },
  { id: "p9", collegeId: "rishihood", imageUrl: img("sports-race"), caption: "Photo finish at the 100m", hashtags: ["SportsDay", "Athletics"], eventId: "sports-2025", year: 2025, uploaderName: "Kabir Singh", uploadedAt: "2025-02-10" },
  { id: "p10", collegeId: "rishihood", imageUrl: img("sports-cricket"), caption: "Final over, six to win", hashtags: ["SportsDay", "Cricket"], eventId: "sports-2025", year: 2025, uploaderName: "Aarav Sharma", uploadedAt: "2025-02-11" },
  { id: "p11", collegeId: "rishihood", imageUrl: img("orientation-hall"), caption: "Day one — nobody knew anyone yet", hashtags: ["Orientation", "Batch2029"], eventId: "orientation-2025", year: 2025, uploaderName: "Meera Nair", uploadedAt: "2025-08-01" },
  { id: "p12", collegeId: "rishihood", imageUrl: img("damru24-lights"), caption: "The lights at Damru 2024", hashtags: ["Damru24", "Night"], eventId: "damru-2024", year: 2024, uploaderName: "Ishaan Mehta", uploadedAt: "2024-03-20" },
  { id: "p13", collegeId: "rishihood", imageUrl: img("damru24-dance"), caption: "Dance battle winners", hashtags: ["Damru24", "Dance"], eventId: "damru-2024", year: 2024, uploaderName: "Priya Verma", uploadedAt: "2024-03-21" },

  // ---------- Northfield ----------
  { id: "n1", collegeId: "northfield", imageUrl: img("spectra-robot"), caption: "Robo wars semi-final", hashtags: ["Spectra26", "Robotics"], eventId: "spectra-2026", year: 2026, uploaderName: "Dev Patil", uploadedAt: "2026-02-20" },
  { id: "n2", collegeId: "northfield", imageUrl: img("spectra-night"), caption: "Pro-show from the back row", hashtags: ["Spectra26", "Night"], eventId: "spectra-2026", year: 2026, uploaderName: "Ananya Rao", uploadedAt: "2026-02-21" },
  { id: "n3", collegeId: "northfield", imageUrl: img("convo-caps"), caption: "Caps in the air", hashtags: ["Convocation", "Batch2025"], eventId: "convocation-2025", year: 2025, uploaderName: "Dev Patil", uploadedAt: "2025-07-05" },

  // ---------- St. Aurelia ----------
  { id: "a1", collegeId: "st-aurelia", imageUrl: img("carnival-wheel"), caption: "Ferris wheel at sunset", hashtags: ["Carnival26", "Sunset"], eventId: "carnival-2026", year: 2026, uploaderName: "Maria D'Souza", uploadedAt: "2026-04-10" },
  { id: "a2", collegeId: "st-aurelia", imageUrl: img("carnival-games"), caption: "Lost every ring toss", hashtags: ["Carnival26", "Friends"], eventId: "carnival-2026", year: 2026, uploaderName: "Nikhil Menon", uploadedAt: "2026-04-11" },
  { id: "a3", collegeId: "st-aurelia", imageUrl: img("founders-choir"), caption: "Choir on Founders' Day", hashtags: ["FoundersDay", "Music"], eventId: "founders-2025", year: 2025, uploaderName: "Maria D'Souza", uploadedAt: "2025-09-14" },

  // ---------- Riverbend ----------
  { id: "r1", collegeId: "riverbend", imageUrl: img("design-posters"), caption: "Poster wall, week one", hashtags: ["DesignWeek", "Posters"], eventId: "designweek-2026", year: 2026, uploaderName: "Tara Shah", uploadedAt: "2026-01-25" },
  { id: "r2", collegeId: "riverbend", imageUrl: img("gradshow-chair"), caption: "The chair that won the grad show", hashtags: ["GradShow", "Furniture"], eventId: "gradshow-2025", year: 2025, uploaderName: "Yash Joshi", uploadedAt: "2025-06-02" },
];
