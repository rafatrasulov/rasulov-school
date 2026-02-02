-- Profiles: avatar, full_name, experience, bio, grade (5-11).
-- Sections: grade (5-11) for class-based content.
-- Run after 004_diagnostic.sql.
--
-- Storage (Supabase Dashboard → Storage): create bucket "avatars", set Public.
-- RLS for avatars: allow authenticated users to upload/update/delete in path = auth.uid()::text
--   (Policy: INSERT/UPDATE/DELETE WITH (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
--   or allow all authenticated to upload to avatars for simplicity.)

-- =============================================================================
-- PROFILES: new columns
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS grade INT CHECK (grade IS NULL OR (grade >= 5 AND grade <= 11));

COMMENT ON COLUMN profiles.avatar_url IS 'Public URL of avatar image (e.g. from Storage avatars bucket)';
COMMENT ON COLUMN profiles.full_name IS 'Display name: for teacher = ФИО, for student = name';
COMMENT ON COLUMN profiles.experience IS 'Teacher: years/description of experience';
COMMENT ON COLUMN profiles.bio IS 'Teacher: short bio for main page';
COMMENT ON COLUMN profiles.grade IS 'Student: class 5-11; used to filter sections by grade';

-- =============================================================================
-- SECTIONS: grade (5-11)
-- =============================================================================

ALTER TABLE sections
  ADD COLUMN IF NOT EXISTS grade INT CHECK (grade IS NULL OR (grade >= 5 AND grade <= 11));

COMMENT ON COLUMN sections.grade IS 'Target class 5-11; NULL = all grades';

-- =============================================================================
-- RLS: profiles — public read of teacher profiles for main page
-- (Update own profile already in 002 as profiles_update_own.)
-- =============================================================================

DROP POLICY IF EXISTS "Public can read teacher profile for landing" ON profiles;
CREATE POLICY "Public can read teacher profile for landing" ON profiles
  FOR SELECT USING (role = 'teacher');
