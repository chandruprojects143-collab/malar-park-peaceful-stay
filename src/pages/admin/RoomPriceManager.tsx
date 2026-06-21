import { useState, useEffect, useCallback } from 'react';
import { Room } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const ROOM_TYPES = ['Deluxe', 'Family', 'Suite', 'Standard', 'Super Deluxe', 'Executive'];
const AMENITY_PRESETS = [
  'AC', 'TV', 'WiFi', 'Hot Water', 'Balcony', 'Mini Fridge',
  'King Bed', 'Twin Beds', 'City View', 'Garden View', 'Sofa',
  'Wardrobe', 'Safe', 'Kettle', 'Room Service', 'Attached Bathroom',
];

const fromDb = (row: any): Room => ({
  id:          row.id,
  number:      row.number,
  type:        row.type,
  description: row.description ?? '',
  capacity:    row.capacity ?? 2,
  amenities:   row.amenities ?? [],
  status:      row.status,
  rate:        row.rate,
});

const emptyForm = () => ({
  number: '', type: 'Deluxe', description: '', capacity: 2, rate: 1200, amenities: [] as string[], customAmenity: '',
});

const RoomManager = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState(emptyForm());

  const fetchRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('id, number, type, description, capacity, amenities, status, rate')
      .order('number');
    if (error) { toast.error('Failed to load rooms'); return; }
    setRooms((data ?? []).map(fromDb));
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const toggleAmenity = (amenity: string, current: string[], setter: (a: string[]) => void) => {
    setter(current.includes(amenity) ? current.filter(a => a !== amenity) : [...current, amenity]);
  };

  const addCustomAmenity = (customAmenity: string, current: string[], setter: (a: string[]) => void, clearFn: () => void) => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (!current.includes(trimmed)) setter([...current, trimmed]);
    clearFn();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number) { toast.error('Room number is required'); return; }
    if (rooms.some(r => r.number === form.number)) { toast.error('Room number already exists'); return; }
    if (!form.rate) { toast.error('Price is required'); return; }

    const { data, error } = await supabase
      .from('hotel_rooms')
      .insert({
        number: form.number, type: form.type, description: form.description || null,
        capacity: form.capacity, rate: form.rate, amenities: form.amenities, status: 'available',
      })
      .select()
      .single();

    if (error) { toast.error('Failed to add room'); return; }
    setRooms(prev => [...prev, fromDb(data)].sort((a, b) => a.number.localeCompare(b.number)));
    setForm(emptyForm());
    setShowAdd(false);
    toast.success('Room added');
  };

  const openEdit = (room: Room) => {
    setEditRoom(room);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;

    const { error } = await supabase
      .from('hotel_rooms')
      .update({
        type: editRoom.type, description: editRoom.description || null,
        capacity: editRoom.capacity, rate: editRoom.rate, amenities: editRoom.amenities,
      })
      .eq('id', editRoom.id);

    if (error) { toast.error('Failed to update room'); return; }
    setRooms(prev => prev.map(r => r.id === editRoom.id ? editRoom : r));
    setEditRoom(null);
    toast.success('Room updated');
  };

  const deleteRoom = async (id: string, number: string) => {
    if (!confirm(`Delete Room #${number}? This cannot be undone.`)) return;
    const { error } = await supabase.from('hotel_rooms').delete().eq('id', id);
    if (error) { toast.error('Failed to delete room'); return; }
    setRooms(prev => prev.filter(r => r.id !== id));
    toast.success('Room deleted');
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No rooms yet. Click "Add Room" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Room Dialog */}
      <Dialog open={showAdd} onOpenChange={open => { setShowAdd(open); if (!open) setForm(emptyForm()); }}>
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
            <div>
              <Label className="mb-2 block">Amenities</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {AMENITY_PRESETS.map(a => (
                  <button key={a} type="button"
                    onClick={() => toggleAmenity(a, form.amenities, v => setForm(p => ({ ...p, amenities: v })))}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${form.amenities.includes(a) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}
                  >{a}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={form.customAmenity}
                  onChange={e => setForm(p => ({ ...p, customAmenity: e.target.value }))}
                  placeholder="Add custom amenity"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(form.customAmenity, form.amenities, v => setForm(p => ({ ...p, amenities: v })), () => setForm(p => ({ ...p, customAmenity: '' }))); } }}
                />
                <Button type="button" variant="outline" size="sm"
                  onClick={() => addCustomAmenity(form.customAmenity, form.amenities, v => setForm(p => ({ ...p, amenities: v })), () => setForm(p => ({ ...p, customAmenity: '' })))}>
                  Add
                </Button>
              </div>
              {form.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.amenities.map(a => (
                    <Badge key={a} variant="secondary" className="gap-1">
                      {a}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setForm(p => ({ ...p, amenities: p.amenities.filter(x => x !== a) }))} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full">Add Room</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={!!editRoom} onOpenChange={open => { if (!open) setEditRoom(null); }}>
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
                  <Input type="number" min={1} max={20} value={editRoom.capacity} onChange={e => setEditRoom(p => p ? { ...p, capacity: Number(e.target.value) } : p)} required />
                </div>
              </div>
              <div>
                <Label>Price per Night (₹) *</Label>
                <Input type="number" min={1} value={editRoom.rate || ''} onChange={e => setEditRoom(p => p ? { ...p, rate: Number(e.target.value) } : p)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={2} value={editRoom.description ?? ''} onChange={e => setEditRoom(p => p ? { ...p, description: e.target.value } : p)} placeholder="Brief room description" />
              </div>
              <div>
                <Label className="mb-2 block">Amenities</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {AMENITY_PRESETS.map(a => (
                    <button key={a} type="button"
                      onClick={() => toggleAmenity(a, editRoom.amenities, v => setEditRoom(p => p ? { ...p, amenities: v } : p))}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${editRoom.amenities.includes(a) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}
                    >{a}</button>
                  ))}
                </div>
                <EditCustomAmenity
                  amenities={editRoom.amenities}
                  onChange={v => setEditRoom(p => p ? { ...p, amenities: v } : p)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditRoom(null)}>Cancel</Button>
                <Button type="submit" className="flex-1">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EditCustomAmenity = ({ amenities, onChange }: { amenities: string[]; onChange: (v: string[]) => void }) => {
  const [custom, setCustom] = useState('');
  const add = () => {
    const t = custom.trim();
    if (!t || amenities.includes(t)) { setCustom(''); return; }
    onChange([...amenities, t]);
    setCustom('');
  };
  return (
    <>
      <div className="flex gap-2">
        <Input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Add custom amenity"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" size="sm" onClick={add}>Add</Button>
      </div>
      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {amenities.map(a => (
            <Badge key={a} variant="secondary" className="gap-1">
              {a}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onChange(amenities.filter(x => x !== a))} />
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

export default RoomManager;
