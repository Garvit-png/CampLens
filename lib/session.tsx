"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CampusEvent, Photo } from "@/types";

interface SessionValue {
  isReady: boolean;
  supabaseUser: any | null;
  profile: any | null;
  collegeId: string | null;
  collegePhotos: Photo[];
  collegeEvents: CampusEvent[];
  college: { id: string; name: string; city: string } | null;
  addPhotos: (newPhotos: Photo[]) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  reloadPhotos: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [collegePhotos, setCollegePhotos] = useState<Photo[]>([]);
  const [collegeEvents, setCollegeEvents] = useState<CampusEvent[]>([]);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Supabase se real photos load karo
  async function loadPhotos(collegeId: string) {
    const { data, error } = await supabase
      .from("photos")
      .select(`
        id,
        image_url,
        thumbnail_url,
        caption,
        hashtags,
        year,
        uploaded_at,
        event_id,
        college_id,
        uploader_id,
        profiles ( full_name ),
        events ( name )
      `)
      .eq("college_id", collegeId)
      .eq("is_approved", true)
      .order("uploaded_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Photos load error:", error.message);
      return;
    }

    // Supabase snake_case → TypeScript camelCase convert karo
    const photos: Photo[] = (data ?? []).map((p: any) => ({
      id: p.id,
      collegeId: p.college_id,
      imageUrl: p.image_url,
      caption: p.caption ?? "",
      hashtags: p.hashtags ?? [],
      eventId: p.event_id ?? "",
      year: p.year ?? new Date().getFullYear(),
      uploaderName: p.profiles?.full_name ?? "Unknown",
      uploadedAt: p.uploaded_at?.slice(0, 10) ?? "",
      uploaderId: p.uploader_id,
      eventName: p.events?.name ?? undefined,
      thumbnailUrl: p.thumbnail_url ?? undefined,
    }));

    setCollegePhotos(photos);
  }

  // College ke saare events (gallery filter dropdown ke liye)
  async function loadEvents(collegeId: string) {
    const { data, error } = await supabase
      .from("events")
      .select("id, college_id, name, year")
      .eq("college_id", collegeId)
      .order("year", { ascending: false });

    if (error) {
      console.error("Events load error:", error.message);
      return;
    }

    setCollegeEvents(
      (data ?? []).map((e: { id: string; college_id: string; name: string; year: number }) => ({
        id: e.id,
        collegeId: e.college_id,
        name: e.name,
        year: e.year,
      }))
    );
  }

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, colleges(name, id, city)")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) console.error("Profile load error:", error.message);
    setProfile(data ?? null);

    // Profile milte hi photos load karo
    if (data?.college_id) {
      await Promise.all([loadPhotos(data.college_id), loadEvents(data.college_id)]);
    }
  }

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setSupabaseUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setProfile(null);
          setCollegePhotos([]);
          setCollegeEvents([]);
        }

        if (event === "INITIAL_SESSION") {
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

  // Upload ke baad photos reload karo
  async function reloadPhotos() {
    if (profile?.college_id) {
      await Promise.all([loadPhotos(profile.college_id), loadEvents(profile.college_id)]);
    }
  }

  // addPhotos: Optimistic update — DB pe bhi save hota hai via API
  function addPhotos(newPhotos: Photo[]) {
    setCollegePhotos(prev => [...newPhotos, ...prev]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setProfile(null);
    setCollegePhotos([]);
    setCollegeEvents([]);
  }

  const collegeId = profile?.college_id ?? null;
  const college = profile?.colleges
    ? {
        id: profile.colleges.id as string,
        name: (profile.colleges.name as string) ?? "",
        city: (profile.colleges.city as string) ?? "",
      }
    : null;

  return (
    <SessionContext.Provider value={{
      isReady, supabaseUser, profile, collegeId,
      collegePhotos, collegeEvents, college, addPhotos, signOut, refreshProfile, reloadPhotos,
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
