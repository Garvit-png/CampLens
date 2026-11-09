// ============================================================
// FILE: types/index.ts
// ============================================================
// Yeh file poore project ka "DATA DICTIONARY" hai.
// Yahan define hota hai ki kisi bhi object ki SHAPE kaisi hogi.
//
// TypeScript mein "interface" ek BLUEPRINT hota hai.
// Jaise ghar ke nakshe mein likha hota hai: "yahan 3 kamre honge,
// ek bathroom hoga" — aise hi interface mein fields define hoti hain.
//
// FAYDA: Agar koi galat field likhe (jaise photo.image_Url),
// TypeScript turant red line se error dikhayega — run karne se pehle.
// ============================================================


// ----------------------------------------------------------
// COLLEGE KYA HOTA HAI IS PROJECT MEIN?
// ----------------------------------------------------------
// Ek university ya college ki basic information.
// Example object:
// {
//   id: "rishihood",
//   name: "Rishihood University",
//   city: "Sonipat",
//   emailDomains: ["rishihood.edu.in"]
// }
// ----------------------------------------------------------
export interface College {
  id: string;
  // Unique pehchaan — ek chhota text code
  // Example: "rishihood", "northfield", "dtu"

  name: string;
  // College ka poora official naam
  // Example: "Rishihood University"

  city: string;
  // College kis sheher mein hai
  // Example: "Sonipat", "Delhi", "Pune"

  emailDomains: string[];
  // string[] matlab: strings ka array (list)
  // Yeh domains allowed hain login ke liye
  // Example: ["rishihood.edu.in", "student.rishihood.edu.in"]
  // Agar koi @gmail.com se login kare → block hoga
}


// ----------------------------------------------------------
// CAMPUS EVENT KYA HOTA HAI?
// ----------------------------------------------------------
// College mein hone wala koi event — fest, farewell, sports day.
// Photos inn events se tagged hoti hain taaki organize rahe.
// Example object:
// {
//   id: "damru-2026",
//   collegeId: "rishihood",
//   name: "Damru 2026",
//   year: 2026
// }
// ----------------------------------------------------------
export interface CampusEvent {
  id: string;
  // Event ka unique ID
  // Example: "damru-2026", "khatam-2026"

  collegeId: string;
  // Yeh event KAUNSE college ka hai
  // College ke ID se match karta hai (jaise "rishihood")
  // Ek college ke events doosre college ko nahi dikhenge

  name: string;
  // Event ka display naam
  // Example: "Damru 2026", "Khatam (Farewell) 2026"

  year: number;
  // Kaunse saal hua event
  // number type — text nahi, sirf integer
  // Example: 2026, 2025
}


// ----------------------------------------------------------
// PHOTO KYA HOTA HAI?
// ----------------------------------------------------------
// Ek uploaded memory — image ke saath uski saari details.
// Database mein actual image store NAHI hogi — sirf URL hoga.
// Actual image → Cloudinary pe (baad mein setup hoga)
// Database mein → sirf link
// Example object:
// {
//   id: "p1",
//   collegeId: "rishihood",
//   imageUrl: "https://picsum.photos/...",
//   caption: "Dhol at 2 am",
//   hashtags: ["Damru26", "Night"],
//   eventId: "damru-2026",
//   year: 2026,
//   uploaderName: "Garvit",
//   uploadedAt: "2026-03-15"
// }
// ----------------------------------------------------------
export interface Photo {
  id: string;
  // Har photo ka unique ID
  // Example: "p1", "p2", ya real mein UUID: "abc-123-xyz"

  collegeId: string;
  // Yeh photo KAUNSE college ki hai
  // IMPORTANT: Ek college ke photos doosre college ke log NAHI dekh sakte
  // Gallery mein filter yahi collegeId check karta hai

  imageUrl: string;
  // Photo ki URL (internet address)
  // Abhi: picsum.photos se random image
  // Real mein: Cloudinary ka URL, jaise:
  //   "https://res.cloudinary.com/camplens/image/upload/v123/photo.jpg"

  caption: string;
  // Photo ke neeche likhi description — "back of the photo" feel
  // Example: "Last day, last group photo"

  hashtags: string[];
  // # ke BINA tags ki list
  // Example: ["Damru26", "Night", "Music"]
  // Note: "#Damru26" nahi, sirf "Damru26"
  // Search bar mein # add karke dikhate hain UI mein

  eventId: string;
  // Yeh photo kis event mein li gayi thi
  // CampusEvent ke id se match karta hai
  // Example: "damru-2026"

  year: number;
  // Kaunse saal ki photo hai
  // Gallery mein year filter isko use karta hai
  // Example: 2026

  uploaderName: string;
  // Kisne upload kiya — naam se track karte hain (abhi)
  // Real mein user ID se hoga (Supabase user.id)
  // Example: "Garvit Sharma"

  uploadedAt: string;
  // Kab upload hua — "YYYY-MM-DD" format mein
  // Example: "2026-03-15"
  // string type isliye kyunki Date objects tricky hote hain

  uploaderId?: string;
  // Real DB: profiles.id (uploader_id) — profile page pe "meri photos" match karne ke liye

  eventName?: string;
  // Real DB: events table se join karke aata hai ("Damru 2026")

  thumbnailUrl?: string;
  // Real DB: Cloudinary ka chhota 400x400 version — gallery grid ke liye (fast load)
  // formatDate() helper se readable banate hain
}


// ----------------------------------------------------------
// SESSION USER KYA HOTA HAI?
// ----------------------------------------------------------
// Jo abhi logged-in student hai uski basic info.
// Yeh session.tsx mein store hota hai.
// Example object:
// {
//   email: "garvit@rishihood.edu.in",
//   fullName: "Garvit Sharma",
//   batchYear: 2027
// }
// ----------------------------------------------------------
export interface SessionUser {
  email: string;
  // Student ki college email
  // Example: "garvit@rishihood.edu.in"
  // Login ke time se set hoti hai

  fullName: string;
  // Student ka poora naam
  // Onboarding se pehle: "" (khaali string)
  // Onboarding ke baad: "Garvit Sharma"
  // RequireSession check karta hai: fullName khaali ho to onboarding pe bhejo

  batchYear: number | null;
  // Graduation year — "Class of 2027"
  // number | null matlab: ya toh number hoga ya null (kuch nahi)
  // Onboarding se pehle: null
  // Onboarding ke baad: 2027
}
