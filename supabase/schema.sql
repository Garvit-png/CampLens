-- ============================================================
-- CampusLens — Complete Database Schema
-- ============================================================
-- Supabase SQL Editor mein yeh POORA script ek baar mein paste
-- karo aur "Run" karo. Saari tables, policies, aur sample data
-- ek hi baar mein ban jayega.
--
-- ORDER MATTERS: Tables ek sequence mein bante hain kyunki
-- baad wali tables pehli wali pe depend karti hain (foreign keys).
--   1. colleges
--   2. college_email_domains
--   3. profiles  (auth.users pe depend karta hai)
--   4. events    (colleges pe depend karta hai)
--   5. photos    (profiles + colleges + events pe depend karta hai)
--   6. tags      (colleges pe depend karta hai)
--   7. photo_tags (photos + tags pe depend karta hai)
-- ============================================================


-- ============================================================
-- STEP 0: Clean slate — agar pehle se tables hain toh hata do
-- ============================================================
-- (Safe to run multiple times)

DROP TABLE IF EXISTS photo_tags    CASCADE;
DROP TABLE IF EXISTS tags          CASCADE;
DROP TABLE IF EXISTS photos        CASCADE;
DROP TABLE IF EXISTS events        CASCADE;
DROP TABLE IF EXISTS profiles      CASCADE;
DROP TABLE IF EXISTS college_email_domains CASCADE;
DROP TABLE IF EXISTS colleges      CASCADE;

DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;


-- ============================================================
-- STEP 1: colleges table
-- ============================================================
-- Har college ki basic info yahan store hoti hai.
-- Example: Rishihood University, DTU, NSUT

CREATE TABLE colleges (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- gen_random_uuid() → automatically ek unique ID generate karta hai
  -- UUID example: "550e8400-e29b-41d4-a716-446655440000"

  name       TEXT        NOT NULL,
  -- College ka poora naam. NOT NULL = zaroori field
  -- Example: "Rishihood University"

  short_name TEXT        NOT NULL,
  -- Short form / abbreviation
  -- Example: "RU", "DTU", "NSUT"

  city       TEXT,
  -- Sheher (optional)
  -- Example: "Sonipat", "Delhi"

  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  -- TRUE = college active hai (students login kar sakte hain)
  -- FALSE = deactivated

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- TIMESTAMPTZ = Timestamp With Time Zone
  -- NOW() = current time automatically insert hota hai
);

-- Index: College naam se jaldi dhundh sako
CREATE INDEX idx_colleges_name ON colleges (name);

-- RLS Enable karo
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- Policy: Koi bhi logged-in user colleges dekh sakta hai
CREATE POLICY "colleges_select" ON colleges
  FOR SELECT USING (true);
-- true = sab ko allow (colleges sensitive data nahi hain)


-- ============================================================
-- STEP 2: college_email_domains table
-- ============================================================
-- Har college ke allowed email domains yahan hain.
-- Ek college ke multiple domains ho sakte hain.
-- Example: IITD ke liye: iitd.ac.in, ee.iitd.ac.in
--
-- ONE-TO-MANY relationship:
-- Ek college → multiple email domains
-- (Isliye colleges table mein nahi rakha — alag table better hai)

CREATE TABLE college_email_domains (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  college_id UUID        NOT NULL REFERENCES colleges (id) ON DELETE CASCADE,
  -- REFERENCES colleges(id) = Foreign Key — colleges table se link
  -- ON DELETE CASCADE = agar college delete ho → domains bhi delete ho jayein

  domain     TEXT        NOT NULL UNIQUE,
  -- Email domain — @ ke baad wala part
  -- Example: "rishihood.edu.in" (NOT "@rishihood.edu.in")
  -- UNIQUE = ek domain sirf ek college ka ho sakta hai

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_domains_college ON college_email_domains (college_id);
CREATE INDEX idx_domains_domain  ON college_email_domains (domain);
-- Index on domain: login ke time domain se college dhundhna fast hoga

ALTER TABLE college_email_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domains_select" ON college_email_domains
  FOR SELECT USING (true);
-- Koi bhi dekh sakta hai (login validation ke liye public hona zaroori)


-- ============================================================
-- STEP 3: profiles table
-- ============================================================
-- Har student ka profile yahan store hota hai.
-- Supabase Auth ke auth.users table se linked hai (1-to-1).
--
-- WHY SEPARATE TABLE?
-- auth.users sirf email/password manage karta hai.
-- Hume additional info chahiye: college, batch year, naam.
-- Isliye alag profiles table.

CREATE TABLE profiles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id     UUID        NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  -- auth.users Supabase ka built-in table hai
  -- UNIQUE = ek auth user ka sirf ek profile
  -- ON DELETE CASCADE = user delete ho → profile bhi delete

  college_id  UUID        REFERENCES colleges (id) ON DELETE SET NULL,
  -- Kaunse college ka student hai
  -- ON DELETE SET NULL = college delete ho → profile ka college_id NULL ho jaaye
  -- (Profile delete nahi hogi, sirf college link toot jaayega)

  full_name   TEXT,
  -- Student ka naam (onboarding mein bhara jaata hai)

  batch_year  INT         CHECK (batch_year BETWEEN 1990 AND 2035),
  -- Graduation year. CHECK = allowed range
  -- 1990-2035 ke bahar value insert karne ki koshish → error

  is_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  -- FALSE = user ne abhi college/naam nahi select kiya
  -- TRUE = onboarding complete, gallery access milega

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user    ON profiles (user_id);
CREATE INDEX idx_profiles_college ON profiles (college_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Apna profile khud hi dekh sakta hai
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
-- auth.uid() = currently logged-in user ka UUID

-- Policy: Apna profile khud hi insert kar sakta hai
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Apna profile khud hi update kar sakta hai
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);


-- ============================================================
-- STEP 4: events table
-- ============================================================
-- College events: Freshers, Cultural Fest, Sports Day, Farewell
-- Photos inn events se tagged hoti hain.

CREATE TABLE events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  college_id   UUID        NOT NULL REFERENCES colleges (id) ON DELETE CASCADE,
  -- Kaunse college ka event hai

  name         TEXT        NOT NULL,
  -- Event ka naam
  -- Example: "Damru 2026", "Khatam (Farewell) 2026"

  year         INT         NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  -- Kaunse saal ka event

  event_date   DATE,
  -- Exact date (optional)
  -- Example: '2026-03-15'

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_college ON events (college_id);
CREATE INDEX idx_events_year    ON events (year);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Apne college ke events dekh sako
CREATE POLICY "events_select" ON events
  FOR SELECT USING (
    college_id IN (
      SELECT college_id FROM profiles WHERE user_id = auth.uid()
    )
  );
-- Subquery: current user ke college ki events dikhao
-- Dusre college ke events nahi dikhenge


-- ============================================================
-- STEP 5: photos table
-- ============================================================
-- Uploaded photos ka metadata yahan store hota hai.
-- ACTUAL IMAGE → Cloudinary pe store hoti hai
-- DATABASE MEIN → sirf Cloudinary ka URL

CREATE TABLE photos (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  college_id           UUID        NOT NULL REFERENCES colleges (id) ON DELETE CASCADE,
  -- College isolation ke liye — gallery filter yahi check karti hai

  uploader_id          UUID        NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  -- Kisne upload kiya (profiles table se linked)

  event_id             UUID        REFERENCES events (id) ON DELETE SET NULL,
  -- Kaunse event ki photo hai (optional — NULL agar event nahi)

  caption              TEXT        NOT NULL DEFAULT '',
  -- Photo ki description / caption

  hashtags             TEXT[]      NOT NULL DEFAULT '{}',
  -- TEXT[] = array of strings (PostgreSQL feature)
  -- Example: '{"Damru26", "Night", "Music"}'
  -- Directly array store karte hain — search ke liye tags table bhi hai

  cloudinary_public_id TEXT        NOT NULL,
  -- Cloudinary ka unique asset identifier
  -- Delete/transform karne ke liye zaroori
  -- Example: "camplens/iitd/photos/abc123"

  image_url            TEXT        NOT NULL,
  -- Full Cloudinary URL for display
  -- Example: "https://res.cloudinary.com/camplens/image/upload/..."

  thumbnail_url        TEXT,
  -- Smaller version URL (gallery grid ke liye fast loading)

  year                 INT         NOT NULL,
  -- Photo kaunse saal ki hai (event year se usually same)

  is_approved          BOOLEAN     NOT NULL DEFAULT TRUE,
  -- Moderation flag — FALSE = pending review

  uploaded_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_college    ON photos (college_id);
CREATE INDEX idx_photos_uploader   ON photos (uploader_id);
CREATE INDEX idx_photos_event      ON photos (event_id);
CREATE INDEX idx_photos_year       ON photos (year);
CREATE INDEX idx_photos_uploaded   ON photos (uploaded_at DESC);
-- DESC = newest photos pehle (gallery default order)

-- GIN index for hashtags array search
CREATE INDEX idx_photos_hashtags   ON photos USING GIN (hashtags);
-- GIN (Generalized Inverted Index) = arrays aur full-text search ke liye
-- Isse "kaunsi photos mein #Damru26 hai" jaldi dhundh sakenge

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policy: Apne college ki approved photos dekh sako
CREATE POLICY "photos_select" ON photos
  FOR SELECT USING (
    is_approved = TRUE
    AND
    college_id IN (
      SELECT college_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Apne college mein photos upload kar sako
CREATE POLICY "photos_insert" ON photos
  FOR INSERT WITH CHECK (
    uploader_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    AND
    college_id IN (
      SELECT college_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Apni photos delete kar sako
CREATE POLICY "photos_delete" ON photos
  FOR DELETE USING (
    uploader_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- STEP 6: tags table
-- ============================================================
-- Unique hashtags yahan store hote hain.
-- photos.hashtags array se alag kyun?
-- → Search feature ke liye: "Sabse popular tags kaunse hain?"
-- → Usage count track karna

CREATE TABLE tags (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id  UUID        REFERENCES colleges (id) ON DELETE CASCADE,
  -- NULL = global tag, NOT NULL = college-specific tag

  name        TEXT        NOT NULL,
  -- Tag naam (bina # ke)
  -- Example: "Damru26", "Night", "Khatam"

  usage_count INT         NOT NULL DEFAULT 0,
  -- Kitni photos mein use hua — popular tags dikhane ke liye

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (college_id, name)
  -- Ek college mein same naam ka tag sirf ek baar ho sakta hai
);

CREATE INDEX idx_tags_name    ON tags (name);
CREATE INDEX idx_tags_college ON tags (college_id);
CREATE INDEX idx_tags_usage   ON tags (usage_count DESC);
-- DESC = most popular tags pehle

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select" ON tags
  FOR SELECT USING (true);
-- Tags public hain — koi bhi dekh sakta hai


-- ============================================================
-- STEP 7: photo_tags table (Junction Table)
-- ============================================================
-- Photo aur Tag ke beech MANY-TO-MANY relationship.
--
-- WHY JUNCTION TABLE?
-- Ek photo ke multiple tags: Photo A → #Damru26, #Night, #Music
-- Ek tag multiple photos mein: #Damru26 → Photo A, B, C...
-- Yeh many-to-many hai → alag junction table zaroori

CREATE TABLE photo_tags (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id   UUID        NOT NULL REFERENCES photos (id) ON DELETE CASCADE,
  tag_id     UUID        NOT NULL REFERENCES tags (id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (photo_id, tag_id)
  -- Ek photo pe same tag sirf ek baar ho sakta hai
);

CREATE INDEX idx_photo_tags_photo ON photo_tags (photo_id);
CREATE INDEX idx_photo_tags_tag   ON photo_tags (tag_id);

ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photo_tags_select" ON photo_tags
  FOR SELECT USING (true);


-- ============================================================
-- STEP 8: Auto-update updated_at trigger
-- ============================================================
-- Jab bhi koi row update ho, updated_at automatically current
-- time pe set ho jaaye — manually karne ki zaroorat nahi.

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- NEW = updated row ka naya data
  -- updated_at column ko current time se update karo
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles table pe trigger lagao
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Photos table pe trigger lagao
CREATE TRIGGER photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ============================================================
-- STEP 9: Sample Data (Testing ke liye)
-- ============================================================
-- Yeh real colleges ka data hai. Ek baar insert karo.
-- Baad mein admin panel se aur colleges add kar sakte ho.

INSERT INTO colleges (name, short_name, city) VALUES
  ('Rishihood University',                   'RU',   'Sonipat'),
  ('Delhi Technological University',          'DTU',  'Delhi'),
  ('Netaji Subhas University of Technology',  'NSUT', 'Delhi'),
  ('Indraprastha Institute of Information Technology', 'IIIT-D', 'Delhi'),
  ('Jamia Millia Islamia',                   'JMI',  'Delhi');

-- Email domains insert karo (college ID se linked)
INSERT INTO college_email_domains (college_id, domain)
SELECT id, 'rishihood.edu.in'
  FROM colleges WHERE short_name = 'RU';

INSERT INTO college_email_domains (college_id, domain)
SELECT id, 'nst.rishihood.edu.in'
  FROM colleges WHERE short_name = 'RU';

INSERT INTO college_email_domains (college_id, domain)
SELECT id, 'dtu.ac.in'
  FROM colleges WHERE short_name = 'DTU';

INSERT INTO college_email_domains (college_id, domain)
SELECT id, 'nsut.ac.in'
  FROM colleges WHERE short_name = 'NSUT';

INSERT INTO college_email_domains (college_id, domain)
SELECT id, 'iiitd.ac.in'
  FROM colleges WHERE short_name = 'IIIT-D';

INSERT INTO college_email_domains (college_id, domain)
SELECT id, 'jmi.ac.in'
  FROM colleges WHERE short_name = 'JMI';

-- Sample events (Rishihood ke liye)
INSERT INTO events (college_id, name, year, event_date)
SELECT id, 'Damru 2026', 2026, '2026-03-15'
  FROM colleges WHERE short_name = 'RU';

INSERT INTO events (college_id, name, year, event_date)
SELECT id, 'Khatam (Farewell) 2026', 2026, '2026-05-02'
  FROM colleges WHERE short_name = 'RU';

INSERT INTO events (college_id, name, year, event_date)
SELECT id, 'Hack Night 2025', 2025, '2025-10-12'
  FROM colleges WHERE short_name = 'RU';

INSERT INTO events (college_id, name, year, event_date)
SELECT id, 'Sports Day 2025', 2025, '2025-02-10'
  FROM colleges WHERE short_name = 'RU';

INSERT INTO events (college_id, name, year, event_date)
SELECT id, 'Orientation 2025', 2025, '2025-08-01'
  FROM colleges WHERE short_name = 'RU';


-- ============================================================
-- VERIFY: Check karo sab sahi bana ya nahi
-- ============================================================
-- Yeh queries run karo check karne ke liye:

-- SELECT * FROM colleges;
-- SELECT * FROM college_email_domains;
-- SELECT * FROM events;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
