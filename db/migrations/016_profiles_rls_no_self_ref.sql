-- Fix 500 on profiles: policy "Teachers can read student profiles" referenced
-- profiles inside its own USING, causing recursion/errors in PostgREST.
-- Use a SECURITY DEFINER helper so RLS doesn't re-enter profiles.

-- =============================================================================
-- Helper: is the current user a teacher? (bypasses RLS, no recursion)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

COMMENT ON FUNCTION public.is_teacher() IS
  'Returns true if current user has role teacher. Used in RLS to avoid self-reference on profiles.';

-- =============================================================================
-- Recreate policy using is_teacher() instead of EXISTS (SELECT FROM profiles)
-- =============================================================================

DROP POLICY IF EXISTS "Teachers can read student profiles" ON profiles;
CREATE POLICY "Teachers can read student profiles" ON profiles
  FOR SELECT USING (role = 'student' AND public.is_teacher());
