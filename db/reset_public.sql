-- RASULOV-SCHOOL: Reset public schema (drop all app tables, functions, types).
-- Run in Supabase SQL Editor when you want to wipe the DB and re-run db/full_schema.sql.
-- Auth users are NOT deleted; after reset, create first teacher in Auth and profiles again.

-- =============================================================================
-- 1. Drop triggers on auth.users
-- =============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

-- =============================================================================
-- 2. Drop tables (order: dependents first, then base)
-- =============================================================================

DROP TABLE IF EXISTS landing_blocks CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS diagnostic_submissions CASCADE;
DROP TABLE IF EXISTS diagnostic_questions CASCADE;
DROP TABLE IF EXISTS diagnostic_topics CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================================================
-- 3. Drop functions
-- =============================================================================

DROP FUNCTION IF EXISTS create_booking(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, experience_level, preferred_messenger, BOOLEAN);
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_email_update() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- =============================================================================
-- 4. Drop types (enums)
-- =============================================================================

DROP TYPE IF EXISTS assignment_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS slot_type CASCADE;
DROP TYPE IF EXISTS slot_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS experience_level CASCADE;
DROP TYPE IF EXISTS preferred_messenger CASCADE;

-- =============================================================================
-- Next step: run db/full_schema.sql in SQL Editor, then create Storage buckets
-- (avatars, assignment-images) and first teacher in Authentication + profiles.
-- =============================================================================
