import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCmsMutation } from "@/hooks/useCms";
import { Pencil, Trash2, Plus, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "image";
export interface Field { key: string; label: string; type: FieldType; placeholder?: string; }

interface Props {
  table: string;
  title: string;
  fields: Field[];
  defaults?: Record<string, any>;
  rowTitle?: (row: any) => string;
  rowSubtitle?: (row: any) => string;
  rowImage?: (row: any) => string | undefined;
}

export default function GenericCmsManager({ table, title, fields, defaults = {}, rowTitle, rowSubtitle, rowImage }: Props) {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery<any[]>({
    queryKey: [table, "admin"],
    queryFn: async () => {
      const { data, error } = await (supabase.from(table as any) as any).select("*").order("sort", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const mut = useCmsMutation(table);
  const [editing, setEditing] = useState<any | null>(null);

  const startNew = () => setEditing({ enabled: true, sort: (rows.length || 0) * 10, ...defaults });
  const save = async () => {
    try {
      const v = { ...editing };
      delete v.created_at; delete v.updated_at;
      if (v.id) {
        const { id, ...rest } = v;
        await mut.mutateAsync({ op: "update", values: rest, match: { id } });
      } else {
        await mut.mutateAsync({ op: "insert", values: v });
      }
      qc.invalidateQueries({ queryKey: [table] });
      setEditing(null);
      toast.success("Saved");
    } catch (e: any) { toast.error(e.message); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try { await mut.mutateAsync({ op: "delete", match: { id } }); qc.invalidateQueries({ queryKey: [table] }); toast.success("Deleted"); }
    catch (e: any) { toast.error(e.message); }
  };
  const move = async (row: any, dir: -1 | 1) => {
    const sorted = [...rows].sort((a: any, b: any) => a.sort - b.sort);
    const idx = sorted.findIndex((r: any) => r.id === row.id);
    const other = sorted[idx + dir];
    if (!other) return;
    await mut.mutateAsync({ op: "update", values: { sort: other.sort }, match: { id: row.id } });
    await mut.mutateAsync({ op: "update", values: { sort: row.sort }, match: { id: other.id } });
    qc.invalidateQueries({ queryKey: [table] });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading text-primary">{title}</h1>
        <Button onClick={startNew} className="gap-2"><Plus className="w-4 h-4" /> Add</Button>
      </div>

      {editing && (
        <Card>
          <CardHeader><CardTitle>{editing.id ? "Edit" : "New"} entry</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {fields.map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea value={editing[f.key] ?? ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} placeholder={f.placeholder} />
                ) : f.type === "boolean" ? (
                  <div className="pt-2"><Switch checked={!!editing[f.key]} onCheckedChange={v => setEditing({ ...editing, [f.key]: v })} /></div>
                ) : f.type === "number" ? (
                  <Input type="number" value={editing[f.key] ?? 0} onChange={e => setEditing({ ...editing, [f.key]: Number(e.target.value) })} />
                ) : (
                  <Input value={editing[f.key] ?? ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} placeholder={f.placeholder} />
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={save} className="gap-2" disabled={mut.isPending}><Save className="w-4 h-4" /> Save</Button>
              <Button variant="ghost" onClick={() => setEditing(null)} className="gap-2"><X className="w-4 h-4" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && rows.length === 0 && <p className="text-muted-foreground text-sm">No entries yet. Click Add to create one.</p>}
        {rows.map((row: any) => (
          <Card key={row.id}>
            <CardContent className="py-3 flex items-center gap-3">
              {rowImage?.(row) && <img src={rowImage(row)} alt="" className="w-16 h-16 object-cover rounded" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{rowTitle ? rowTitle(row) : row.title ?? row.name ?? row.label ?? row.question ?? row.guest_name ?? row.id}</p>
                {rowSubtitle && <p className="text-xs text-muted-foreground truncate">{rowSubtitle(row)}</p>}
                {"enabled" in row && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${row.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {row.enabled ? "Enabled" : "Disabled"}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(row, -1)}><ArrowUp className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => move(row, 1)}><ArrowDown className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => setEditing(row)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(row.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
