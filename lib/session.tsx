"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { photos as samplePhotos } from "@/lib/mockData";
import type { Photo } from "@/types";

interface SessionValue {
  isReady: boolean;
  supabaseUser: any | null;
  profile: any | null;
  collegeId: string | null;
  collegePhotos: Photo[];
  addPhotos: (newPhotos: Photo[]) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, colleges(name, id)")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) console.error("Profile load error:", error.message);
    setProfile(data ?? null);
  }

  useEffect(() => {
    let mounted = true;

    // onAuthStateChange handles INITIAL_SESSION automatically
    // createBrowserClient cookies se session restore karta hai
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log("Auth event:", event, session?.user?.email ?? 'no user');

        if (session?.user) {
          setSupabaseUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setProfile(null);
        }

        if (event === 'INITIAL_SESSION') {
          setIsReady(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (supabaseUser) await loadProfile(supabaseUser.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setProfile(null);
  }

  function addPhotos(newPhotos: Photo[]) {
    setUploadedPhotos(prev => [...newPhotos, ...prev]);
  }

  const collegeId = profile?.college_id ?? null;
  const collegePhotos = [...uploadedPhotos, ...samplePhotos].filter(
    (photo) => photo.collegeId === collegeId
  );

  return (
    <SessionContext.Provider value={{
      isReady, supabaseUser, profile, collegeId,
      collegePhotos, addPhotos, signOut, refreshProfile,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession() must be inside <SessionProvider>");
  return session;
}
