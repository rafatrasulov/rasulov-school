-- Storage RLS for bucket "assignment-images": only teachers can upload/update/delete.
-- Run in Supabase SQL Editor after creating the bucket "assignment-images" (Storage → New bucket → name: assignment-images, Public: on).
-- The app uploads to path: assignments/{topicId}/{uuid}.{ext}

-- Allow teachers to INSERT
DROP POLICY IF EXISTS "assignment_images_insert_teacher" ON storage.objects;
CREATE POLICY "assignment_images_insert_teacher"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assignment-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);

-- Allow teachers to UPDATE
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

-- Allow teachers to DELETE
DROP POLICY IF EXISTS "assignment_images_delete_teacher" ON storage.objects;
CREATE POLICY "assignment_images_delete_teacher"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'assignment-images'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'teacher')
);

-- Public read so assignment image URLs work on the site
DROP POLICY IF EXISTS "assignment_images_select_public" ON storage.objects;
CREATE POLICY "assignment_images_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assignment-images');
