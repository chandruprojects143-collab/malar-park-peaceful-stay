import { supabase } from "@/integrations/supabase/client";

const ADMIN_PW_KEY = "admin_write_password";

export function setAdminWritePassword(pw: string) {
  sessionStorage.setItem(ADMIN_PW_KEY, pw);
}
export function getAdminWritePassword(): string | null {
  return sessionStorage.getItem(ADMIN_PW_KEY);
}
export function clearAdminWritePassword() {
  sessionStorage.removeItem(ADMIN_PW_KEY);
}

type Op = "insert" | "update" | "upsert" | "delete";
interface WriteArgs {
  table: string;
  op: Op;
  values?: any;
  match?: Record<string, any>;
  onConflict?: string;
}

export async function adminWrite(args: WriteArgs) {
  const pw = getAdminWritePassword();
  if (!pw) throw new Error("Admin write password not set. Open SEO/CMS admin and enter it once.");
  const { data, error } = await supabase.functions.invoke("admin-write", {
    body: args,
    headers: { "x-admin-password": pw },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any)?.data;
}
