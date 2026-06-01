# Malar Park — Full Dynamic CMS Upgrade

## Important note on your choices

You picked **"Connect my own Supabase" + "Do everything in one pass" + "Keep current hardcoded login"**. Two issues I need to flag before building:

1. **"Connect my own Supabase" requires a step you must do**: Lovable can either spin up a managed backend (Lovable Cloud) automatically, or connect to an existing Supabase project you own. For the latter, you'll need to use the green **Supabase** button in the top-right of the Lovable editor to paste your project URL + anon key. Until that's done, I can't write any database code. **My strong recommendation: let me enable Lovable Cloud instead** — it's the same Supabase under the hood, zero setup, and unblocks me immediately. Tell me which you want.

2. **Hardcoded login + public-write tables is a real security risk.** With a real database, anyone who finds your admin URL can write to your DB because there is no auth user to scope RLS to. I'll proceed as you asked, but I'll lock down admin writes behind a server-side shared secret check in edge functions so the hardcoded password actually protects something. If you change your mind later, swapping to Supabase Auth is ~1 day.

## What gets built

### Phase A — Foundation (must land first)
- Supabase tables + RLS for every CMS entity (see schema below)
- Storage bucket `media` (public read) for hero, rooms, gallery, attractions, reviews
- Edge function `admin-write` that gates all mutations behind the hardcoded admin password (sent as header), then writes with service role
- Migrate `useRooms`, `useUnavailableDates`, room photos, gallery photos from `localStorage` → Supabase (with one-time import for existing data)
- React Query hooks for every entity (`useHero`, `useAmenities`, `useFaqs`, `useReviews`, `useAttractions`, `useOtaLinks`, `useNav`, `useSeo`, `useMedia`)

### Phase B — Public site rewires to dynamic data
- **Hero**: replace static `HeroSection` with a Swiper/Embla carousel driven by `hero_slides`. Each slide: image, overlay title, subtitle, CTA label, CTA href.
- **Amenities**: `AmenitiesSection` reads from `amenities` table (enabled, sorted). Icon picker uses lucide-react names.
- **Rooms**: `rooms` table + `room_amenities` join. Room detail page renders only assigned amenities.
- **FAQs**: `faq_categories` + `faqs` tables. `FAQSection` groups by category. Markdown rendering for answers.
- **Reviews**: `reviews` table. Featured flag drives homepage slot; full list on Reviews page.
- **Attractions**: new `/attractions` route + homepage cards. `attractions` table.
- **OTA links**: `ota_links` table → rendered as logo button row in BookingSection.
- **Nav**: `nav_items` table drives `Navbar` and footer links.
- **SEO**: `seo_pages` table (one row per route key). `react-helmet-async` reads it for title/desc/keywords/canonical/og:*. JSON-LD Hotel schema generated from rooms/reviews/amenities.

### Phase C — Admin Dashboard (new modules)
Existing 20 admin pages stay untouched. New sidebar group "Content" with:
- **Hero Manager** — upload, reorder (drag-drop), enable/disable, edit overlay/CTA
- **Amenities Manager** — CRUD, icon picker, drag-drop sort, enable toggle
- **Room Amenities** — per-room assignment matrix
- **FAQ Manager** — categories + Q/A with Tiptap rich text editor
- **Reviews Manager** — CRUD, star rating, featured toggle, country flag
- **Attractions Manager** — CRUD with image upload + map link
- **OTA Links Manager** — CRUD with logo upload
- **Navigation Manager** — drag-drop nav items, enable/disable
- **SEO Manager** — per-page form (title, desc, keywords, OG image, canonical)
- **Media Library** — grid view of `media` bucket, folder filter, upload/replace/delete

### Phase D — Polish
- WebP conversion + lazy loading on all images
- Sitemap.xml regenerated from dynamic routes
- `Hotel` JSON-LD in index.html updated from rooms/reviews aggregate
- Floating WhatsApp/Call/Book buttons already exist — verify mobile sticky
- Smooth fade/slide animations via existing tailwindcss-animate

### Phase E — Test
- Vitest unit tests for hooks (mock Supabase client)
- Playwright e2e: admin login → create hero slide → see on homepage; create FAQ → see in accordion; create review → see featured

## Database schema (high level)

```text
hero_slides(id, image_url, title, subtitle, cta_label, cta_href, sort, enabled)
amenities(id, icon, title, description, sort, enabled)
rooms(id, slug, name, description, price, sort, enabled)
room_images(id, room_id, url, sort)
room_amenities(room_id, amenity_id)
faq_categories(id, name, sort)
faqs(id, category_id, question, answer_html, sort)
reviews(id, guest_name, country, rating, text, featured, sort)
attractions(id, name, description, distance, image_url, maps_url, sort)
ota_links(id, platform, logo_url, url, sort, enabled)
nav_items(id, label, href, sort, enabled)
seo_pages(page_key PRIMARY, title, description, keywords, og_image, canonical)
media(id, url, folder, name, size, content_type, created_at)
```

All tables: RLS enabled, public `SELECT` where `enabled=true`, no public `INSERT/UPDATE/DELETE`. Writes go through `admin-write` edge function which verifies the admin password header and uses service-role key.

## Realistic expectations

- This is **~3000-5000 lines of code** across ~50 new/edited files
- I will not be able to do a meaningful manual end-to-end test of all 16 modules in one pass — I'll wire Playwright tests for the critical flows and you'll need to spot-check the rest in preview
- I'll commit in logical chunks so if anything regresses you can see what changed where

## What I need from you to start

**Answer this**: enable Lovable Cloud (1-click, recommended), or are you connecting your own existing Supabase via the green button? I'll stop here and wait for your reply before writing any code.
