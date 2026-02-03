-- Fix: Allow users to read their own profile
-- This is critical for login flow to check user role
-- Run in Supabase SQL Editor after 013_add_email_to_profiles.sql

-- =============================================================================
-- PROBLEM: Users cannot read their own profile due to restrictive RLS
-- =============================================================================
-- When logging in, the app tries to check the user's role:
--   SELECT role FROM profiles WHERE id = auth.uid()
-- But if there's no policy allowing users to read their own profile,
-- this query returns NULL, breaking role checks and redirects.

-- =============================================================================
-- SOLUTION: Add policy for users to read their own profile
-- =============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id
  );

COMMENT ON POLICY "Users can read own profile" ON profiles IS 
  'Allow users to read their own profile data (needed for login/role checks)';

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================
-- After running this migration, test as a logged-in user:
-- SELECT id, role, full_name, email, avatar_url FROM profiles WHERE id = auth.uid();
-- Should return your own profile data ✅
