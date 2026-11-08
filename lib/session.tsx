"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { photos as samplePhotos } from "@/lib/mockData";
import type { Photo } from "@/types";

// ============================================================
// SessionValue — Context mein kya available hoga
// ============================================================
interface SessionValue {
  isReady: boolean;        // Supabase session check complete hua?
  supabaseUser: any | null; // Logged-in Supabase user (email, id)
  profile: any | null;      // Supabase profiles table se data (naam, college, batch)
  collegeId: string | null; // Shortcut: profile.college_id
  collegePhotos: Photo[];   // Is college ki photos
  addPhotos: (newPhotos: Photo[]) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>; // Onboarding ke baad profile reload karo
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);

  const supabase = createClient();

  // ----------------------------------------------------------
  // Profile load karo Supabase se
  // ----------------------------------------------------------
  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*, colleges(name, id)")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data ?? null);
  }

  // ----------------------------------------------------------
  // App load pe: Supabase session check karo
  // ----------------------------------------------------------
  useEffect(() => {
    // Auth state change listen karo (login/logout) — YEH HI SESSION DETECT KAREGA
    // onAuthStateChange fires immediately with INITIAL_SESSION event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setProfile(null);
        }
        // isReady sirf yahan set karo — INITIAL_SESSION ke baad
        setIsReady(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ----------------------------------------------------------
  // refreshProfile — Onboarding ke baad call karo
  // ----------------------------------------------------------
  async function refreshProfile() {
    if (supabaseUser) {
      await loadProfile(supabaseUser.id);
    }
  }

  // ----------------------------------------------------------
  // signOut
  // ----------------------------------------------------------
  async function signOut() {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setProfile(null);
  }

  // ----------------------------------------------------------
  // addPhotos — Upload ke baad session mein add karo
  // ----------------------------------------------------------
  function addPhotos(newPhotos: Photo[]) {
    setUploadedPhotos(prev => [...newPhotos, ...prev]);
  }

  // ----------------------------------------------------------
  // collegePhotos — Sirf is college ki photos
  // ----------------------------------------------------------
  const collegeId = profile?.college_id ?? null;

  const collegePhotos = [...uploadedPhotos, ...samplePhotos].filter(
    (photo) => photo.collegeId === collegeId
  );

  const value: SessionValue = {
    isReady,
    supabaseUser,
    profile,
    collegeId,
    collegePhotos,
    addPhotos,
    signOut,
    refreshProfile,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession() must be inside <SessionProvider>");
  return session;
}
