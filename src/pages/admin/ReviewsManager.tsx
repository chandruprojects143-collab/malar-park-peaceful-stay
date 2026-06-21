import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

interface Review {
  id: string;
  guest_name: string;
  country: string;
  rating: number;
  text: string;
  featured: boolean;
  enabled: boolean;
  sort: number;
}

const emptyForm = (): Omit<Review, 'id'> => ({
  guest_name: '', country: '', rating: 5, text: '', featured: false, enabled: true, sort: 0,
});

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}>
        <Star className={`w-6 h-6 transition-colors ${n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
      </button>
    ))}
  </div>
);

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
    ))}
  </div>
);

const ReviewsManager = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [form, setForm] = useState(emptyForm());

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, guest_name, country, rating, text, featured, enabled, sort')
      .order('sort', { ascending: true });
    if (error) { toast.error('Failed to load reviews'); return; }
    setReviews(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest_name.trim()) { toast.error('Guest name is required'); return; }
    if (!form.text.trim()) { toast.error('Review text is required'); return; }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        guest_name: form.guest_name.trim(),
        country: form.country.trim() || null,
        rating: form.rating,
        text: form.text.trim(),
        featured: form.featured,
        enabled: form.enabled,
        sort: reviews.length,
      })
      .select()
      .single();

    if (error) { toast.error('Failed to add review'); return; }
    setReviews(prev => [...prev, data]);
    setForm(emptyForm());
    setShowAdd(false);
    toast.success('Review added');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReview) return;

    const { error } = await supabase
      .from('reviews')
      .update({
        guest_name: editReview.guest_name.trim(),
        country: editReview.country.trim() || null,
        rating: editReview.rating,
        text: editReview.text.trim(),
        featured: editReview.featured,
        enabled: editReview.enabled,
        sort: editReview.sort,
      })
      .eq('id', editReview.id);

    if (error) { toast.error('Failed to update review'); return; }
    setReviews(prev => prev.map(r => r.id === editReview.id ? editReview : r));
    setEditReview(null);
    toast.success('Review updated');
  };

  const toggleEnabled = async (review: Review) => {
    const updated = { ...review, enabled: !review.enabled };
    const { error } = await supabase.from('reviews').update({ enabled: updated.enabled }).eq('id', review.id);
    if (error) { toast.error('Failed to update'); return; }
    setReviews(prev => prev.map(r => r.id === review.id ? updated : r));
  };

  const toggleFeatured = async (review: Review) => {
    const updated = { ...review, featured: !review.featured };
    const { error } = await supabase.from('reviews').update({ featured: updated.featured }).eq('id', review.id);
    if (error) { toast.error('Failed to update'); return; }
    setReviews(prev => prev.map(r => r.id === review.id ? updated : r));
  };

  const deleteReview = async (id: string, name: string) => {
    if (!confirm(`Delete review by "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) { toast.error('Failed to delete review'); return; }
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success('Review deleted');
  };

  const enabledCount = reviews.filter(r => r.enabled).length;
  const featuredCount = reviews.filter(r => r.featured).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">⭐ Guest Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.length} total · {enabledCount} enabled · {featuredCount} featured
          </p>
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm()); setShowAdd(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Review
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <div className="space-y-3">
          {reviews.length === 0 && (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No reviews yet. Click "Add Review" to get started.</CardContent></Card>
          )}
          {reviews.map(r => (
            <Card key={r.id} className={!r.enabled ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground">{r.guest_name}</span>
                      {r.country && <span className="text-xs text-muted-foreground">{r.country}</span>}
                      <StarDisplay rating={r.rating} />
                      {r.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                      {!r.enabled && <Badge variant="outline" className="text-xs text-muted-foreground">Hidden</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">"{r.text}"</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost" size="sm"
                      className={`text-xs h-7 px-2 ${r.enabled ? 'text-green-600' : 'text-muted-foreground'}`}
                      onClick={() => toggleEnabled(r)}
                      title={r.enabled ? 'Click to hide' : 'Click to show'}
                    >
                      {r.enabled ? 'Visible' : 'Hidden'}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className={`text-xs h-7 px-2 ${r.featured ? 'text-yellow-600' : 'text-muted-foreground'}`}
                      onClick={() => toggleFeatured(r)}
                      title={r.featured ? 'Remove featured' : 'Mark featured'}
                    >
                      {r.featured ? '★ Featured' : '☆ Feature'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditReview({ ...r })}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteReview(r.id, r.guest_name)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={open => { setShowAdd(open); if (!open) setForm(emptyForm()); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Guest Review</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Guest Name *</Label>
                <Input value={form.guest_name} onChange={e => setForm(p => ({ ...p, guest_name: e.target.value }))} placeholder="Rajesh K." required />
              </div>
              <div>
                <Label>Country / City</Label>
                <Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Chennai, India" />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Rating *</Label>
              <StarPicker value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
            </div>
            <div>
              <Label>Review Text *</Label>
              <Textarea rows={3} value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} placeholder="Share the guest's experience…" required />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="add-enabled" checked={form.enabled} onCheckedChange={v => setForm(p => ({ ...p, enabled: v }))} />
                <Label htmlFor="add-enabled" className="cursor-pointer">Show on website</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="add-featured" checked={form.featured} onCheckedChange={v => setForm(p => ({ ...p, featured: v }))} />
                <Label htmlFor="add-featured" className="cursor-pointer">Featured</Label>
              </div>
            </div>
            <Button type="submit" className="w-full">Add Review</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editReview} onOpenChange={open => { if (!open) setEditReview(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Review</DialogTitle></DialogHeader>
          {editReview && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Guest Name *</Label>
                  <Input value={editReview.guest_name} onChange={e => setEditReview(p => p ? { ...p, guest_name: e.target.value } : p)} required />
                </div>
                <div>
                  <Label>Country / City</Label>
                  <Input value={editReview.country ?? ''} onChange={e => setEditReview(p => p ? { ...p, country: e.target.value } : p)} />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Rating *</Label>
                <StarPicker value={editReview.rating} onChange={v => setEditReview(p => p ? { ...p, rating: v } : p)} />
              </div>
              <div>
                <Label>Review Text *</Label>
                <Textarea rows={3} value={editReview.text} onChange={e => setEditReview(p => p ? { ...p, text: e.target.value } : p)} required />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="edit-enabled" checked={editReview.enabled} onCheckedChange={v => setEditReview(p => p ? { ...p, enabled: v } : p)} />
                  <Label htmlFor="edit-enabled" className="cursor-pointer">Show on website</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="edit-featured" checked={editReview.featured} onCheckedChange={v => setEditReview(p => p ? { ...p, featured: v } : p)} />
                  <Label htmlFor="edit-featured" className="cursor-pointer">Featured</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditReview(null)}>Cancel</Button>
                <Button type="submit" className="flex-1">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsManager;
