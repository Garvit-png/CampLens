// ============================================================
// FILE: lib/session.tsx
// ============================================================
// Yeh file poori app ka "MEMORY SYSTEM" hai.
// Yahan store hota hai:
//   1. Kaun login hai (user ki info)
//   2. Kaunsa college selected hai
//   3. Is session mein kaunsi photos upload ki gayi hain
//
// REACT CONTEXT KYA HOTA HAI?
// Normal problem: Gallery page ko user info chahiye, Profile page ko bhi,
// Upload page ko bhi — sabko alag alag pass karna padta.
// Context Solution: Ek jagah (SessionProvider) mein data rakho,
// koi bhi page useSession() likh ke seedha le lo.
// Jaise ghar mein ek WiFi router — sab connect ho sakte hain.
//
// LOCALSTORAGE KYA HOTA HAI?
// Browser ka local storage — page refresh pe bhi data bachta hai.
// Yahan session save karte hain taaki:
//   - User browser close kare aur dobara khole → login yaad rahe
//   - Page refresh kare → college selection yaad rahe
//
// NOTE: Abhi sirf demo ke liye hai.
// Real mein Supabase Auth hoga — server pe verify hoga.
// ============================================================

"use client";
// 'use client' zaroori hai kyunki:
// - useState (React hooks) use kar rahe hain
// - useEffect use kar rahe hain
// - localStorage (browser-only API) use kar rahe hain
// Server pe yeh sab available nahi hote

import { createContext, useContext, useEffect, useState } from "react";
// createContext → Context object banane ke liye
// useContext    → Context se data padhne ke liye (useSession mein use hoga)
// useEffect     → Component mount hone ke baad side effect karne ke liye
// useState      → Component ke andar state (data) store karne ke liye

import { photos as samplePhotos } from "@/lib/mockData";
// mockData se saari sample photos import kar rahe hain
// "as samplePhotos" → rename kiya taaki "photos" variable se conflict na ho

import type { Photo, SessionUser } from "@/types";
// TypeScript types import


const STORAGE_KEY = "campuslens-session";
// localStorage mein data save karne ke liye key naam
// Jaise diary mein topic heading — isi naam se save aur load hoga
// Agar change karo → purani saved sessions kaam nahi karenge


// ----------------------------------------------------------
// SessionValue INTERFACE
// ----------------------------------------------------------
// Yeh define karta hai ki Context mein kya kya available hoga.
// useSession() yahi return karega.
// ----------------------------------------------------------
interface SessionValue {
  isReady: boolean;
  // false = localStorage abhi padha nahi gaya (loading state)
  // true  = data ready hai, pages render ho sakte hain
  // RequireSession component isReady ka wait karta hai

  collegeId: string | null;
  // User ne kaunsa college select kiya
  // null = koi college select nahi kiya abhi

  user: SessionUser | null;
  // Login kiya hua user ki info (email, naam, batch)
  // null = koi login nahi hai abhi

  collegePhotos: Photo[];
  // Sirf is college ki photos (mock + uploaded dono)
  // Gallery page directly yeh use karta hai

  selectCollege: (collegeId: string) => void;
  // Function: College select karo
  // Home page pe college click karne pe yeh call hota hai

  signIn: (email: string) => void;
  // Function: Email se login karo
  // Login page form submit pe yeh call hota hai

  saveProfile: (fullName: string, batchYear: number) => void;
  // Function: Naam aur batch save karo
  // Onboarding form submit pe yeh call hota hai

  signOut: () => void;
  // Function: Logout karo
  // Profile page pe "Sign out" button yeh call karta hai

  switchCampus: () => void;
  // Function: Alag college select karne ke liye sab clear karo
  // Navbar pe college name click karne pe yeh call hota hai

  addPhotos: (newPhotos: Photo[]) => void;
  // Function: Naye photos session mein add karo
  // Upload page pe upload karne ke baad yeh call hota hai
}


const SessionContext = createContext<SessionValue | null>(null);
// Context object banao
// null → default value (jab koi Provider nahi hota)
// <SessionValue | null> → TypeScript: ya SessionValue hoga ya null


// ----------------------------------------------------------
// HELPER FUNCTION: saveToStorage
// ----------------------------------------------------------
// LocalStorage mein college aur user save karta hai.
// JSON.stringify → JavaScript object → string (storage ke liye)
// ----------------------------------------------------------
function saveToStorage(collegeId: string | null, user: SessionUser | null) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ collegeId, user })
    // { collegeId: "rishihood", user: { email: "...", ... } }
    // → '{"collegeId":"rishihood","user":{...}}'  (string)
  );
}


// ----------------------------------------------------------
// SessionProvider COMPONENT
// ----------------------------------------------------------
// Yeh component poori app ko wrap karta hai (app/layout.tsx mein).
// Sab state yahan hai — children ko Context ke through milta hai.
// ----------------------------------------------------------
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  // false se start — jab tak localStorage na padh lein

  const [collegeId, setCollegeId] = useState<string | null>(null);
  // Currently selected college ka ID
  // null = koi nahi chuna

  const [user, setUser] = useState<SessionUser | null>(null);
  // Currently logged-in user
  // null = koi login nahi

  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  // Is browser session mein upload ki gayi photos
  // Page refresh karo → yeh chali jayengi (real mein DB mein save hongi)


  // ----------------------------------------------------------
  // useEffect — Component mount pe ek baar chalta hai
  // ----------------------------------------------------------
  // [] dependency array = sirf pehli baar chale, dobara nahi
  // localStorage browser-only hai, isliye useEffect mein padhna zaroori
  // ----------------------------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // STORAGE_KEY se data load karo
    // Agar pehle save kiya tha → string milegi
    // Pehli baar → null milega

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // JSON.parse → string → JavaScript object wapas
        // '{"collegeId":"rishihood"}' → { collegeId: "rishihood" }

        setCollegeId(parsed.collegeId ?? null);
        // ?? null → agar parsed.collegeId undefined hai to null use karo

        setUser(parsed.user ?? null);

      } catch {
        localStorage.removeItem(STORAGE_KEY);
        // Agar data corrupt ho gaya (kisi ne manually tamper kiya)
        // to storage clear karo — fresh start
      }
    }

    setIsReady(true);
    // localStorage padh liya — ab pages render ho sakte hain
  }, []);
  // [] = sirf ek baar — component pehli baar screen pe aaye tab


  // ----------------------------------------------------------
  // selectCollege — User ne college choose kiya
  // ----------------------------------------------------------
  function selectCollege(newCollegeId: string) {
    const keepUser = newCollegeId === collegeId ? user : null;
    // Agar same college dobara select kiya → user ko raho
    // Alag college select kiya → user ko clear karo
    // (Ek user ek hi college ka hota hai)

    setCollegeId(newCollegeId);
    // State update karo → React re-render karega

    setUser(keepUser);

    saveToStorage(newCollegeId, keepUser);
    // localStorage mein bhi save karo (refresh ke liye)
  }


  // ----------------------------------------------------------
  // signIn — User ne email se login kiya
  // ----------------------------------------------------------
  function signIn(email: string) {
    const newUser: SessionUser = {
      email,
      // Passed email
      fullName: "",
      // Abhi khaali — onboarding mein bhara jayega
      batchYear: null,
      // Abhi null — onboarding mein set hoga
    };
    setUser(newUser);
    saveToStorage(collegeId, newUser);
  }


  // ----------------------------------------------------------
  // saveProfile — Onboarding mein naam + batch bhara
  // ----------------------------------------------------------
  function saveProfile(fullName: string, batchYear: number) {
    if (!user) return;
    // Guard: agar user login nahi hai to kuch mat karo

    const updatedUser = { ...user, fullName, batchYear };
    // Spread operator: {...user} → user ka copy banao
    // Phir fullName aur batchYear override karo
    // Original user object change nahi hota

    setUser(updatedUser);
    saveToStorage(collegeId, updatedUser);
  }


  // ----------------------------------------------------------
  // signOut — Logout karo
  // ----------------------------------------------------------
  function signOut() {
    setUser(null);
    // User state clear karo

    saveToStorage(collegeId, null);
    // College selected raho, sirf user logout karo
    // (Woh wahi college select rehega, sirf login hatega)
  }


  // ----------------------------------------------------------
  // switchCampus — Alag college select karna hai
  // ----------------------------------------------------------
  function switchCampus() {
    setCollegeId(null);
    setUser(null);
    // Dono clear karo — fresh start

    saveToStorage(null, null);
    // LocalStorage bhi clear karo
  }


  // ----------------------------------------------------------
  // addPhotos — Naye photos upload kiye
  // ----------------------------------------------------------
  function addPhotos(newPhotos: Photo[]) {
    setUploadedPhotos([...newPhotos, ...uploadedPhotos]);
    // Naye photos PEHLE, purane baad
    // Gallery mein newest first dikhte hain
  }


  // ----------------------------------------------------------
  // collegePhotos — Gallery ke liye photos list
  // ----------------------------------------------------------
  const collegePhotos = [...uploadedPhotos, ...samplePhotos].filter(
    (photo) => photo.collegeId === collegeId
    // Uploaded photos + sample photos milao
    // Phir sirf is college ki photos rakho
    // Rishihood login kiya → sirf Rishihood ki photos
  );


  // ----------------------------------------------------------
  // Context value — yeh sab useSession() se milega
  // ----------------------------------------------------------
  const value: SessionValue = {
    isReady,
    collegeId,
    user,
    collegePhotos,
    selectCollege,
    signIn,
    saveProfile,
    signOut,
    switchCampus,
    addPhotos,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
      {/* children = poori app (Navbar, pages, Footer) */}
      {/* Provider ke andar jo bhi hai, useSession() use kar sakta hai */}
    </SessionContext.Provider>
  );
}


// ----------------------------------------------------------
// useSession HOOK — Kisi bhi component mein use karo
// ----------------------------------------------------------
// Example usage:
//   const { user, collegePhotos, addPhotos } = useSession()
//
// Agar SessionProvider ke bahar use kiya → helpful error milega
// ----------------------------------------------------------
export function useSession(): SessionValue {
  const session = useContext(SessionContext);
  // SessionContext se current value lo

  if (!session) {
    throw new Error("useSession() must be used inside <SessionProvider>");
    // Developer mistake pakadna: agar SessionProvider nahi lagaya
    // Error message batata hai kya fix karna hai
  }

  return session;
  // SessionValue return karo — destructuring se le sakte hain
}
