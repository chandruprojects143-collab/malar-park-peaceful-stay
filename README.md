# Malar Park Hotel — Website & Owner Dashboard

A React + Vite + TypeScript app for the Malar Park hotel, with a public marketing site and an Owner/Staff dashboard backed by Supabase (Postgres + Auth + Storage).

## Tech stack

- **Frontend:** React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Row-Level Security, Auth, Storage, Edge Functions)
- **State / data:** TanStack Query
- **Routing:** React Router v6
- **Tests:** Vitest + Testing Library, Playwright

## Local development

```bash
bun install
cp .env.example .env   # then fill in your Supabase project values
bun run dev
```

Open http://localhost:8080.

### Required environment variables

See `.env.example`. All are public (safe to ship to the browser).

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `VITE_SUPABASE_PROJECT_ID` | Project ref (used by some helpers) |

Secret credentials (service role, OAuth secrets, etc.) live only in the Supabase project — never in `.env`.

## Owner dashboard

Visit `/admin/login`:

- **Sign in / sign up** with email + password, or **Continue with Google**.
- New accounts have **no role** until granted one by an existing Owner.
- Roles: `owner` (full access), `admin` (full access), `staff` (limited).
- Roles are stored in `public.user_roles` and enforced by RLS policies on every CMS table.

### Granting the first Owner

Right after deploying, sign up once via the UI, then in your Supabase project run:

```sql
insert into public.user_roles (user_id, role)
values ('<your-auth-uid>', 'owner');
```

Find your UID under Auth → Users.

## Database

Schema lives under `supabase/migrations/`. To apply locally with the Supabase CLI:

```bash
supabase db push
```

Tables: `hero_slides`, `amenities`, `rooms`, `room_images`, `room_amenities`, `faq_categories`, `faqs`, `reviews`, `attractions`, `ota_links`, `nav_items`, `seo_pages`, `media`, `profiles`, `user_roles`.

All CMS tables have:

- Public `SELECT` policy on enabled rows
- Owner-only `INSERT/UPDATE/DELETE` via `has_role(auth.uid(), 'owner')`

## Storage

Bucket: `media` (public read). Owner role required for upload/update/delete via storage RLS.

## Testing

```bash
bun run test           # unit (Vitest)
bun run scripts/seo-diagnostics.ts
```

## Deployment

This is a standard Vite app. Build with:

```bash
bun run build
```

Then host the `dist/` output anywhere (Vercel, Netlify, Cloudflare Pages, your own server). Point the host's environment variables at your Supabase project.

## License

Proprietary — Malar Park.
