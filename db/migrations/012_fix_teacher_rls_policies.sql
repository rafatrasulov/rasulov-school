-- Fix RLS policies for teachers to access student data
-- Run in Supabase SQL Editor after 011_update_create_booking_rpc.sql

-- =============================================================================
-- PROBLEM 1: Teachers cannot read student profiles
-- =============================================================================
-- Without this policy, the admin students list will be empty even if students
-- exist in the database, because RLS blocks the SELECT query.

DROP POLICY IF EXISTS "Teachers can read student profiles" ON profiles;
CREATE POLICY "Teachers can read student profiles" ON profiles
  FOR SELECT USING (
    role = 'student' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'teacher'
    )
  );

COMMENT ON POLICY "Teachers can read student profiles" ON profiles IS 
  'Teachers can view all student profiles in admin panel';

-- =============================================================================
-- PROBLEM 2: Teachers cannot update (grade) student assignment submissions
-- =============================================================================
-- Without this policy, teachers can see student answers but cannot save scores
-- or feedback, because only the student can UPDATE their own submission.

DROP POLICY IF EXISTS "Teachers can update student submissions" ON assignment_submissions;
CREATE POLICY "Teachers can update student submissions" ON assignment_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  );

COMMENT ON POLICY "Teachers can update student submissions" ON assignment_submissions IS 
  'Teachers can update scores and feedback for student assignment submissions';

-- =============================================================================
-- VERIFICATION QUERIES (run to verify policies work)
-- =============================================================================
-- After applying this migration, you can verify with these queries as a teacher:

-- 1. Check if you can see students:
-- SELECT id, full_name, email, grade FROM profiles WHERE role = 'student';

-- 2. Check if you can see student submissions:
-- SELECT * FROM assignment_submissions LIMIT 5;

-- 3. Check if you can update a submission (replace <submission_id> with real ID):
-- UPDATE assignment_submissions SET score = 100 WHERE id = '<submission_id>';
