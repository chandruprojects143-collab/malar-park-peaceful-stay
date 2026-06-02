
-- ============ TIMESTAMP HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ HERO SLIDES ============
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  cta_label TEXT,
  cta_href TEXT,
  sort INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_slides TO anon, authenticated;
GRANT ALL ON public.hero_slides TO service_role;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled hero" ON public.hero_slides FOR SELECT USING (enabled = true);
CREATE TRIGGER trg_hero_slides_updated BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AMENITIES ============
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL DEFAULT 'Star',
  title TEXT NOT NULL,
  description TEXT,
  sort INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.amenities TO anon, authenticated;
GRANT ALL ON public.amenities TO service_role;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled amenities" ON public.amenities FOR SELECT USING (enabled = true);
CREATE TRIGGER trg_amenities_updated BEFORE UPDATE ON public.amenities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ROOMS ============
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  sort INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled rooms" ON public.rooms FOR SELECT USING (enabled = true);
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ROOM IMAGES ============
CREATE TABLE public.room_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.room_images TO anon, authenticated;
GRANT ALL ON public.room_images TO service_role;
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read room images" ON public.room_images FOR SELECT USING (true);
CREATE INDEX idx_room_images_room ON public.room_images(room_id);

-- ============ ROOM AMENITIES (join) ============
CREATE TABLE public.room_amenities (
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, amenity_id)
);
GRANT SELECT ON public.room_amenities TO anon, authenticated;
GRANT ALL ON public.room_amenities TO service_role;
ALTER TABLE public.room_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read room amenities" ON public.room_amenities FOR SELECT USING (true);

-- ============ FAQ CATEGORIES ============
CREATE TABLE public.faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq_categories TO anon, authenticated;
GRANT ALL ON public.faq_categories TO service_role;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faq cats" ON public.faq_categories FOR SELECT USING (true);

-- ============ FAQS ============
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.faq_categories(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer_html TEXT NOT NULL DEFAULT '',
  sort INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled faqs" ON public.faqs FOR SELECT USING (enabled = true);
CREATE TRIGGER trg_faqs_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  country TEXT,
  rating INT NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled reviews" ON public.reviews FOR SELECT USING (enabled = true);
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ATTRACTIONS ============
CREATE TABLE public.attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  distance TEXT,
  image_url TEXT,
  maps_url TEXT,
  sort INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.attractions TO anon, authenticated;
GRANT ALL ON public.attractions TO service_role;
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled attractions" ON public.attractions FOR SELECT USING (enabled = true);
CREATE TRIGGER trg_attractions_updated BEFORE UPDATE ON public.attractions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ OTA LINKS ============
CREATE TABLE public.ota_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  logo_url TEXT,
  url TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ota_links TO anon, authenticated;
GRANT ALL ON public.ota_links TO service_role;
ALTER TABLE public.ota_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled ota" ON public.ota_links FOR SELECT USING (enabled = true);
CREATE TRIGGER trg_ota_updated BEFORE UPDATE ON public.ota_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NAV ITEMS ============
CREATE TABLE public.nav_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nav_items TO anon, authenticated;
GRANT ALL ON public.nav_items TO service_role;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read enabled nav" ON public.nav_items FOR SELECT USING (enabled = true);
CREATE TRIGGER trg_nav_updated BEFORE UPDATE ON public.nav_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEO PAGES ============
CREATE TABLE public.seo_pages (
  page_key TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  canonical TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo_pages TO anon, authenticated;
GRANT ALL ON public.seo_pages TO service_role;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read seo" ON public.seo_pages FOR SELECT USING (true);
CREATE TRIGGER trg_seo_updated BEFORE UPDATE ON public.seo_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MEDIA LIBRARY INDEX ============
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'misc',
  name TEXT NOT NULL,
  size BIGINT,
  content_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media TO anon, authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read media" ON public.media FOR SELECT USING (true);
CREATE INDEX idx_media_folder ON public.media(folder);

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read media bucket" ON storage.objects FOR SELECT USING (bucket_id = 'media');
-- Writes to the bucket happen server-side via service-role in the admin-write function.
