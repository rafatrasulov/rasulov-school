-- RASULOV-SCHOOL: Database schema, RLS, and create_booking RPC
-- Run this in Supabase SQL Editor after creating a project.

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
-- TABLES
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
-- INDEXES
-- =============================================================================

CREATE INDEX idx_slots_start_time ON slots(start_time);
CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_slots_start_time_status ON slots(start_time, status);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =============================================================================
-- TRIGGER: profiles.updated_at
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
-- RPC: create_booking (atomic: check slot free, insert booking, update slot)
-- =============================================================================

CREATE OR REPLACE FUNCTION create_booking(
  p_slot_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_age_or_grade TEXT DEFAULT NULL,
  p_goal TEXT DEFAULT '',
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
  -- Lock slot and get status
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
    slot_id, full_name, email, phone, age_or_grade, goal,
    experience_level, preferred_messenger, consent, status
  ) VALUES (
    p_slot_id, p_full_name, p_email, p_phone, p_age_or_grade, p_goal,
    p_experience_level, p_preferred_messenger, p_consent, 'new'
  )
  RETURNING id INTO v_booking_id;

  UPDATE slots SET status = 'booked', updated_at = now() WHERE id = p_slot_id;

  RETURN v_booking_id;
END;
$$;

-- =============================================================================
-- RLS
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read own row only
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Slots: public sees only free slots; teacher sees all (via policy with role check)
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

-- Bookings: anonymous can only insert (create_booking is SECURITY DEFINER and uses service role or anon with policy)
-- For INSERT we allow anon to call RPC; RPC runs as DEFINER. So we need policy for direct INSERT or we only use RPC.
-- Plan: app calls RPC create_booking. RPC is SECURITY DEFINER so it runs with definer rights. We need to grant EXECUTE to anon.
-- So we don't need INSERT policy on bookings for anon if we only use RPC. But RPC runs as definer - who is that? The migration runs as postgres/superuser. So RPC runs as postgres and bypasses RLS. So we're good: anon can EXECUTE create_booking, and the function does INSERT/UPDATE without RLS blocking (definer).
-- Bookings: teacher can SELECT all, UPDATE all. No INSERT for teacher via table (they don't create bookings that way).
CREATE POLICY bookings_select_teacher ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

CREATE POLICY bookings_update_teacher ON bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
  );

-- Allow anon to execute create_booking (required for public form)
GRANT EXECUTE ON FUNCTION create_booking(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, experience_level, preferred_messenger, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION create_booking(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, experience_level, preferred_messenger, BOOLEAN) TO authenticated;

-- =============================================================================
-- FIRST TEACHER (run manually after creating user in Auth)
-- =============================================================================
-- 1. In Supabase Dashboard: Authentication -> Users -> Add user (email + password).
-- 2. Copy the new user's UUID, then run (replace YOUR_TEACHER_UUID):

-- INSERT INTO profiles (id, role) VALUES ('YOUR_TEACHER_UUID', 'teacher')
-- ON CONFLICT (id) DO UPDATE SET role = 'teacher';
