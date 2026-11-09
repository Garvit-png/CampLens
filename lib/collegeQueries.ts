// ============================================================
// FILE: lib/collegeQueries.ts — Colleges Supabase se laana
// ============================================================
// Landing page (college select) aur login page yahan se colleges lete hain.
// Pehle yeh lib/mockData.ts ke nakli colleges the (Northfield, St. Aurelia…)
// jinki IDs database se match nahi karti thi.
//
// RLS: colleges + college_email_domains dono pe SELECT USING (true) hai,
// toh bina login ke bhi (anon) yeh query chal jaati hai.
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { College } from "@/types";

interface CollegeRow {
  id: string;
  name: string;
  city: string | null;
  college_email_domains: { domain: string }[] | null;
}

function toCollege(row: CollegeRow): College {
  return {
    id: row.id,
    name: row.name,
    city: row.city ?? "",
    emailDomains: (row.college_email_domains ?? []).map((d) => d.domain),
  };
}

const COLLEGE_SELECT = "id, name, city, college_email_domains ( domain )";

// Saare active colleges (naam ke hisaab se sorted)
export async function fetchColleges(supabase: SupabaseClient): Promise<College[]> {
  const { data, error } = await supabase
    .from("colleges")
    .select(COLLEGE_SELECT)
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Colleges load error:", error.message);
    return [];
  }
  return ((data ?? []) as CollegeRow[]).map(toCollege);
}

// Ek college ID se (login page ke liye). Nahi mila → null
export async function fetchCollegeById(
  supabase: SupabaseClient,
  collegeId: string
): Promise<College | null> {
  // Purane mock IDs ("rishihood") UUID nahi hain — query mat bhejo, seedha null
  const isUuid = /^[0-9a-f-]{36}$/i.test(collegeId);
  if (!isUuid) return null;

  const { data, error } = await supabase
    .from("colleges")
    .select(COLLEGE_SELECT)
    .eq("id", collegeId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) console.error("College load error:", error.message);
  return data ? toCollege(data as CollegeRow) : null;
}
