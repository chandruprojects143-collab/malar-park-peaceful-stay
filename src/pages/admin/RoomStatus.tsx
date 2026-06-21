import { useState, useEffect, useCallback } from 'react';
import { Room, RoomStatus } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const statusColors: Record<RoomStatus, string> = {
  available: 'bg-green-500',
  occupied:  'bg-red-500',
  cleaning:  'bg-yellow-500',
};

const fromDb = (row: any): Room => ({
  id:            row.id,
  number:        row.number,
  type:          row.type,
  status:        row.status as RoomStatus,
  guestName:     row.guest_name    ?? undefined,
  checkInDate:   row.check_in_date ?? undefined,
  checkoutDate:  row.checkout_date ?? undefined,
  rate:          row.rate,
  advance:       row.advance       ?? undefined,
  balance:       row.balance       ?? undefined,
  paymentMethod: row.payment_method ?? undefined,
});

const RoomStatusPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [guestName, setGuestName] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('*')
      .order('number');
    if (error) { toast.error('Failed to load rooms'); return; }
    setRooms((data ?? []).map(fromDb));
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const updateStatus = async (roomId: string, status: RoomStatus) => {
    if (status === 'occupied') {
      const room = rooms.find(r => r.id === roomId);
      if (room) { setEditRoom(room); setDialogOpen(true); }
      return;
    }
    const { error } = await supabase
      .from('hotel_rooms')
      .update({ status, guest_name: null, checkout_date: null })
      .eq('id', roomId);
    if (error) { toast.error('Failed to update room'); return; }
    setRooms(prev => prev.map(r =>
      r.id === roomId ? { ...r, status, guestName: undefined, checkoutDate: undefined } : r
    ));
    toast.success(`Room updated to ${status}`);
  };

  const assignGuest = async () => {
    if (!editRoom || !guestName) return;
    const { error } = await supabase
      .from('hotel_rooms')
      .update({ status: 'occupied', guest_name: guestName, checkout_date: checkoutDate || null })
      .eq('id', editRoom.id);
    if (error) { toast.error('Failed to assign guest'); return; }
    setRooms(prev => prev.map(r =>
      r.id === editRoom.id ? { ...r, status: 'occupied', guestName, checkoutDate } : r
    ));
    setEditRoom(null); setGuestName(''); setCheckoutDate(''); setDialogOpen(false);
    toast.success('Guest assigned');
  };

  const counts = {
    available: rooms.filter(r => r.status === 'available').length,
    occupied:  rooms.filter(r => r.status === 'occupied').length,
    cleaning:  rooms.filter(r => r.status === 'cleaning').length,
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
            room.status === 'occupied'  ? 'border-l-red-500'   : 'border-l-yellow-500'
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
                <div className="text-xs text-muted-foreground">Checkout: {room.checkoutDate}</div>
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
