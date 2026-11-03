// Session = "abhi kaunsa college chuna hai" + "kaun logged in hai".
//
// React Context ka use kar rahe hain: ek baar data yahan rakho, aur koi bhi page
// useSession() likh ke use padh sakta hai — har page ko props pass nahi karne padte.
//
// College aur user localStorage mein save hote hain, taaki refresh ke baad bhi yaad rahein.
// Ye sirf demo ke liye hai — asli login Supabase Auth se hoga (server pe verify hoke).
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { photos as samplePhotos } from "@/lib/mockData";
import type { Photo, SessionUser } from "@/types";

const STORAGE_KEY = "campuslens-session";

interface SessionValue {
  isReady: boolean; // localStorage padh liya ya nahi
  collegeId: string | null;
  user: SessionUser | null;
  collegePhotos: Photo[]; // sirf chune hue college ki photos
  selectCollege: (collegeId: string) => void;
  signIn: (email: string) => void;
  saveProfile: (fullName: string, batchYear: number) => void;
  signOut: () => void;
  switchCampus: () => void;
  addPhotos: (newPhotos: Photo[]) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

// localStorage mein save karne ka helper
function saveToStorage(collegeId: string | null, user: SessionUser | null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ collegeId, user }));
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  // Is session mein upload ki gayi photos. Sirf memory mein hain — refresh pe chali jaayengi.
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);

  // Page khulte hi ek baar: localStorage se purana session padho.
  // localStorage sirf browser mein hota hai, isliye useEffect ke andar padhte hain.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage se ek baar load karna hai
        setCollegeId(parsed.collegeId ?? null);
        setUser(parsed.user ?? null);
      } catch {
        localStorage.removeItem(STORAGE_KEY); // kharab data ho to hata do
      }
    }
    setIsReady(true);
  }, []);

  function selectCollege(newCollegeId: string) {
    // College badla to purana login hata do (user ek hi college ka hota hai)
    const keepUser = newCollegeId === collegeId ? user : null;
    setCollegeId(newCollegeId);
    setUser(keepUser);
    saveToStorage(newCollegeId, keepUser);
  }

  function signIn(email: string) {
    const newUser: SessionUser = { email, fullName: "", batchYear: null };
    setUser(newUser);
    saveToStorage(collegeId, newUser);
  }

  function saveProfile(fullName: string, batchYear: number) {
    if (!user) return;
    const updatedUser = { ...user, fullName, batchYear };
    setUser(updatedUser);
    saveToStorage(collegeId, updatedUser);
  }

  function signOut() {
    setUser(null);
    saveToStorage(collegeId, null);
  }

  function switchCampus() {
    setCollegeId(null);
    setUser(null);
    saveToStorage(null, null);
  }

  function addPhotos(newPhotos: Photo[]) {
    setUploadedPhotos([...newPhotos, ...uploadedPhotos]);
  }

  // Uploaded + sample photos milao, phir sirf is college wali rakho
  const collegePhotos = [...uploadedPhotos, ...samplePhotos].filter(
    (photo) => photo.collegeId === collegeId
  );

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

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// Kisi bhi component mein: const { user, collegeId } = useSession();
export function useSession(): SessionValue {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession() must be used inside <SessionProvider>");
  }
  return session;
}
