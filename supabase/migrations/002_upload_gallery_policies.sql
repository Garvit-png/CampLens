-- ============================================================
-- 002 — Upload + Gallery ke liye missing RLS policies
-- ============================================================
-- Kaise chalayein: Supabase Dashboard → SQL Editor → yeh poori file paste → Run
-- Safe to re-run (har policy pehle DROP hoti hai).
--
-- Kyun chahiye:
--   1. events      → INSERT policy nahi thi → upload page pe "+ New event" fail hota tha
--   2. tags        → INSERT/UPDATE policy nahi thi → hashtags save nahi hote the
--   3. photo_tags  → INSERT policy nahi thi
--   4. profiles    → sirf apna profile dikhta tha → gallery mein doosron ki photo pe
--                    uploader naam "Unknown" aata tha
-- ============================================================

-- Helper: current user ka college_id.
-- SECURITY DEFINER isliye taaki profiles ki policy ke andar profiles query karne
-- se "infinite recursion" error na aaye.
CREATE OR REPLACE FUNCTION public.my_college_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT college_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.my_college_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_college_id() TO authenticated;

-- ---------- profiles: same college walon ke profile (naam) dikh sakein ----------
DROP POLICY IF EXISTS "profiles_select_same_college" ON profiles;
CREATE POLICY "profiles_select_same_college" ON profiles
  FOR SELECT TO authenticated
  USING (college_id IS NOT NULL AND college_id = public.my_college_id());

-- ---------- events: apne college mein naya event bana sakein ----------
DROP POLICY IF EXISTS "events_insert_own_college" ON events;
CREATE POLICY "events_insert_own_college" ON events
  FOR INSERT TO authenticated
  WITH CHECK (college_id = public.my_college_id());

-- ---------- tags: apne college ke tags bana/update kar sakein ----------
DROP POLICY IF EXISTS "tags_insert_own_college" ON tags;
CREATE POLICY "tags_insert_own_college" ON tags
  FOR INSERT TO authenticated
  WITH CHECK (college_id = public.my_college_id());

DROP POLICY IF EXISTS "tags_update_own_college" ON tags;
CREATE POLICY "tags_update_own_college" ON tags
  FOR UPDATE TO authenticated
  USING (college_id = public.my_college_id())
  WITH CHECK (college_id = public.my_college_id());

-- ---------- photo_tags: sirf apni photo pe tag link kar sakein ----------
DROP POLICY IF EXISTS "photo_tags_insert_own_photo" ON photo_tags;
CREATE POLICY "photo_tags_insert_own_photo" ON photo_tags
  FOR INSERT TO authenticated
  WITH CHECK (
    photo_id IN (
      SELECT p.id FROM photos p
      JOIN profiles pr ON pr.id = p.uploader_id
      WHERE pr.user_id = auth.uid()
    )
  );
