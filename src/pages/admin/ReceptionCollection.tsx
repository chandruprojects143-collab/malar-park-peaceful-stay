import { useState, useEffect, useCallback } from 'react';
import { BookingEntry, Room } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.substring(0, 7);

const bookingFromDb = (row: any): BookingEntry => ({
  id:            row.id,
  roomNumber:    row.room_number,
  guestName:     row.guest_name,
  checkInDate:   row.check_in_date,
  checkoutDate:  row.checkout_date ?? '',
  roomPrice:     row.room_price,
  advance:       row.advance,
  balance:       row.balance,
  paymentMethod: row.payment_method,
  date:          row.date,
});

const roomFromDb = (row: any): Room => ({
  id:     row.id,
  number: row.number,
  type:   row.type,
  status: row.status,
  rate:   row.rate,
});

const ReceptionCollection = () => {
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({
    roomNumber: '', guestName: '', checkInDate: today, checkoutDate: '',
    roomPrice: 0, advance: 0, paymentMethod: 'Cash' as 'Cash' | 'UPI' | 'Card',
  });

  const fetchData = useCallback(async () => {
    const [bookingsRes, roomsRes] = await Promise.all([
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('hotel_rooms').select('id, number, type, status, rate').order('number'),
    ]);
    if (bookingsRes.error) toast.error('Failed to load bookings');
    else setBookings((bookingsRes.data ?? []).map(bookingFromDb));
    if (roomsRes.error) toast.error('Failed to load rooms');
    else setRooms((roomsRes.data ?? []).map(roomFromDb));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roomNumber || !form.guestName || !form.roomPrice) {
      toast.error('Fill all required fields');
      return;
    }
    const balance = form.roomPrice - form.advance;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        room_number:    form.roomNumber,
        guest_name:     form.guestName,
        check_in_date:  form.checkInDate,
        checkout_date:  form.checkoutDate || null,
        room_price:     form.roomPrice,
        advance:        form.advance,
        balance,
        payment_method: form.paymentMethod,
        date:           today,
      })
      .select()
      .single();

    if (error) { toast.error('Failed to add booking'); return; }
    setBookings(prev => [bookingFromDb(data), ...prev]);
    setForm({ roomNumber: '', guestName: '', checkInDate: today, checkoutDate: '', roomPrice: 0, advance: 0, paymentMethod: 'Cash' });
    toast.success('Booking entry added');
  };

  const todayBookings   = bookings.filter(b => b.date === today);
  const monthBookings   = bookings.filter(b => b.date.startsWith(currentMonth));
  const todayCollection = todayBookings.reduce((s, b) => s + b.advance, 0);
  const monthRevenue    = monthBookings.reduce((s, b) => s + b.roomPrice, 0);
  const pendingPayments = bookings.filter(b => b.balance > 0);

  const roomEarnings = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.roomNumber] = (acc[b.roomNumber] || 0) + b.advance;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">🛎️ Reception Collection</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today's Collection</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">₹{todayCollection.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monthly Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{monthRevenue.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Bookings Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayBookings.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Payments</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{pendingPayments.length}</div></CardContent>
        </Card>
      </div>

      {pendingPayments.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" /> Pending Payment Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {pendingPayments.slice(0, 5).map(b => (
                <div key={b.id} className="text-sm flex justify-between">
                  <span>Room #{b.roomNumber} — {b.guestName}</span>
                  <span className="font-bold text-red-600">₹{b.balance.toLocaleString()} pending</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>New Booking Entry</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room Number</Label>
                <Select value={form.roomNumber} onValueChange={v => {
                  const room = rooms.find(r => r.number === v);
                  setForm(p => ({ ...p, roomNumber: v, roomPrice: room?.rate || p.roomPrice }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => (
                      <SelectItem key={r.id} value={r.number}>#{r.number} ({r.type} — ₹{r.rate})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Guest Name</Label><Input value={form.guestName} onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Check-in Date</Label><Input type="date" value={form.checkInDate} onChange={e => setForm(p => ({ ...p, checkInDate: e.target.value }))} /></div>
              <div><Label>Checkout Date</Label><Input type="date" value={form.checkoutDate} onChange={e => setForm(p => ({ ...p, checkoutDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Room Price (₹)</Label><Input type="number" min={0} value={form.roomPrice || ''} onChange={e => setForm(p => ({ ...p, roomPrice: Number(e.target.value) }))} /></div>
              <div><Label>Advance (₹)</Label><Input type="number" min={0} value={form.advance || ''} onChange={e => setForm(p => ({ ...p, advance: Number(e.target.value) }))} /></div>
              <div>
                <Label>Payment</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm(p => ({ ...p, paymentMethod: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Balance: ₹{Math.max(0, form.roomPrice - form.advance).toLocaleString()}</span>
              <Button type="submit">Add Booking</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {todayBookings.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Today's Bookings</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayBookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>#{b.roomNumber}</TableCell>
                    <TableCell>{b.guestName}</TableCell>
                    <TableCell>₹{b.roomPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">₹{b.advance.toLocaleString()}</TableCell>
                    <TableCell>
                      {b.balance > 0
                        ? <Badge variant="destructive">₹{b.balance.toLocaleString()}</Badge>
                        : <Badge className="bg-green-500">Paid</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {Object.keys(roomEarnings).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Room-wise Earnings</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Object.entries(roomEarnings).sort().map(([room, amt]) => (
                <div key={room} className="text-center p-2 border rounded">
                  <div className="text-xs text-muted-foreground">Room #{room}</div>
                  <div className="font-bold text-sm">₹{amt.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReceptionCollection;
