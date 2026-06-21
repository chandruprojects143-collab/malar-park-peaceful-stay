-- Allow admin UI (anon key) to fully manage the reviews table.
-- The original migration only granted SELECT (public read) with a policy
-- that filtered to enabled=true only. The admin needs to read ALL rows
-- and perform INSERT / UPDATE / DELETE.

-- 1. Grant write operations to the anon role
GRANT INSERT, UPDATE, DELETE ON public.reviews TO anon;

-- 2. Drop the restrictive read-only policy
DROP POLICY IF EXISTS "public read enabled reviews" ON public.reviews;

-- 3. Replace with a single open policy (access is gated by the app's
--    own admin password check, not at the DB row-level)
CREATE POLICY "reviews_anon_all" ON public.reviews
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);
