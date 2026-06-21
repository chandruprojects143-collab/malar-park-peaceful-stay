-- Allow anon to upload room photos to media bucket under rooms/ prefix.
-- The admin UI is password-protected at the app level; this scoped policy
-- avoids needing the service-role edge function just for image uploads.
CREATE POLICY "anon_rooms_insert"
  ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'media' AND name LIKE 'rooms/%');

-- Restore public read on the media bucket (was dropped in a prior migration).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'media_public_select'
  ) THEN
    EXECUTE 'CREATE POLICY "media_public_select"
      ON storage.objects FOR SELECT TO anon
      USING (bucket_id = ''media'')';
  END IF;
END $$;
