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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Save, X, GripVertical, Search, HelpCircle } from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Faq {
  id: string;
  question: string;
  answer_html: string;
  sort: number;
  enabled: boolean;
  category_id?: string | null;
}

interface FaqCategory { id: string; name: string; sort: number; }

function SortableRow({ faq, onEdit, onDelete, onToggle }: {
  faq: Faq;
  onEdit: (f: Faq) => void;
  onDelete: (f: Faq) => void;
  onToggle: (f: Faq) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: faq.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <Card ref={setNodeRef} style={style} className="border-border/60">
      <CardContent className="py-3 flex items-center gap-3">
        <button
          {...attributes} {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{faq.question}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {faq.answer_html?.replace(/<[^>]+>/g, "").slice(0, 120)}
          </p>
        </div>
        <Switch checked={faq.enabled} onCheckedChange={() => onToggle(faq)} aria-label="Toggle enabled" />
        <Button size="icon" variant="ghost" onClick={() => onEdit(faq)} aria-label="Edit">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(faq)} aria-label="Delete">
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  );
}

function Manager() {
  const qc = useQueryClient();
  const mut = useCmsMutation("faqs");
  const catMut = useCmsMutation("faq_categories");
  const [editing, setEditing] = useState<Partial<Faq> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [newCatName, setNewCatName] = useState("");

  const { data: rows = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["faqs", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Faq[];
    },
  });

  const { data: categories = [] } = useQuery<FaqCategory[]>({
    queryKey: ["faq_categories", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faq_categories").select("*").order("sort", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FaqCategory[];
    },
  });

  const catName = (id?: string | null) => categories.find(c => c.id === id)?.name ?? "Uncategorized";

  const addCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return toast.error("Category already exists");
    }
    try {
      await catMut.mutateAsync({ op: "insert", values: { name, sort: categories.length * 10 } });
      qc.invalidateQueries({ queryKey: ["faq_categories"] });
      setNewCatName("");
      toast.success("Category added");
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteCategory = async (id: string) => {
    try {
      await catMut.mutateAsync({ op: "delete", match: { id } });
      qc.invalidateQueries({ queryKey: ["faq_categories"] });
      toast.success("Category deleted");
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (tab === "active" && !r.enabled) return false;
      if (tab === "inactive" && r.enabled) return false;
      if (categoryFilter !== "all") {
        if (categoryFilter === "none" && r.category_id) return false;
        if (categoryFilter !== "none" && r.category_id !== categoryFilter) return false;
      }
      if (!q) return true;
      return (r.question + " " + (r.answer_html || "")).toLowerCase().includes(q);
    });
  }, [rows, search, tab, categoryFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const startNew = () => setEditing({ question: "", answer_html: "", enabled: true, sort: rows.length * 10 });

  const save = async () => {
    if (!editing) return;
    const question = editing.question?.trim();
    const answer = editing.answer_html?.trim();
    if (!question) return toast.error("Question cannot be empty");
    if (!answer) return toast.error("Answer cannot be empty");
    const duplicate = rows.find(r =>
      r.question.trim().toLowerCase() === question.toLowerCase() && r.id !== editing.id
    );
    if (duplicate) return toast.error("A FAQ with this question already exists");

    try {
      const payload: any = { question, answer_html: answer, enabled: editing.enabled ?? true, sort: editing.sort ?? 0, category_id: editing.category_id ?? null };
      if (editing.id) {
        await mut.mutateAsync({ op: "update", values: payload, match: { id: editing.id } });
      } else {
        await mut.mutateAsync({ op: "insert", values: payload });
      }
      qc.invalidateQueries({ queryKey: ["faqs"] });
      setEditing(null);
      toast.success("FAQ saved");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    }
  };

  const toggle = async (f: Faq) => {
    try {
      await mut.mutateAsync({ op: "update", values: { enabled: !f.enabled }, match: { id: f.id } });
      qc.invalidateQueries({ queryKey: ["faqs"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mut.mutateAsync({ op: "delete", match: { id: deleteTarget.id } });
      qc.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ deleted");
    } catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = filtered.findIndex(r => r.id === active.id);
    const newIdx = filtered.findIndex(r => r.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(filtered, oldIdx, newIdx);
    // Reassign sort values 10,20,30…
    const updates = reordered.map((r, i) => ({ id: r.id, sort: (i + 1) * 10 }));
    // optimistic
    qc.setQueryData<Faq[]>(["faqs", "admin"], (prev = []) => {
      const map = new Map(updates.map(u => [u.id, u.sort]));
      return [...prev].map(r => map.has(r.id) ? { ...r, sort: map.get(r.id)! } : r)
        .sort((a, b) => a.sort - b.sort);
    });
    try {
      await Promise.all(updates.map(u =>
        mut.mutateAsync({ op: "update", values: { sort: u.sort }, match: { id: u.id } })
      ));
      qc.invalidateQueries({ queryKey: ["faqs"] });
    } catch (e: any) {
      toast.error("Reorder failed: " + e.message);
      qc.invalidateQueries({ queryKey: ["faqs"] });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-heading text-primary">FAQ Management</h1>
        </div>
        <Button onClick={startNew} className="gap-2"><Plus className="w-4 h-4" /> Add New Question</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total FAQs</p>
          <p className="text-2xl font-heading text-primary">{rows.length}</p>
        </CardContent></Card>
        <Card><CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Active</p>
          <p className="text-2xl font-heading text-primary">{rows.filter(r => r.enabled).length}</p>
        </CardContent></Card>
        <Card><CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Hidden</p>
          <p className="text-2xl font-heading text-muted-foreground">{rows.filter(r => !r.enabled).length}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="py-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions or answers…"
              className="pl-9"
            />
          </div>
          <Tabs value={tab} onValueChange={v => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({rows.filter(r => r.enabled).length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({rows.filter(r => !r.enabled).length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {editing && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>{editing.id ? "Edit FAQ" : "Add New FAQ"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Question *</Label>
              <Input
                value={editing.question ?? ""}
                onChange={e => setEditing({ ...editing, question: e.target.value })}
                placeholder="e.g. What time is check-in?"
                maxLength={300}
              />
            </div>
            <div>
              <Label>Answer * (HTML allowed)</Label>
              <Textarea
                value={editing.answer_html ?? ""}
                onChange={e => setEditing({ ...editing, answer_html: e.target.value })}
                placeholder="Write a clear, helpful answer…"
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editing.enabled ?? true}
                onCheckedChange={v => setEditing({ ...editing, enabled: v })}
              />
              <Label>Enabled (visible on website)</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={mut.isPending} className="gap-2">
                <Save className="w-4 h-4" /> Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)} className="gap-2">
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
            {(editing.question || editing.answer_html) && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Live Website Preview</p>
                <div className="rounded-md border bg-card p-4">
                  <p className="font-medium text-foreground">▼ {editing.question || "Your question…"}</p>
                  <div
                    className="text-sm text-muted-foreground mt-2"
                    dangerouslySetInnerHTML={{ __html: editing.answer_html || "<em>Your answer will appear here…</em>" }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {!isLoading && filtered.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          {rows.length === 0 ? "No FAQs yet. Click Add New Question to create one." : "No FAQs match your filters."}
        </CardContent></Card>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map(r => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {filtered.map(f => (
              <SortableRow
                key={f.id}
                faq={f}
                onEdit={setEditing}
                onDelete={setDeleteTarget}
                onToggle={toggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.question}" will be permanently removed from your website.
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

export default function FaqManager() {
  return <AdminPasswordGate><Manager /></AdminPasswordGate>;
}
