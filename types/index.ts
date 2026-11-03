// TypeScript types = data ka shape. Galat field likhne pe TypeScript turant error dega.
// Ye database tables se match karenge (colleges, events, photos, profiles).

export interface College {
  id: string;
  name: string;
  city: string;
  emailDomains: string[]; // allowed email domains, jaise ["rishihood.edu.in"]
}

export interface CampusEvent {
  id: string;
  collegeId: string; // kis college ka event hai
  name: string;
  year: number;
}

export interface Photo {
  id: string;
  collegeId: string; // har photo ek college ki hai — dusre college wale ise nahi dekhenge
  imageUrl: string; // baad mein Cloudinary ka URL
  caption: string;
  hashtags: string[]; // bina "#" ke, jaise ["Damru26"]
  eventId: string;
  year: number;
  uploaderName: string;
  uploadedAt: string; // "2026-03-15" format
}

// Logged-in student
export interface SessionUser {
  email: string;
  fullName: string; // onboarding se pehle khaali ""
  batchYear: number | null;
}
