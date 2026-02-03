-- Force: ensure any user can read their own profile (required for login role check)
-- Run in Supabase SQL Editor. Apply after 014 if login still broken.

-- =============================================================================
-- WHY "No rows" IN SQL EDITOR?
-- =============================================================================
-- In Supabase SQL Editor you run as the database role (e.g. postgres), NOT as
-- a logged-in app user. So auth.uid() is NULL there, and:
--   SELECT * FROM profiles WHERE id = auth.uid();
-- correctly returns 0 rows. This does NOT mean RLS is broken.
-- The real test is: log in via the browser and try student vs admin login.

-- =============================================================================
-- ENSURE SELECT OWN PROFILE POLICY EXISTS
-- =============================================================================
-- Remove any existing policies that might have been named differently,
-- then create one clear policy so authenticated users can read their own row.

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

COMMENT ON POLICY "profiles_select_own" ON profiles IS
  'Authenticated user can read own profile (needed for login role check and avatar)';

-- =============================================================================
-- VERIFICATION (run in SQL Editor - only checks that policy exists)
-- =============================================================================
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' AND cmd = 'SELECT';
-- You should see: profiles_select_own, Teachers can read student profiles, Public can read teacher profile for landing
