-- Sections, topics, lessons, assignments for student dashboard and teacher admin.
-- Run in Supabase SQL Editor after 002_handle_new_user.sql.

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  "order" INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE assignment_type AS ENUM ('text', 'single_choice', 'multiple_choice', 'fraction', 'file_upload');

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  "type" assignment_type NOT NULL DEFAULT 'text',
  content TEXT,
  image_url TEXT,
  correct_answer TEXT,
  options JSONB,
  "order" INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT,
  answer_json JSONB,
  score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, user_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_topics_section_id ON topics(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_assignments_topic_id ON assignments(topic_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user_id ON assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);

-- =============================================================================
-- TRIGGERS updated_at
-- =============================================================================

CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON sections FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON topics FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Students: read only published sections, topics, lessons, assignments
DROP POLICY IF EXISTS sections_select_published ON sections;
CREATE POLICY sections_select_published ON sections FOR SELECT USING (published = true);
DROP POLICY IF EXISTS topics_select_published ON topics;
CREATE POLICY topics_select_published ON topics FOR SELECT USING (published = true);
DROP POLICY IF EXISTS lessons_select_published ON lessons;
CREATE POLICY lessons_select_published ON lessons FOR SELECT USING (published = true);
DROP POLICY IF EXISTS assignments_select_published ON assignments;
CREATE POLICY assignments_select_published ON assignments FOR SELECT USING (published = true);

-- Teacher: full access
DROP POLICY IF EXISTS sections_all_teacher ON sections;
CREATE POLICY sections_all_teacher ON sections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);
DROP POLICY IF EXISTS topics_all_teacher ON topics;
CREATE POLICY topics_all_teacher ON topics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);
DROP POLICY IF EXISTS lessons_all_teacher ON lessons;
CREATE POLICY lessons_all_teacher ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);
DROP POLICY IF EXISTS assignments_all_teacher ON assignments;
CREATE POLICY assignments_all_teacher ON assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);

-- assignment_submissions: student can insert/update own; teacher can read all
DROP POLICY IF EXISTS assignment_submissions_select_own ON assignment_submissions;
CREATE POLICY assignment_submissions_select_own ON assignment_submissions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS assignment_submissions_insert_own ON assignment_submissions;
CREATE POLICY assignment_submissions_insert_own ON assignment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS assignment_submissions_update_own ON assignment_submissions;
CREATE POLICY assignment_submissions_update_own ON assignment_submissions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS assignment_submissions_select_teacher ON assignment_submissions;
CREATE POLICY assignment_submissions_select_teacher ON assignment_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);
