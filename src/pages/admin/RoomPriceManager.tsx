import { useState, useEffect, useCallback, useRef } from 'react';
import { Room } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

// hotel_rooms is not in the generated types (it's an operational table added via migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Upload, ImageIcon, Loader2 } from 'lucide-react';

const ROOM_TYPES = ['Deluxe', 'Family', 'Suite', 'Standard', 'Super Deluxe', 'Executive'];
const AMENITY_PRESETS = [
  'AC', 'TV', 'WiFi', 'Hot Water', 'Balcony', 'Mini Fridge',
  'King Bed', 'Twin Beds', 'City View', 'Garden View', 'Sofa',
  'Wardrobe', 'Safe', 'Kettle', 'Room Service', 'Attached Bathroom',
];
const MAX_BYTES = 2 * 1024 * 1024;

interface RoomWithImages extends Room {
  images: string[];
}

const fromDb = (row: any): RoomWithImages => ({
  id:          row.id,
  number:      row.number,
  type:        row.type,
  description: row.description ?? '',
  capacity:    row.capacity ?? 2,
  amenities:   row.amenities ?? [],
  status:      row.status,
  rate:        row.rate,
  images:      row.images ?? [],
});

const emptyForm = () => ({
  number: '', type: 'Deluxe', description: '', capacity: 2, rate: 1200,
  amenities: [] as string[], customAmenity: '',
});

async function uploadRoomImages(files: File[], roomNumber: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `rooms/${roomNumber}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from('media')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) { toast.error(`Upload failed: ${file.name}`); continue; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

const RoomManager = () => {
  const [rooms, setRooms] = useState<RoomWithImages[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editRoom, setEditRoom] = useState<RoomWithImages | null>(null);
  const [form, setForm] = useState(emptyForm());

  // Add dialog image state
  const [addFiles, setAddFiles] = useState<File[]>([]);
  const [addPreviews, setAddPreviews] = useState<string[]>([]);

  // Edit dialog image state
  const [editExistingUrls, setEditExistingUrls] = useState<string[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
  const [editNewPreviews, setEditNewPreviews] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);

  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const fetchRooms = useCallback(async () => {
    const { data, error } = await db
      .from('hotel_rooms')
      .select('id, number, type, description, capacity, amenities, status, rate, images')
      .order('number');
    if (error) { toast.error('Failed to load rooms'); return; }
    setRooms((data ?? []).map(fromDb));
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const pickFiles = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    const valid = picked.filter(f => {
      if (f.size > MAX_BYTES) { toast.error(`${f.name} exceeds 2 MB`); return false; }
      return true;
    });
    setFiles(p => [...p, ...valid]);
    valid.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setPreviews(p => [...p, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeAddFile = (i: number) => {
    setAddFiles(p => p.filter((_, idx) => idx !== i));
    setAddPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const removeEditNew = (i: number) => {
    setEditNewFiles(p => p.filter((_, idx) => idx !== i));
    setEditNewPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const removeEditExisting = (i: number) => {
    setEditExistingUrls(p => p.filter((_, idx) => idx !== i));
  };

  const toggleAmenity = (amenity: string, current: string[], setter: (a: string[]) => void) => {
    setter(current.includes(amenity) ? current.filter(a => a !== amenity) : [...current, amenity]);
  };

  const addCustomAmenity = (
    val: string, current: string[],
    setter: (a: string[]) => void, clear: () => void,
  ) => {
    const t = val.trim();
    if (!t) return;
    if (!current.includes(t)) setter([...current, t]);
    clear();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number) { toast.error('Room number is required'); return; }
    if (rooms.some(r => r.number === form.number)) { toast.error('Room number already exists'); return; }
    if (!form.rate) { toast.error('Price is required'); return; }

    setUploading(true);
    let imageUrls: string[] = [];
    if (addFiles.length > 0) {
      imageUrls = await uploadRoomImages(addFiles, form.number);
    }

    const { data, error } = await db
      .from('hotel_rooms')
      .insert({
        number: form.number, type: form.type,
        description: form.description || null,
        capacity: form.capacity, rate: form.rate,
        amenities: form.amenities, status: 'available',
        images: imageUrls,
      })
      .select()
      .single();

    setUploading(false);
    if (error) { toast.error('Failed to add room'); return; }

    setRooms(prev => [...prev, fromDb(data)].sort((a, b) => a.number.localeCompare(b.number)));
    setForm(emptyForm());
    setAddFiles([]); setAddPreviews([]);
    setShowAdd(false);
    toast.success('Room added');
  };

  const openEdit = (room: RoomWithImages) => {
    setEditRoom(room);
    setEditExistingUrls(room.images ?? []);
    setEditNewFiles([]);
    setEditNewPreviews([]);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;

    setUploading(true);
    let newUrls: string[] = [];
    if (editNewFiles.length > 0) {
      newUrls = await uploadRoomImages(editNewFiles, editRoom.number);
    }
    const finalImages = [...editExistingUrls, ...newUrls];

    const { error } = await db
      .from('hotel_rooms')
      .update({
        type: editRoom.type, description: editRoom.description || null,
        capacity: editRoom.capacity, rate: editRoom.rate,
        amenities: editRoom.amenities, images: finalImages,
      })
      .eq('id', editRoom.id);

    setUploading(false);
    if (error) { toast.error('Failed to update room'); return; }

    setRooms(prev => prev.map(r =>
      r.id === editRoom.id ? { ...editRoom, images: finalImages } : r
    ));
    setEditRoom(null);
    setEditExistingUrls([]);
    setEditNewFiles([]);
    setEditNewPreviews([]);
    toast.success('Room updated');
  };

  const deleteRoom = async (id: string, number: string) => {
    if (!confirm(`Delete Room #${number}? This cannot be undone.`)) return;
    const { error } = await db.from('hotel_rooms').delete().eq('id', id);
    if (error) { toast.error('Failed to delete room'); return; }
    setRooms(prev => prev.filter(r => r.id !== id));
    toast.success('Room deleted');
  };

  const closeAdd = () => {
    setShowAdd(false);
    setForm(emptyForm());
    setAddFiles([]); setAddPreviews([]);
  };

  const closeEdit = () => {
    setEditRoom(null);
    setEditExistingUrls([]);
    setEditNewFiles([]);
    setEditNewPreviews([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">🛏️ Room Management</h1>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Room
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Rooms ({rooms.length})</CardTitle></CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Amenities</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">#{r.number}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.capacity} guests</TableCell>
                  <TableCell className="font-bold">₹{r.rate.toLocaleString()}</TableCell>
                  <TableCell>
                    {r.images.length > 0 ? (
                      <div className="flex gap-1 items-center">
                        {r.images.slice(0, 3).map((src, i) => (
                          <img key={i} src={src} alt="" className="w-10 h-10 object-cover rounded border" />
                        ))}
                        {r.images.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{r.images.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {r.amenities.slice(0, 4).map(a => (
                        <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                      ))}
                      {r.amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">+{r.amenities.length - 4}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteRoom(r.id, r.number)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No rooms yet. Click "Add Room" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Add Room Dialog ── */}
      <Dialog open={showAdd} onOpenChange={open => { if (!open) closeAdd(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Room</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room Number *</Label>
                <Input value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="101" required />
              </div>
              <div>
                <Label>Room Type *</Label>
                <Input value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} list="room-types-add" placeholder="Deluxe" required />
                <datalist id="room-types-add">{ROOM_TYPES.map(t => <option key={t} value={t} />)}</datalist>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price per Night (₹) *</Label>
                <Input type="number" min={1} value={form.rate || ''} onChange={e => setForm(p => ({ ...p, rate: Number(e.target.value) }))} required />
              </div>
              <div>
                <Label>Capacity (guests) *</Label>
                <Input type="number" min={1} max={20} value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} required />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief room description" />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="mb-2 block">Room Photos</Label>
              <input ref={addFileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                onChange={e => pickFiles(e, setAddFiles, setAddPreviews)} />
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addFileRef.current?.click()}>
                <Upload className="w-4 h-4" /> Upload Photos
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG / PNG / WebP · max 2 MB each</p>
              {addPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {addPreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-20 h-20 object-cover rounded border" />
                      <button type="button" onClick={() => removeAddFile(i)}
                        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <AmenityPicker
              amenities={form.amenities}
              customAmenity={form.customAmenity}
              onToggle={a => toggleAmenity(a, form.amenities, v => setForm(p => ({ ...p, amenities: v })))}
              onCustomChange={v => setForm(p => ({ ...p, customAmenity: v }))}
              onCustomAdd={() => addCustomAmenity(form.customAmenity, form.amenities,
                v => setForm(p => ({ ...p, amenities: v })), () => setForm(p => ({ ...p, customAmenity: '' })))}
              onRemove={a => setForm(p => ({ ...p, amenities: p.amenities.filter(x => x !== a) }))}
              listId="amenity-add"
            />

            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</> : 'Add Room'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Room Dialog ── */}
      <Dialog open={!!editRoom} onOpenChange={open => { if (!open) closeEdit(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Room #{editRoom?.number}</DialogTitle></DialogHeader>
          {editRoom && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Room Type *</Label>
                  <Input value={editRoom.type} onChange={e => setEditRoom(p => p ? { ...p, type: e.target.value } : p)} list="room-types-edit" required />
                  <datalist id="room-types-edit">{ROOM_TYPES.map(t => <option key={t} value={t} />)}</datalist>
                </div>
                <div>
                  <Label>Capacity (guests) *</Label>
                  <Input type="number" min={1} max={20} value={editRoom.capacity}
                    onChange={e => setEditRoom(p => p ? { ...p, capacity: Number(e.target.value) } : p)} required />
                </div>
              </div>
              <div>
                <Label>Price per Night (₹) *</Label>
                <Input type="number" min={1} value={editRoom.rate || ''}
                  onChange={e => setEditRoom(p => p ? { ...p, rate: Number(e.target.value) } : p)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={2} value={editRoom.description ?? ''}
                  onChange={e => setEditRoom(p => p ? { ...p, description: e.target.value } : p)} placeholder="Brief room description" />
              </div>

              {/* Image Upload */}
              <div>
                <Label className="mb-2 block">Room Photos</Label>

                {/* Existing images */}
                {editExistingUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editExistingUrls.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-20 h-20 object-cover rounded border" />
                        <button type="button" onClick={() => removeEditExisting(i)}
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New images preview */}
                {editNewPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editNewPreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-20 h-20 object-cover rounded border opacity-80" />
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-black/50 text-white rounded-b">new</span>
                        <button type="button" onClick={() => removeEditNew(i)}
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {editExistingUrls.length === 0 && editNewPreviews.length === 0 && (
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
                    <ImageIcon className="w-4 h-4" /> No photos yet
                  </div>
                )}

                <input ref={editFileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                  onChange={e => pickFiles(e, setEditNewFiles, setEditNewPreviews)} />
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => editFileRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Add Photos
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG / PNG / WebP · max 2 MB each</p>
              </div>

              <AmenityPicker
                amenities={editRoom.amenities}
                customAmenity=""
                onToggle={a => toggleAmenity(a, editRoom.amenities, v => setEditRoom(p => p ? { ...p, amenities: v } : p))}
                onCustomChange={() => {}}
                onCustomAdd={() => {}}
                onRemove={a => setEditRoom(p => p ? { ...p, amenities: p.amenities.filter(x => x !== a) } : p)}
                listId="amenity-edit"
                renderCustom={
                  <EditCustomAmenity
                    amenities={editRoom.amenities}
                    onChange={v => setEditRoom(p => p ? { ...p, amenities: v } : p)}
                  />
                }
              />

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={closeEdit}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</> : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── Shared amenity picker ── */
const AmenityPicker = ({
  amenities, customAmenity, onToggle, onCustomChange, onCustomAdd, onRemove, listId, renderCustom,
}: {
  amenities: string[];
  customAmenity: string;
  onToggle: (a: string) => void;
  onCustomChange: (v: string) => void;
  onCustomAdd: () => void;
  onRemove: (a: string) => void;
  listId: string;
  renderCustom?: React.ReactNode;
}) => (
  <div>
    <Label className="mb-2 block">Amenities</Label>
    <div className="flex flex-wrap gap-2 mb-2">
      {AMENITY_PRESETS.map(a => (
        <button key={a} type="button" onClick={() => onToggle(a)}
          className={`text-xs px-2 py-1 rounded-full border transition-colors ${amenities.includes(a) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}
        >{a}</button>
      ))}
    </div>
    {renderCustom ?? (
      <div className="flex gap-2">
        <Input value={customAmenity} onChange={e => onCustomChange(e.target.value)} placeholder="Add custom amenity"
          list={listId}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onCustomAdd(); } }} />
        <Button type="button" variant="outline" size="sm" onClick={onCustomAdd}>Add</Button>
      </div>
    )}
    {amenities.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {amenities.map(a => (
          <Badge key={a} variant="secondary" className="gap-1">
            {a}<X className="w-3 h-3 cursor-pointer" onClick={() => onRemove(a)} />
          </Badge>
        ))}
      </div>
    )}
  </div>
);

const EditCustomAmenity = ({ amenities, onChange }: { amenities: string[]; onChange: (v: string[]) => void }) => {
  const [custom, setCustom] = useState('');
  const add = () => {
    const t = custom.trim();
    if (!t || amenities.includes(t)) { setCustom(''); return; }
    onChange([...amenities, t]);
    setCustom('');
  };
  return (
    <div className="flex gap-2">
      <Input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Add custom amenity"
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
      <Button type="button" variant="outline" size="sm" onClick={add}>Add</Button>
    </div>
  );
};

export default RoomManager;
