import { useState } from "react";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";
import { useSeoPages, useCmsMutation } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";

const KNOWN_KEYS = ["home", "rooms", "attractions", "gallery"];

export default function SeoManager() {
  const { data: pages = [] } = useSeoPages();
  const mut = useCmsMutation("seo_pages");
  const [draft, setDraft] = useState<any>({ page_key: "" });

  const upsert = async (row: any) => {
    try {
      await mut.mutateAsync({ op: "upsert", values: row, onConflict: "page_key" });
      toast.success("Saved");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminPasswordGate>
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-heading text-primary">SEO Per Page</h1>

        <Card>
          <CardHeader><CardTitle className="text-base">Add / overwrite a page</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Label>Page key</Label>
            <div className="flex gap-2 flex-wrap">
              {KNOWN_KEYS.map(k => (
                <Button key={k} size="sm" variant={draft.page_key === k ? "default" : "outline"} onClick={() => {
                  const existing = pages.find((p: any) => p.page_key === k);
                  setDraft(existing ?? { page_key: k });
                }}>{k}</Button>
              ))}
              <Input className="w-40" placeholder="custom-key" value={draft.page_key} onChange={e => setDraft({ ...draft, page_key: e.target.value })} />
            </div>
            <Label>Title</Label>
            <Input value={draft.title ?? ""} onChange={e => setDraft({ ...draft, title: e.target.value })} />
            <Label>Description</Label>
            <Textarea value={draft.description ?? ""} onChange={e => setDraft({ ...draft, description: e.target.value })} />
            <Label>Keywords</Label>
            <Input value={draft.keywords ?? ""} onChange={e => setDraft({ ...draft, keywords: e.target.value })} />
            <Label>OG image URL</Label>
            <Input value={draft.og_image ?? ""} onChange={e => setDraft({ ...draft, og_image: e.target.value })} />
            <Label>Canonical URL</Label>
            <Input value={draft.canonical ?? ""} onChange={e => setDraft({ ...draft, canonical: e.target.value })} />
            <Button className="gap-2" onClick={() => upsert(draft)} disabled={!draft.page_key}><Save className="w-4 h-4" /> Save</Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">Saved pages</h2>
          {pages.map((p: any) => (
            <Card key={p.page_key}>
              <CardContent className="py-3 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{p.page_key}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.title}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setDraft(p)}>Edit</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminPasswordGate>
  );
}
