-- =============================================================================
-- 009: Add teacher feedback to assignment submissions
-- =============================================================================

ALTER TABLE assignment_submissions 
ADD COLUMN teacher_feedback TEXT;

COMMENT ON COLUMN assignment_submissions.teacher_feedback IS 'Teacher comments and feedback for the student submission';
