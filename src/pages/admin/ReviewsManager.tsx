import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCmsMutation } from "@/hooks/useCms";
import { AdminPasswordGate } from "@/components/admin/AdminPasswordGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Save, X, Star, Pin, PinOff, Eye, EyeOff } from "lucide-react";

interface Review {
  id: string;
  guest_name: string;
  rating: number;
  text: string;
  country?: string | null;
  featured: boolean;   // used as "pinned"
  enabled: boolean;    // used as "display on website"
  sort: number;
  created_at?: string;
}

type SortMode = "pinned" | "latest" | "highest";

function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (n: number) => void; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" } as const;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={onChange ? "hover:scale-110 transition" : "cursor-default"}
        >
          <Star className={`${sizes[size]} ${n <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`} />
        </button>
      ))}
    </div>
  );
}

function Manager() {
  const qc = useQueryClient();
  const mut = useCmsMutation("reviews");
  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("pinned");

  const { data: rows = [], isLoading } = useQuery<Review[]>({
    queryKey: ["reviews", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

  const sorted = useMemo(() => {
    const list = [...rows];
    if (sortMode === "latest") {
      return list.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    }
    if (sortMode === "highest") {
      return list.sort((a, b) => b.rating - a.rating);
    }
    // pinned first, then latest
    return list.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    });
  }, [rows, sortMode]);

  const startNew = () => setEditing({ guest_name: "", rating: 5, text: "", enabled: true, featured: false, sort: rows.length * 10 });

  const save = async () => {
    if (!editing) return;
    const name = editing.guest_name?.trim();
    const text = editing.text?.trim();
    const rating = Number(editing.rating ?? 0);
    if (!name) return toast.error("Guest name is required");
    if (!text) return toast.error("Review message is required");
    if (rating < 1 || rating > 5) return toast.error("Rating must be 1-5");

    try {
      const payload: any = {
        guest_name: name,
        text,
        rating,
        enabled: editing.enabled ?? true,
        featured: editing.featured ?? false,
        sort: editing.sort ?? 0,
        country: editing.country ?? null,
      };
      if (editing.id) {
        await mut.mutateAsync({ op: "update", values: payload, match: { id: editing.id } });
      } else {
        await mut.mutateAsync({ op: "insert", values: payload });
      }
      qc.invalidateQueries({ queryKey: ["reviews"] });
      setEditing(null);
      toast.success("Review saved");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    }
  };

  const togglePin = async (r: Review) => {
    try {
      await mut.mutateAsync({ op: "update", values: { featured: !r.featured }, match: { id: r.id } });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success(r.featured ? "Unpinned" : "Pinned to top");
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleVisible = async (r: Review) => {
    try {
      await mut.mutateAsync({ op: "update", values: { enabled: !r.enabled }, match: { id: r.id } });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mut.mutateAsync({ op: "delete", match: { id: deleteTarget.id } });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    } catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const visible = rows.filter(r => r.enabled).length;
  const pinned = rows.filter(r => r.featured).length;

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
          <h1 className="text-2xl font-heading text-primary">Guest Reviews</h1>
        </div>
        <Button onClick={startNew} className="gap-2"><Plus className="w-4 h-4" /> Add New Review</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
          <p className="text-2xl font-heading text-primary">{rows.length}</p>
        </CardContent></Card>
        <Card><CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Visible</p>
          <p className="text-2xl font-heading text-primary">{visible}</p>
        </CardContent></Card>
        <Card><CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Pinned</p>
          <p className="text-2xl font-heading text-yellow-600">{pinned}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="py-3 flex items-center gap-2 flex-wrap">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sort</Label>
          {(["pinned", "latest", "highest"] as SortMode[]).map(m => (
            <Button
              key={m}
              size="sm"
              variant={sortMode === m ? "default" : "outline"}
              onClick={() => setSortMode(m)}
              className="capitalize"
            >
              {m === "pinned" ? "Pinned First" : m === "latest" ? "Latest First" : "Highest Rating"}
            </Button>
          ))}
        </CardContent>
      </Card>

      {editing && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>{editing.id ? "Edit Review" : "Add New Review"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Guest Name *</Label>
              <Input
                value={editing.guest_name ?? ""}
                onChange={e => setEditing({ ...editing, guest_name: e.target.value })}
                placeholder="e.g. Rajesh K."
                maxLength={100}
              />
            </div>
            <div>
              <Label>Star Rating *</Label>
              <div className="mt-1">
                <StarRating
                  value={editing.rating ?? 5}
                  onChange={n => setEditing({ ...editing, rating: n })}
                  size="lg"
                />
              </div>
            </div>
            <div>
              <Label>Review Message *</Label>
              <Textarea
                value={editing.text ?? ""}
                onChange={e => setEditing({ ...editing, text: e.target.value })}
                placeholder="Very clean rooms and the location is perfect…"
                rows={5}
                maxLength={1000}
              />
            </div>
            <div>
              <Label>Country / City (optional)</Label>
              <Input
                value={editing.country ?? ""}
                onChange={e => setEditing({ ...editing, country: e.target.value })}
                placeholder="e.g. Chennai, India"
                maxLength={100}
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.enabled ?? true}
                  onCheckedChange={v => setEditing({ ...editing, enabled: v })}
                />
                <Label>Display on Website</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.featured ?? false}
                  onCheckedChange={v => setEditing({ ...editing, featured: v })}
                />
                <Label>📌 Pin to Top</Label>
              </div>
            </div>

            {(editing.guest_name || editing.text) && (
              <div className="border-t pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Live Website Preview</p>
                <div className="rounded-xl border bg-card p-6 shadow-elegant max-w-sm">
                  <StarRating value={editing.rating ?? 5} size="sm" />
                  <p className="text-sm text-muted-foreground italic mt-3 mb-4">
                    "{editing.text || "Your review will appear here…"}"
                  </p>
                  <p className="font-heading font-semibold">{editing.guest_name || "Guest Name"}</p>
                  {editing.country && <p className="text-xs text-muted-foreground mt-1">{editing.country}</p>}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={mut.isPending} className="gap-2">
                <Save className="w-4 h-4" /> {editing.id ? "Update Review" : "Save Review"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)} className="gap-2">
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {!isLoading && sorted.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          No reviews yet. Click Add New Review to create one.
        </CardContent></Card>
      )}

      <div className="space-y-3">
        {sorted.map(r => (
          <Card key={r.id} className={`border ${r.featured ? "border-yellow-400/60 bg-yellow-50/30" : "border-border/60"} ${!r.enabled ? "opacity-60" : ""}`}>
            <CardContent className="py-4 flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRating value={r.rating} size="sm" />
                  {r.featured && <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-700">📌 Pinned</span>}
                  {!r.enabled && <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-muted text-muted-foreground">Hidden</span>}
                </div>
                <p className="text-sm italic text-muted-foreground mt-2">"{r.text}"</p>
                <p className="font-heading font-semibold mt-2">{r.guest_name}</p>
                {r.country && <p className="text-xs text-muted-foreground">{r.country}</p>}
              </div>
              <div className="flex sm:flex-col gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => togglePin(r)} className="gap-1" title={r.featured ? "Unpin" : "Pin to top"}>
                  {r.featured ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  <span className="hidden sm:inline">{r.featured ? "Unpin" : "Pin"}</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleVisible(r)} className="gap-1" title={r.enabled ? "Hide" : "Show"}>
                  {r.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{r.enabled ? "Hide" : "Show"}</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(r)} className="gap-1">
                  <Pencil className="w-4 h-4" /><span className="hidden sm:inline">Edit</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(r)} className="gap-1 text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" /><span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              The review by "{deleteTarget?.guest_name}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ReviewsManager() {
  return <AdminPasswordGate><Manager /></AdminPasswordGate>;
}
