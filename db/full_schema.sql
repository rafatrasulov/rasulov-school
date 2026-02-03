-- RASULOV-SCHOOL: Full database schema (schema + migrations 002-015 consolidated).
-- Run once in Supabase SQL Editor on a new project, or after db/reset_public.sql.
-- Then: create Storage buckets "avatars" and "assignment-images" (Public), create first teacher in Auth and profiles.

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('teacher', 'student');

CREATE TYPE slot_type AS ENUM ('trial', 'regular');

CREATE TYPE slot_status AS ENUM ('free', 'booked', 'cancelled');

CREATE TYPE booking_status AS ENUM ('new', 'confirmed', 'done', 'cancelled');

CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TYPE preferred_messenger AS ENUM ('telegram', 'whatsapp', 'email');

-- =============================================================================
-- TABLES (base)
-- =============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  type slot_type NOT NULL DEFAULT 'trial',
  status slot_status NOT NULL DEFAULT 'free',
  capacity INT NOT NULL DEFAULT 1 CHECK (capacity >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age_or_grade TEXT,
  goal TEXT NOT NULL,
  experience_level experience_level NOT NULL,
  preferred_messenger preferred_messenger NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT false,
  status booking_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES (base)
-- =============================================================================

CREATE INDEX idx_slots_start_time ON slots(start_time);
CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_slots_start_time_status ON slots(start_time, status);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =============================================================================
-- FUNCTION: set_updated_at (triggers)
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER slots_updated_at
  BEFORE UPDATE ON slots
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =============================================================================
-- 002: handle_new_user (overwritten by 013 with email; trigger on auth.users)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================================
-- RLS (base) + profiles INSERT/UPDATE own
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY slots_select_public ON slots
  FOR SELECT USING (status = 'free');

CREATE POLICY slots_select_teacher ON slots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

CREATE POLICY slots_insert_teacher ON slots
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

CREATE POLICY slots_update_teacher ON slots
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

CREATE POLICY slots_delete_teacher ON slots
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

CREATE POLICY bookings_select_teacher ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

CREATE POLICY bookings_update_teacher ON bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

-- =============================================================================
-- 003: sections, topics, lessons, assignments, assignment_submissions
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

CREATE INDEX IF NOT EXISTS idx_topics_section_id ON topics(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_assignments_topic_id ON assignments(topic_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user_id ON assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);

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

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sections_select_published ON sections;
CREATE POLICY sections_select_published ON sections FOR SELECT USING (published = true);
DROP POLICY IF EXISTS topics_select_published ON topics;
CREATE POLICY topics_select_published ON topics FOR SELECT USING (published = true);
DROP POLICY IF EXISTS lessons_select_published ON lessons;
CREATE POLICY lessons_select_published ON lessons FOR SELECT USING (published = true);
DROP POLICY IF EXISTS assignments_select_published ON assignments;
CREATE POLICY assignments_select_published ON assignments FOR SELECT USING (published = true);

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

-- =============================================================================
-- 004: diagnostic_topics, diagnostic_questions, diagnostic_submissions
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

CREATE INDEX IF NOT EXISTS idx_diagnostic_questions_topic_id ON diagnostic_questions(diagnostic_topic_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_submissions_topic_id ON diagnostic_submissions(diagnostic_topic_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_submissions_created_at ON diagnostic_submissions(created_at DESC);

CREATE TRIGGER diagnostic_topics_updated_at
  BEFORE UPDATE ON diagnostic_topics FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER diagnostic_questions_updated_at
  BEFORE UPDATE ON diagnostic_questions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER diagnostic_submissions_updated_at
  BEFORE UPDATE ON diagnostic_submissions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

ALTER TABLE diagnostic_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS diagnostic_topics_select_published ON diagnostic_topics;
CREATE POLICY diagnostic_topics_select_published ON diagnostic_topics FOR SELECT USING (published = true);
DROP POLICY IF EXISTS diagnostic_questions_select_published ON diagnostic_questions;
CREATE POLICY diagnostic_questions_select_published ON diagnostic_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM diagnostic_topics t WHERE t.id = diagnostic_topic_id AND t.published = true)
);

DROP POLICY IF EXISTS diagnostic_submissions_insert ON diagnostic_submissions;
CREATE POLICY diagnostic_submissions_insert ON diagnostic_submissions FOR INSERT WITH CHECK (true);

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

-- =============================================================================
-- 005: profiles/sections extra columns, Public can read teacher profile
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS grade INT CHECK (grade IS NULL OR (grade >= 5 AND grade <= 11));

ALTER TABLE sections
  ADD COLUMN IF NOT EXISTS grade INT CHECK (grade IS NULL OR (grade >= 5 AND grade <= 11));

DROP POLICY IF EXISTS "Public can read teacher profile for landing" ON profiles;
CREATE POLICY "Public can read teacher profile for landing" ON profiles
  FOR SELECT USING (role = 'teacher');

-- =============================================================================
-- 006: Storage RLS for avatars bucket
-- =============================================================================

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
CREATE POLICY "avatars_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =============================================================================
-- 007: landing_blocks
-- =============================================================================

CREATE TABLE IF NOT EXISTS landing_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE CHECK (type IN ('hero', 'about_teacher', 'benefits', 'stepper', 'calendar', 'faq')),
  "order" INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  props JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_blocks_order ON landing_blocks("order");
CREATE INDEX IF NOT EXISTS idx_landing_blocks_visible ON landing_blocks(visible) WHERE visible = true;

CREATE TRIGGER landing_blocks_updated_at
  BEFORE UPDATE ON landing_blocks
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

ALTER TABLE landing_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS landing_blocks_teachers_select ON landing_blocks;
CREATE POLICY landing_blocks_teachers_select ON landing_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

DROP POLICY IF EXISTS landing_blocks_teachers_update ON landing_blocks;
CREATE POLICY landing_blocks_teachers_update ON landing_blocks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

DROP POLICY IF EXISTS landing_blocks_public_select ON landing_blocks;
CREATE POLICY landing_blocks_public_select ON landing_blocks
  FOR SELECT USING (visible = true);

INSERT INTO landing_blocks (type, "order", visible, props) VALUES
  ('hero', 1, true, '{"title":"RasulovSchool","subtitle":"Репетитор по математике. 5–11 классы — от основ до ОГЭ и ЕГЭ.","cta_text":"Записаться на урок"}'::jsonb),
  ('about_teacher', 2, true, '{"title":"Об учителе"}'::jsonb),
  ('benefits', 3, true, '{"title":"Почему стоит заниматься","description":"Системные занятия с репетитором дают результат быстрее.","items":[{"title":"Индивидуальный план","description":"Программа под ваши цели: школа, ОГЭ, ЕГЭ или олимпиады."},{"title":"Понятные объяснения","description":"Сложные темы — простым языком, с примерами и формулами."},{"title":"Один на один","description":"Полное внимание ученику, без отвлечений и спешки."},{"title":"Онлайн-формат","description":"Удобное время и место: занимайтесь из дома в комфорте."}]}'::jsonb),
  ('stepper', 4, true, '{"title":"Как проходит урок","description":"Четыре простых шага.","steps":[{"title":"Выберите время","description":"Свободные слоты в календаре — нажмите «Записаться»."},{"title":"Заполните анкету","description":"Имя, контакты и цель занятий."},{"title":"Подтверждение","description":"Свяжусь в мессенджере и подтвержу запись."},{"title":"Урок онлайн","description":"Zoom или другой формат. Длительность — по слоту."}]}'::jsonb),
  ('calendar', 5, true, '{"title":"Свободные слоты","description":"Выберите удобное время и нажмите «Записаться»."}'::jsonb),
  ('faq', 6, true, '{"title":"Частые вопросы","description":"Ответы на типичные вопросы об уроках и записи.","items":[{"q":"Как проходит первый урок?","a":"Первый урок — знакомство и диагностика: обсудим цели, текущий уровень и формат занятий. Длительность как у выбранного слота (обычно 60 минут)."},{"q":"Нужна ли камера и микрофон?","a":"Да. Урок идёт в формате видеозвонка (Zoom или аналог). Нужны стабильный интернет, камера и микрофон."},{"q":"Как оплачивать занятия?","a":"После подтверждения записи обсудим удобный способ оплаты (банковский перевод, СБП и т.д.). Оплата — по договорённости до или после урока."},{"q":"Можно ли перенести или отменить урок?","a":"Да. Предупредите заранее (лучше за сутки), и мы перенесём занятие на другой слот."}]}'::jsonb)
ON CONFLICT (type) DO NOTHING;

-- =============================================================================
-- 008: Storage RLS for assignment-images bucket
-- =============================================================================

DROP POLICY IF EXISTS "assignment_images_insert_teacher" ON storage.objects;
CREATE POLICY "assignment_images_insert_teacher"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignment-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);

DROP POLICY IF EXISTS "assignment_images_update_teacher" ON storage.objects;
CREATE POLICY "assignment_images_update_teacher"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assignment-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
)
WITH CHECK (
  bucket_id = 'assignment-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);

DROP POLICY IF EXISTS "assignment_images_delete_teacher" ON storage.objects;
CREATE POLICY "assignment_images_delete_teacher"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'assignment-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);

DROP POLICY IF EXISTS "assignment_images_select_public" ON storage.objects;
CREATE POLICY "assignment_images_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assignment-images');

-- =============================================================================
-- 009: teacher_feedback on assignment_submissions
-- =============================================================================

ALTER TABLE assignment_submissions
  ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;

-- =============================================================================
-- 010: bookings topic_id, details
-- =============================================================================

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS details TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_topic_id ON bookings(topic_id);

-- =============================================================================
-- 011: create_booking RPC (topic_id, details) + GRANT
-- =============================================================================

CREATE OR REPLACE FUNCTION create_booking(
  p_slot_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_age_or_grade TEXT DEFAULT NULL,
  p_goal TEXT DEFAULT NULL,
  p_details TEXT DEFAULT NULL,
  p_topic_id UUID DEFAULT NULL,
  p_experience_level experience_level DEFAULT 'beginner',
  p_preferred_messenger preferred_messenger DEFAULT 'email',
  p_consent BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot_status slot_status;
  v_booking_id UUID;
BEGIN
  SELECT status INTO v_slot_status
  FROM slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'slot_not_found';
  END IF;

  IF v_slot_status != 'free' THEN
    RAISE EXCEPTION 'slot_not_available';
  END IF;

  INSERT INTO bookings (
    slot_id, full_name, email, phone, age_or_grade, goal, details, topic_id,
    experience_level, preferred_messenger, consent, status
  ) VALUES (
    p_slot_id, p_full_name, p_email, p_phone, p_age_or_grade, p_goal, p_details, p_topic_id,
    p_experience_level, p_preferred_messenger, p_consent, 'new'
  )
  RETURNING id INTO v_booking_id;

  UPDATE slots SET status = 'booked', updated_at = now() WHERE id = p_slot_id;

  RETURN v_booking_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_booking(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, experience_level, preferred_messenger, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION create_booking(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, experience_level, preferred_messenger, BOOLEAN) TO authenticated;

-- =============================================================================
-- 016 (before 012): is_teacher() helper to avoid RLS self-reference on profiles
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

-- =============================================================================
-- 012: Teachers can read student profiles, update student submissions
-- =============================================================================

DROP POLICY IF EXISTS "Teachers can read student profiles" ON profiles;
CREATE POLICY "Teachers can read student profiles" ON profiles
  FOR SELECT USING (role = 'student' AND public.is_teacher());

DROP POLICY IF EXISTS "Teachers can update student submissions" ON assignment_submissions;
CREATE POLICY "Teachers can update student submissions" ON assignment_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- =============================================================================
-- 013: email on profiles, handle_new_user with email, handle_user_email_update
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

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

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.handle_user_email_update();

-- Backfill email for existing profiles (no-op on fresh DB)
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
  AND profiles.email IS NULL;

-- =============================================================================
-- 015: profiles_select_own (ensure user can read own profile)
-- =============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- =============================================================================
-- FIRST TEACHER (manual after running this file)
-- =============================================================================
-- 1. Supabase Dashboard: Authentication -> Users -> Add user (email + password).
-- 2. Copy the new user's UUID, then in SQL Editor run (replace YOUR_TEACHER_UUID):
--    INSERT INTO profiles (id, role) VALUES ('YOUR_TEACHER_UUID', 'teacher')
--    ON CONFLICT (id) DO UPDATE SET role = 'teacher';
-- 3. Storage: create buckets "avatars" and "assignment-images" (Public).
