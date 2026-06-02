// Admin write gateway. Authenticated by a shared admin password header.
// All CMS table writes flow through here using the service role key,
// so the public anon key never has any INSERT/UPDATE/DELETE rights.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Op = "insert" | "update" | "upsert" | "delete";
const ALLOWED_TABLES = new Set([
  "hero_slides", "amenities", "rooms", "room_images", "room_amenities",
  "faq_categories", "faqs", "reviews", "attractions",
  "ota_links", "nav_items", "seo_pages", "media",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const adminPw = req.headers.get("x-admin-password");
    const expected = Deno.env.get("ADMIN_WRITE_PASSWORD");
    if (!expected || adminPw !== expected) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => null) as
      | { table: string; op: Op; values?: any; match?: Record<string, any>; onConflict?: string }
      | null;
    if (!body || !body.table || !body.op) return json({ error: "Bad request" }, 400);
    if (!ALLOWED_TABLES.has(body.table)) return json({ error: "Table not allowed" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const q = supabase.from(body.table);
    let res;
    if (body.op === "insert") res = await q.insert(body.values).select();
    else if (body.op === "upsert") res = await q.upsert(body.values, body.onConflict ? { onConflict: body.onConflict } : undefined).select();
    else if (body.op === "update") {
      let upd = q.update(body.values);
      for (const [k, v] of Object.entries(body.match ?? {})) upd = upd.eq(k, v);
      res = await upd.select();
    } else if (body.op === "delete") {
      let del = q.delete();
      for (const [k, v] of Object.entries(body.match ?? {})) del = del.eq(k, v);
      res = await del.select();
    } else return json({ error: "Bad op" }, 400);

    if (res.error) return json({ error: res.error.message }, 400);
    return json({ data: res.data });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
