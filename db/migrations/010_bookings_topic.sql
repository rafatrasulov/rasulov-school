-- =============================================================================
-- 010: Add topic and details fields to bookings
-- =============================================================================

ALTER TABLE bookings 
ADD COLUMN topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
ADD COLUMN details TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_topic_id ON bookings(topic_id);

COMMENT ON COLUMN bookings.topic_id IS 'Optional reference to course topic for authenticated students';
COMMENT ON COLUMN bookings.details IS 'Specific details or questions about what the student needs help with';
