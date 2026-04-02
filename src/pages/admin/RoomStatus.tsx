import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Room, RoomStatus } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const statusColors: Record<RoomStatus, string> = {
  available: 'bg-green-500',
  occupied: 'bg-red-500',
  cleaning: 'bg-yellow-500',
};

const statusLabels: Record<RoomStatus, string> = {
  available: '🟢 Available',
  occupied: '🔴 Occupied',
  cleaning: '🟡 Cleaning',
};

const defaultRooms: Room[] = Array.from({ length: 12 }, (_, i) => ({
  id: `room-${i + 1}`,
  number: `${100 + i + 1}`,
  type: i < 4 ? 'Deluxe' : i < 8 ? 'Family' : 'Suite',
  status: 'available' as RoomStatus,
  rate: i < 4 ? 1200 : i < 8 ? 1800 : 2500,
}));

const RoomStatusPage = () => {
  const [rooms, setRooms] = useLocalStorage<Room[]>('malar_rooms', defaultRooms);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [guestName, setGuestName] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const updateStatus = (roomId: string, status: RoomStatus) => {
    if (status === 'occupied') {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setEditRoom(room);
        setDialogOpen(true);
      }
      return;
    }
    setRooms(rooms.map(r => r.id === roomId
      ? { ...r, status, guestName: undefined, checkoutDate: undefined }
      : r
    ));
    toast.success(`Room updated to ${status}`);
  };

  const assignGuest = () => {
    if (!editRoom || !guestName) return;
    setRooms(rooms.map(r => r.id === editRoom.id
      ? { ...r, status: 'occupied' as RoomStatus, guestName, checkoutDate }
      : r
    ));
    setEditRoom(null);
    setGuestName('');
    setCheckoutDate('');
    setDialogOpen(false);
    toast.success('Guest assigned');
  };

  const counts = {
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Room Status Dashboard</h1>
        <div className="flex gap-2 text-sm">
          <Badge variant="outline" className="bg-green-500/10">🟢 {counts.available}</Badge>
          <Badge variant="outline" className="bg-red-500/10">🔴 {counts.occupied}</Badge>
          <Badge variant="outline" className="bg-yellow-500/10">🟡 {counts.cleaning}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map(room => (
          <Card key={room.id} className={`border-l-4 ${
            room.status === 'available' ? 'border-l-green-500' :
            room.status === 'occupied' ? 'border-l-red-500' : 'border-l-yellow-500'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">#{room.number}</span>
                <span className={`w-3 h-3 rounded-full ${statusColors[room.status]}`} />
              </CardTitle>
              <p className="text-xs text-muted-foreground">{room.type} • ₹{room.rate}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {room.guestName && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Guest:</span> {room.guestName}
                </div>
              )}
              {room.checkoutDate && (
                <div className="text-xs text-muted-foreground">
                  Checkout: {room.checkoutDate}
                </div>
              )}
              <div className="flex gap-1">
                {(['available', 'occupied', 'cleaning'] as RoomStatus[]).map(s => (
                  <Button
                    key={s}
                    size="sm"
                    variant={room.status === s ? 'default' : 'outline'}
                    className="text-xs flex-1 h-7 px-1"
                    onClick={() => updateStatus(room.id, s)}
                  >
                    {s === 'available' ? '🟢' : s === 'occupied' ? '🔴' : '🟡'}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Guest to Room #{editRoom?.number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Guest Name</Label>
              <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Guest name" />
            </div>
            <div>
              <Label>Checkout Date</Label>
              <Input type="date" value={checkoutDate} onChange={e => setCheckoutDate(e.target.value)} />
            </div>
            <Button onClick={assignGuest} className="w-full">Assign Guest</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomStatusPage;
