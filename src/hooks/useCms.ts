import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminWrite } from "@/lib/adminWrite";

const list = <T,>(table: string, opts: { onlyEnabled?: boolean; orderBy?: string } = {}) =>
  useQuery<T[]>({
    queryKey: [table, opts],
    queryFn: async () => {
      let q: any = (supabase.from(table as any) as any).select("*");
      if (opts.orderBy) q = q.order(opts.orderBy, { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });


export const useHeroSlides = () => list<any>("hero_slides", { orderBy: "sort" });
export const useAmenitiesDb = () => list<any>("amenities", { orderBy: "sort" });
export const useRoomsDb = () => list<any>("rooms", { orderBy: "sort" });
export const useRoomImages = () => list<any>("room_images", { orderBy: "sort" });
export const useFaqCategories = () => list<any>("faq_categories", { orderBy: "sort" });
export const useFaqsDb = () => list<any>("faqs", { orderBy: "sort" });
export const useReviewsDb = () => list<any>("reviews", { orderBy: "sort" });
export const useAttractions = () => list<any>("attractions", { orderBy: "sort" });
export const useOtaLinks = () => list<any>("ota_links", { orderBy: "sort" });
export const useNavItems = () => list<any>("nav_items", { orderBy: "sort" });
export const useSeoPages = () => list<any>("seo_pages");
export const useMedia = () => list<any>("media", { orderBy: "created_at" });

export function useCmsMutation(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { op: "insert" | "update" | "upsert" | "delete"; values?: any; match?: Record<string, any>; onConflict?: string }) => {
      return adminWrite({ table, ...args });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export async function uploadMedia(file: File, folder = "misc") {
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: upErr } = await supabase.storage.from("media").upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
  const url = pub.publicUrl;
  await adminWrite({
    table: "media",
    op: "insert",
    values: { url, path, folder, name: file.name, size: file.size, content_type: file.type },
  });
  return { url, path };
}
