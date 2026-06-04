import { supabase } from "@/integrations/supabase/client";

// Legacy helpers kept as no-ops for backwards compatibility.
// Authentication is now handled by Supabase Auth + RLS — no shared password.
export function setAdminWritePassword(_pw: string) {}
export function getAdminWritePassword(): string | null { return "authenticated"; }
export function clearAdminWritePassword() {}

type Op = "insert" | "update" | "upsert" | "delete";
interface WriteArgs {
  table: string;
  op: Op;
  values?: any;
  match?: Record<string, any>;
  onConflict?: string;
}

/**
 * Writes to CMS tables via the standard Supabase client.
 * RLS policies enforce that only signed-in users with the `owner` role may write.
 */
export async function adminWrite({ table, op, values, match, onConflict }: WriteArgs) {
  const q: any = (supabase.from(table as any) as any);
  let res;
  if (op === "insert") res = await q.insert(values).select();
  else if (op === "upsert") res = await q.upsert(values, onConflict ? { onConflict } : undefined).select();
  else if (op === "update") {
    let upd = q.update(values);
    for (const [k, v] of Object.entries(match ?? {})) upd = upd.eq(k, v);
    res = await upd.select();
  } else if (op === "delete") {
    let del = q.delete();
    for (const [k, v] of Object.entries(match ?? {})) del = del.eq(k, v);
    res = await del.select();
  } else {
    throw new Error("Bad op");
  }
  if (res.error) throw new Error(res.error.message);
  return res.data;
}
