-- Landing blocks: editable order, visibility, and props (texts) for the main page.
-- Only teachers can read/update; "first teacher" check is in the app.
-- Run after 006_storage_avatars_rls.sql.

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

-- Public read for rendering the main page (anon + authenticated)
DROP POLICY IF EXISTS landing_blocks_public_select ON landing_blocks;
CREATE POLICY landing_blocks_public_select ON landing_blocks
  FOR SELECT USING (visible = true);

-- Seed: one row per block type with current default props (idempotent)
INSERT INTO landing_blocks (type, "order", visible, props) VALUES
  ('hero', 1, true, '{"title":"RasulovSchool","subtitle":"Репетитор по математике. 5–11 классы — от основ до ОГЭ и ЕГЭ.","cta_text":"Записаться на урок"}'::jsonb),
  ('about_teacher', 2, true, '{"title":"Об учителе"}'::jsonb),
  ('benefits', 3, true, '{"title":"Почему стоит заниматься","description":"Системные занятия с репетитором дают результат быстрее.","items":[{"title":"Индивидуальный план","description":"Программа под ваши цели: школа, ОГЭ, ЕГЭ или олимпиады."},{"title":"Понятные объяснения","description":"Сложные темы — простым языком, с примерами и формулами."},{"title":"Один на один","description":"Полное внимание ученику, без отвлечений и спешки."},{"title":"Онлайн-формат","description":"Удобное время и место: занимайтесь из дома в комфорте."}]}'::jsonb),
  ('stepper', 4, true, '{"title":"Как проходит урок","description":"Четыре простых шага.","steps":[{"title":"Выберите время","description":"Свободные слоты в календаре — нажмите «Записаться»."},{"title":"Заполните анкету","description":"Имя, контакты и цель занятий."},{"title":"Подтверждение","description":"Свяжусь в мессенджере и подтвержу запись."},{"title":"Урок онлайн","description":"Zoom или другой формат. Длительность — по слоту."}]}'::jsonb),
  ('calendar', 5, true, '{"title":"Свободные слоты","description":"Выберите удобное время и нажмите «Записаться»."}'::jsonb),
  ('faq', 6, true, '{"title":"Частые вопросы","description":"Ответы на типичные вопросы об уроках и записи.","items":[{"q":"Как проходит первый урок?","a":"Первый урок — знакомство и диагностика: обсудим цели, текущий уровень и формат занятий. Длительность как у выбранного слота (обычно 60 минут)."},{"q":"Нужна ли камера и микрофон?","a":"Да. Урок идёт в формате видеозвонка (Zoom или аналог). Нужны стабильный интернет, камера и микрофон."},{"q":"Как оплачивать занятия?","a":"После подтверждения записи обсудим удобный способ оплаты (банковский перевод, СБП и т.д.). Оплата — по договорённости до или после урока."},{"q":"Можно ли перенести или отменить урок?","a":"Да. Предупредите заранее (лучше за сутки), и мы перенесём занятие на другой слот."}]}'::jsonb)
ON CONFLICT (type) DO NOTHING;
