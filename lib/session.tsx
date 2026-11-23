"use client";

// ============================================================
// SESSION — Do alag sessions hain:
// 1. STUDENT session: localStorage mein collegeId + batchYear
//    No login needed. User college choose kare, batch choose kare — bas.
// 2. ADMIN session: Supabase Auth se. Admin login kare tab.
// ============================================================

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { CampusEvent, Photo } from "@/types";

interface SessionValue {
  // Student state (no login)
  collegeId: string | null;
  batchYear: string | null;
  college: { id: string; name: string; city: string } | null;
  setCollege: (id: string) => void;
  setBatch: (year: string) => void;
  clearStudent: () => void;

  // Photos + events (filtered by college)
  photos: Photo[];
  events: CampusEvent[];
  refreshCollege: () => Promise<void>;

  // Admin state (Supabase login)
  isAdminReady: boolean;
  isAdmin: boolean;
  adminSignOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

const STUDENT_KEY = "camplens-student"; // { collegeId, batchYear }

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // ---- Student state ----
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [batchYear, setBatchYear] = useState<string | null>(null);
  const [college, setCollegeObj] = useState<{ id: string; name: string; city: string } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);

  // ---- Admin state ----
  const [isAdminReady, setIsAdminReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Load student from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STUDENT_KEY);
    if (saved) {
      try {
        const { collegeId: cid, batchYear: by } = JSON.parse(saved);
        if (cid) {
          setCollegeId(cid);
          if (by) setBatchYear(by);
          loadCollegeData(cid);
        }
      } catch { localStorage.removeItem(STUDENT_KEY); }
    }
  }, []);

  // Admin: Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role, colleges(name, id, city)")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setIsAdmin(data?.role === "admin");
      } else {
        setIsAdmin(false);
      }
      if (event === "INITIAL_SESSION") setIsAdminReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadCollegeData(cid: string) {
    // Load college info
    const { data: col } = await supabase
      .from("colleges").select("id, name, city").eq("id", cid).single();
    if (col) setCollegeObj(col);

    // Load photos
    const { data: photoData } = await supabase
      .from("photos")
      .select("id, image_url, thumbnail_url, caption, hashtags, year, uploaded_at, event_id, college_id, uploader_id, profiles(full_name), events(name)")
      .eq("college_id", cid)
      .eq("is_approved", true)
      .order("uploaded_at", { ascending: false })
      .limit(200);

    if (photoData) {
      setPhotos(photoData.map((p: any) => ({
        id: p.id, collegeId: p.college_id,
        imageUrl: p.image_url, caption: p.caption ?? "",
        hashtags: p.hashtags ?? [], eventId: p.event_id ?? "",
        year: p.year ?? new Date().getFullYear(),
        uploaderName: p.profiles?.full_name ?? "Admin",
        uploadedAt: p.uploaded_at?.slice(0, 10) ?? "",
        uploaderId: p.uploader_id,
        eventName: p.events?.name ?? undefined,
        thumbnailUrl: p.thumbnail_url ?? undefined,
      })));
    }

    // Load events
    const { data: eventData } = await supabase
      .from("events").select("id, college_id, name, year")
      .eq("college_id", cid).order("year", { ascending: false });
    if (eventData) {
      setEvents(eventData.map((e: any) => ({
        id: e.id, collegeId: e.college_id, name: e.name, year: e.year,
      })));
    }
  }

  function setCollege(id: string) {
    setCollegeId(id);
    const existing = JSON.parse(localStorage.getItem(STUDENT_KEY) || "{}");
    localStorage.setItem(STUDENT_KEY, JSON.stringify({ ...existing, collegeId: id }));
    loadCollegeData(id);
  }

  function setBatch(year: string) {
    setBatchYear(year);
    const existing = JSON.parse(localStorage.getItem(STUDENT_KEY) || "{}");
    localStorage.setItem(STUDENT_KEY, JSON.stringify({ ...existing, batchYear: year }));
  }

  function clearStudent() {
    setCollegeId(null); setBatchYear(null); setCollegeObj(null);
    setPhotos([]); setEvents([]);
    localStorage.removeItem(STUDENT_KEY);
  }

  async function refreshCollege() {
    if (collegeId) await loadCollegeData(collegeId);
  }

  async function adminSignOut() {
    await supabase.auth.signOut();
    setIsAdmin(false);
  }

  return (
    <SessionContext.Provider value={{
      collegeId, batchYear, college, setCollege, setBatch, clearStudent,
      photos, events, refreshCollege,
      isAdminReady, isAdmin, adminSignOut,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useSession() must be inside <SessionProvider>");
  return s;
}