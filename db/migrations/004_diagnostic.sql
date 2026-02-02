-- Diagnostic topics, questions, submissions.
-- Run in Supabase SQL Editor after 003_sections_topics_lessons_assignments.sql.

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS diagnostic_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  "order" INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_topic_id UUID NOT NULL REFERENCES diagnostic_topics(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  answer_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diagnostic_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_topic_id UUID REFERENCES diagnostic_topics(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'topic',
  answers JSONB,
  free_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_diagnostic_questions_topic_id ON diagnostic_questions(diagnostic_topic_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_submissions_topic_id ON diagnostic_submissions(diagnostic_topic_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_submissions_created_at ON diagnostic_submissions(created_at DESC);

-- =============================================================================
-- TRIGGERS updated_at
-- =============================================================================

CREATE TRIGGER diagnostic_topics_updated_at
  BEFORE UPDATE ON diagnostic_topics FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER diagnostic_questions_updated_at
  BEFORE UPDATE ON diagnostic_questions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER diagnostic_submissions_updated_at
  BEFORE UPDATE ON diagnostic_submissions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================

ALTER TABLE diagnostic_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_submissions ENABLE ROW LEVEL SECURITY;

-- Public: read published diagnostic topics and their questions
DROP POLICY IF EXISTS diagnostic_topics_select_published ON diagnostic_topics;
CREATE POLICY diagnostic_topics_select_published ON diagnostic_topics FOR SELECT USING (published = true);
DROP POLICY IF EXISTS diagnostic_questions_select_published ON diagnostic_questions;
CREATE POLICY diagnostic_questions_select_published ON diagnostic_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM diagnostic_topics t WHERE t.id = diagnostic_topic_id AND t.published = true)
);

-- Anyone (anon or authenticated) can insert diagnostic_submissions
DROP POLICY IF EXISTS diagnostic_submissions_insert ON diagnostic_submissions;
CREATE POLICY diagnostic_submissions_insert ON diagnostic_submissions FOR INSERT WITH CHECK (true);

-- Teacher: full access to diagnostic_topics, diagnostic_questions; read all diagnostic_submissions
DROP POLICY IF EXISTS diagnostic_topics_all_teacher ON diagnostic_topics;
CREATE POLICY diagnostic_topics_all_teacher ON diagnostic_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);
DROP POLICY IF EXISTS diagnostic_questions_all_teacher ON diagnostic_questions;
CREATE POLICY diagnostic_questions_all_teacher ON diagnostic_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);
DROP POLICY IF EXISTS diagnostic_submissions_select_teacher ON diagnostic_submissions;
CREATE POLICY diagnostic_submissions_select_teacher ON diagnostic_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);
