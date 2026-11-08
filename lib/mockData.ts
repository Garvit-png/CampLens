// ============================================================
// FILE: lib/mockData.ts
// ============================================================
// Yeh file FAKE DATA store karti hai — real database ready hone
// se pehle pages ko data dene ke liye.
//
// SMART DESIGN:
// Jab Supabase database ready hogi, sirf YEH FILE replace hogi.
// Baaki poora code (pages, components) same rahega.
// Jaise test ke liye dummy question paper — real paper aane pe
// sirf paper badlega, sab preparations same rahegi.
//
// ABHI KYA HAI:
//   4 colleges, 12 events, 21 photos — sab fake but realistic
// ============================================================

import type { CampusEvent, College, Photo } from "@/types";
// types/index.ts se College, Photo, CampusEvent interfaces import kar rahe hain
// Isse ensure hoga ki hum sahi shape ka data banayein


// ----------------------------------------------------------
// COLLEGES — 4 fake colleges
// ----------------------------------------------------------
// Array of College objects — College interface ki shape follow karti hai
// ----------------------------------------------------------
export const colleges: College[] = [
  {
    id: "rishihood",               // unique ID — URL aur matching mein use hoga
    name: "Rishihood University",  // display naam
    city: "Sonipat",               // filter/gallery header mein use hoga
    emailDomains: ["rishihood.edu.in"], // sirf yeh domain allowed login mein
  },
  {
    id: "northfield",
    name: "Northfield Institute of Technology",
    city: "Pune",
    emailDomains: ["northfield.edu.in"],
  },
  {
    id: "st-aurelia",
    name: "St. Aurelia College",
    city: "Bengaluru",
    emailDomains: ["staurelia.ac.in"],
  },
  {
    id: "riverbend",
    name: "Riverbend School of Design",
    city: "Ahmedabad",
    emailDomains: ["riverbend.edu.in"],
  },
];
// colleges.length = 4 — home page pe 4 stamp cards dikhenge


// ----------------------------------------------------------
// EVENTS — 12 fake campus events
// ----------------------------------------------------------
// Har event ek specific college ka hai (collegeId se linked)
// Upload page mein: sirf us college ke events dikhenge
// Gallery mein: event filter mein yahi list aayegi
// ----------------------------------------------------------
export const events: CampusEvent[] = [
  // ---- Rishihood ke events ----
  { id: "damru-2026",      collegeId: "rishihood",  name: "Damru 2026",           year: 2026 },
  { id: "khatam-2026",     collegeId: "rishihood",  name: "Khatam (Farewell) 2026", year: 2026 },
  { id: "hackathon-2025",  collegeId: "rishihood",  name: "Hack Night 2025",       year: 2025 },
  { id: "sports-2025",     collegeId: "rishihood",  name: "Sports Day 2025",       year: 2025 },
  { id: "orientation-2025",collegeId: "rishihood",  name: "Orientation 2025",      year: 2025 },
  { id: "damru-2024",      collegeId: "rishihood",  name: "Damru 2024",            year: 2024 },

  // ---- Baaki colleges ke events ----
  { id: "spectra-2026",    collegeId: "northfield", name: "Spectra TechFest 2026", year: 2026 },
  { id: "convocation-2025",collegeId: "northfield", name: "Convocation 2025",      year: 2025 },
  { id: "carnival-2026",   collegeId: "st-aurelia", name: "Spring Carnival 2026",  year: 2026 },
  { id: "founders-2025",   collegeId: "st-aurelia", name: "Founders' Day 2025",    year: 2025 },
  { id: "designweek-2026", collegeId: "riverbend",  name: "Design Week 2026",      year: 2026 },
  { id: "gradshow-2025",   collegeId: "riverbend",  name: "Grad Show 2025",        year: 2025 },
];


// ----------------------------------------------------------
// HELPER FUNCTION: img()
// ----------------------------------------------------------
// picsum.photos ek free random image service hai.
// SMART PART: same "seed" = hamesha same photo milti hai.
// "damru-stage" → hamesha same stage photo
// "khatam-group" → hamesha same group photo
// Bina yeh seed ke har refresh pe alag photos aate — confusing lagta
// ----------------------------------------------------------
function img(seed: string): string {
  return `https://picsum.photos/seed/${seed}/700/700`;
  // seed = specific image choose karna
  // 700/700 = 700x700 pixels square image
}


// ----------------------------------------------------------
// PHOTOS — 21 fake memories
// ----------------------------------------------------------
// Har photo mein collegeId hai — gallery filter isi se kaam karti hai
// Ek college ki photos doosre college ke users ko NAHI dikhti
// ----------------------------------------------------------
export const photos: Photo[] = [

  // =================== RISHIHOOD ===================

  // --- Damru 2026 ---
  {
    id: "p1",
    collegeId: "rishihood",           // sirf Rishihood users dekhenge
    imageUrl: img("damru-stage"),     // picsum se consistent image
    caption: "Headliner night on the main stage",
    hashtags: ["Damru26", "Music", "Night"], // # ke bina
    eventId: "damru-2026",            // event se linked — filter kaam karega
    year: 2026,
    uploaderName: "Aarav Sharma",
    uploadedAt: "2026-03-15",         // YYYY-MM-DD format — sort ke liye useful
  },
  {
    id: "p2",
    collegeId: "rishihood",
    imageUrl: img("damru-crowd"),
    caption: "The whole crowd, all at once",
    hashtags: ["Damru26", "Crowd"],
    eventId: "damru-2026",
    year: 2026,
    uploaderName: "Priya Verma",
    uploadedAt: "2026-03-16",
  },
  {
    id: "p3",
    collegeId: "rishihood",
    imageUrl: img("damru-food"),
    caption: "Longest queue at the food stalls",
    hashtags: ["Damru26", "Food"],
    eventId: "damru-2026",
    year: 2026,
    uploaderName: "Kabir Singh",
    uploadedAt: "2026-03-16",
  },
  {
    id: "p4",
    collegeId: "rishihood",
    imageUrl: img("damru-dhol"),
    caption: "Dhol at 2 am, no regrets",
    hashtags: ["Damru26", "Night", "Music"],
    eventId: "damru-2026",
    year: 2026,
    uploaderName: "Meera Nair",
    uploadedAt: "2026-03-17",
  },

  // --- Khatam (Farewell) 2026 ---
  {
    id: "p5",
    collegeId: "rishihood",
    imageUrl: img("khatam-group"),
    caption: "Last day, last group photo",
    hashtags: ["Khatam", "Batch2026", "Friends"],
    eventId: "khatam-2026",
    year: 2026,
    uploaderName: "Rohan Gupta",
    uploadedAt: "2026-05-02",
  },
  {
    id: "p6",
    collegeId: "rishihood",
    imageUrl: img("khatam-cake"),
    caption: "The cake lasted two minutes",
    hashtags: ["Khatam", "Food"],
    eventId: "khatam-2026",
    year: 2026,
    uploaderName: "Sneha Iyer",
    uploadedAt: "2026-05-02",
  },
  {
    id: "p7",
    collegeId: "rishihood",
    imageUrl: img("khatam-hug"),
    caption: "See you on the other side",
    hashtags: ["Khatam", "Friends"],
    eventId: "khatam-2026",
    year: 2026,
    uploaderName: "Aarav Sharma",
    uploadedAt: "2026-05-03",
  },

  // --- Hack Night 2025 ---
  {
    id: "p8",
    collegeId: "rishihood",
    imageUrl: img("hack-laptops"),
    caption: "36 hours, 4 laptops, 1 working demo",
    hashtags: ["HackNight", "Code"],
    eventId: "hackathon-2025",
    year: 2025,
    uploaderName: "Ishaan Mehta",
    uploadedAt: "2025-10-12",
  },

  // --- Sports Day 2025 ---
  {
    id: "p9",
    collegeId: "rishihood",
    imageUrl: img("sports-race"),
    caption: "Photo finish at the 100m",
    hashtags: ["SportsDay", "Athletics"],
    eventId: "sports-2025",
    year: 2025,
    uploaderName: "Kabir Singh",
    uploadedAt: "2025-02-10",
  },
  {
    id: "p10",
    collegeId: "rishihood",
    imageUrl: img("sports-cricket"),
    caption: "Final over, six to win",
    hashtags: ["SportsDay", "Cricket"],
    eventId: "sports-2025",
    year: 2025,
    uploaderName: "Aarav Sharma",
    uploadedAt: "2025-02-11",
  },

  // --- Orientation 2025 ---
  {
    id: "p11",
    collegeId: "rishihood",
    imageUrl: img("orientation-hall"),
    caption: "Day one — nobody knew anyone yet",
    hashtags: ["Orientation", "Batch2029"],
    eventId: "orientation-2025",
    year: 2025,
    uploaderName: "Meera Nair",
    uploadedAt: "2025-08-01",
  },

  // --- Damru 2024 ---
  {
    id: "p12",
    collegeId: "rishihood",
    imageUrl: img("damru24-lights"),
    caption: "The lights at Damru 2024",
    hashtags: ["Damru24", "Night"],
    eventId: "damru-2024",
    year: 2024,
    uploaderName: "Ishaan Mehta",
    uploadedAt: "2024-03-20",
  },
  {
    id: "p13",
    collegeId: "rishihood",
    imageUrl: img("damru24-dance"),
    caption: "Dance battle winners",
    hashtags: ["Damru24", "Dance"],
    eventId: "damru-2024",
    year: 2024,
    uploaderName: "Priya Verma",
    uploadedAt: "2024-03-21",
  },

  // =================== NORTHFIELD ===================
  {
    id: "n1",
    collegeId: "northfield",   // sirf Northfield users dekhenge — college isolation
    imageUrl: img("spectra-robot"),
    caption: "Robo wars semi-final",
    hashtags: ["Spectra26", "Robotics"],
    eventId: "spectra-2026",
    year: 2026,
    uploaderName: "Dev Patil",
    uploadedAt: "2026-02-20",
  },
  {
    id: "n2",
    collegeId: "northfield",
    imageUrl: img("spectra-night"),
    caption: "Pro-show from the back row",
    hashtags: ["Spectra26", "Night"],
    eventId: "spectra-2026",
    year: 2026,
    uploaderName: "Ananya Rao",
    uploadedAt: "2026-02-21",
  },
  {
    id: "n3",
    collegeId: "northfield",
    imageUrl: img("convo-caps"),
    caption: "Caps in the air",
    hashtags: ["Convocation", "Batch2025"],
    eventId: "convocation-2025",
    year: 2025,
    uploaderName: "Dev Patil",
    uploadedAt: "2025-07-05",
  },

  // =================== ST. AURELIA ===================
  {
    id: "a1",
    collegeId: "st-aurelia",
    imageUrl: img("carnival-wheel"),
    caption: "Ferris wheel at sunset",
    hashtags: ["Carnival26", "Sunset"],
    eventId: "carnival-2026",
    year: 2026,
    uploaderName: "Maria D'Souza",
    uploadedAt: "2026-04-10",
  },
  {
    id: "a2",
    collegeId: "st-aurelia",
    imageUrl: img("carnival-games"),
    caption: "Lost every ring toss",
    hashtags: ["Carnival26", "Friends"],
    eventId: "carnival-2026",
    year: 2026,
    uploaderName: "Nikhil Menon",
    uploadedAt: "2026-04-11",
  },
  {
    id: "a3",
    collegeId: "st-aurelia",
    imageUrl: img("founders-choir"),
    caption: "Choir on Founders' Day",
    hashtags: ["FoundersDay", "Music"],
    eventId: "founders-2025",
    year: 2025,
    uploaderName: "Maria D'Souza",
    uploadedAt: "2025-09-14",
  },

  // =================== RIVERBEND ===================
  {
    id: "r1",
    collegeId: "riverbend",
    imageUrl: img("design-posters"),
    caption: "Poster wall, week one",
    hashtags: ["DesignWeek", "Posters"],
    eventId: "designweek-2026",
    year: 2026,
    uploaderName: "Tara Shah",
    uploadedAt: "2026-01-25",
  },
  {
    id: "r2",
    collegeId: "riverbend",
    imageUrl: img("gradshow-chair"),
    caption: "The chair that won the grad show",
    hashtags: ["GradShow", "Furniture"],
    eventId: "gradshow-2025",
    year: 2025,
    uploaderName: "Yash Joshi",
    uploadedAt: "2025-06-02",
  },
];
// Total: 13 Rishihood + 3 Northfield + 3 St.Aurelia + 2 Riverbend = 21 photos
