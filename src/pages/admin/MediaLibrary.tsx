import { useState } from "react";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";
import { useMedia, useCmsMutation, uploadMedia } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FOLDERS = ["hero", "rooms", "gallery", "attractions", "reviews", "ota", "misc"];

export default function MediaLibrary() {
  const { data: media = [], refetch } = useMedia();
  const mut = useCmsMutation("media");
  const [folder, setFolder] = useState("misc");
  const [filter, setFilter] = useState<string | "all">("all");
  const [busy, setBusy] = useState(false);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) await uploadMedia(f, folder);
      toast.success(`Uploaded ${files.length} file(s)`);
      refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const remove = async (row: any) => {
    if (!confirm("Delete this file?")) return;
    try {
      await supabase.storage.from("media").remove([row.path]);
      await mut.mutateAsync({ op: "delete", match: { id: row.id } });
      refetch();
    } catch (e: any) { toast.error(e.message); }
  };

  const shown = media.filter((m: any) => filter === "all" || m.folder === filter);

  return (
    <AdminPasswordGate>
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-heading text-primary">Media Library</h1>

        <Card>
          <CardContent className="py-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Upload to folder</label>
              <select value={folder} onChange={e => setFolder(e.target.value)} className="border rounded px-2 py-1.5 bg-background">
                {FOLDERS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium block mb-1">Files</label>
              <Input type="file" multiple accept="image/*" onChange={e => onUpload(e.target.files)} disabled={busy} />
            </div>
            <Button disabled className="gap-2"><Upload className="w-4 h-4" /> {busy ? "Uploading…" : "Drop files above"}</Button>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          {FOLDERS.map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f}</Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {shown.map((m: any) => (
            <Card key={m.id} className="overflow-hidden group">
              <div className="aspect-square bg-muted">
                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-2 text-xs">
                <p className="truncate" title={m.name}>{m.name}</p>
                <p className="text-muted-foreground">{m.folder}</p>
                <div className="flex gap-1 mt-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(m.url); toast.success("URL copied"); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(m)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {shown.length === 0 && <p className="text-muted-foreground col-span-full text-sm">No files in this folder yet.</p>}
        </div>
      </div>
    </AdminPasswordGate>
  );
}
