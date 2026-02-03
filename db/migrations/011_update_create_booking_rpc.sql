-- =============================================================================
-- 011: Update create_booking RPC to support topic_id and details
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
