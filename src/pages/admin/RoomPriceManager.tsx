import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Room } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const defaultRooms: Room[] = Array.from({ length: 12 }, (_, i) => ({
  id: `room-${i + 1}`,
  number: `${100 + i + 1}`,
  type: i < 4 ? 'Deluxe' : i < 8 ? 'Family' : 'Suite',
  status: 'available' as const,
  rate: i < 4 ? 1200 : i < 8 ? 1800 : 2500,
}));

const RoomPriceManager = () => {
  const [rooms, setRooms] = useLocalStorage<Room[]>('malar_rooms', defaultRooms);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ number: '', type: 'Deluxe', rate: 0 });

  const addRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number || !form.rate) { toast.error('Fill all fields'); return; }
    if (rooms.some(r => r.number === form.number)) { toast.error('Room number exists'); return; }
    setRooms(prev => [...prev, { id: Date.now().toString(), ...form, status: 'available' as const }]);
    setForm({ number: '', type: 'Deluxe', rate: 0 });
    setShowAdd(false);
    toast.success('Room added');
  };

  const updatePrice = (id: string, rate: number, type: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, rate, type } : r));
    setEditRoom(null);
    toast.success('Room updated');
  };

  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    toast.success('Room removed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">💰 Room Price Management</h1>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add Room</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Rooms</CardTitle></CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">#{r.number}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell className="font-bold">₹{r.rate.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                      r.status === 'available' ? 'bg-green-500' : r.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    {r.status}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditRoom(r)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteRoom(r.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Room</DialogTitle></DialogHeader>
          <form onSubmit={addRoom} className="space-y-3">
            <div><Label>Room Number</Label><Input value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="301" required /></div>
            <div><Label>Room Type</Label><Input value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} placeholder="Deluxe / Family / Suite" required /></div>
            <div><Label>Price (₹)</Label><Input type="number" min={0} value={form.rate || ''} onChange={e => setForm(p => ({ ...p, rate: Number(e.target.value) }))} required /></div>
            <Button type="submit" className="w-full">Add Room</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRoom} onOpenChange={() => setEditRoom(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Room #{editRoom?.number}</DialogTitle></DialogHeader>
          {editRoom && (
            <EditRoomForm room={editRoom} onSave={updatePrice} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EditRoomForm = ({ room, onSave }: { room: Room; onSave: (id: string, rate: number, type: string) => void }) => {
  const [rate, setRate] = useState(room.rate);
  const [type, setType] = useState(room.type);
  return (
    <div className="space-y-3">
      <div><Label>Room Type</Label><Input value={type} onChange={e => setType(e.target.value)} /></div>
      <div><Label>New Price (₹)</Label><Input type="number" min={0} value={rate || ''} onChange={e => setRate(Number(e.target.value))} /></div>
      <Button className="w-full" onClick={() => onSave(room.id, rate, type)}>Save Changes</Button>
    </div>
  );
};

export default RoomPriceManager;
