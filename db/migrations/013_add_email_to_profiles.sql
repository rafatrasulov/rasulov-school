-- Add email column to profiles and sync with auth.users
-- Run in Supabase SQL Editor after 012_fix_teacher_rls_policies.sql

-- =============================================================================
-- PROBLEM: Email stored in auth.users, but code tries to read it from profiles
-- =============================================================================
-- The admin panel code queries profiles.email, but this column doesn't exist.
-- Email is stored in auth.users, which cannot be directly queried from client.
-- Solution: Add email column to profiles and keep it synced with auth.users.

-- =============================================================================
-- STEP 1: Add email column to profiles
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON COLUMN profiles.email IS 'User email (synced from auth.users)';

-- =============================================================================
-- STEP 2: Backfill email for existing users from auth.users
-- =============================================================================
-- This copies email from auth.users to profiles for all existing users

UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
  AND profiles.email IS NULL;

-- =============================================================================
-- STEP 3: Update handle_new_user trigger to copy email on user creation
-- =============================================================================
-- This ensures new users get their email copied to profiles automatically

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email)
  VALUES (NEW.id, 'student', NEW.email)
  ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Auto-create profile with email when user signs up';

-- =============================================================================
-- STEP 4: Add trigger to keep email in sync when changed in auth.users
-- =============================================================================
-- If user changes email in auth, update it in profiles too

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update email in profiles when it changes in auth.users
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.handle_user_email_update();

COMMENT ON FUNCTION public.handle_user_email_update() IS 
  'Sync email to profiles when user updates email in auth';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- After running this migration, verify:

-- 1. Check that email column exists and is populated:
-- SELECT id, full_name, email, role FROM profiles WHERE email IS NOT NULL LIMIT 5;

-- 2. Check students have emails:
-- SELECT id, full_name, email, grade FROM profiles WHERE role = 'student';

-- 3. Test that new users get email (create test user in Supabase Auth UI, then check):
-- SELECT * FROM profiles WHERE email = 'test@example.com';
