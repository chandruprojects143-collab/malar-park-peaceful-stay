import { useState, useEffect, useCallback } from 'react';
import { CollectionEntry } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.substring(0, 7);

const fromDb = (row: any): CollectionEntry => ({
  id:            row.id,
  date:          row.date,
  roomRent:      row.room_rent,
  upiPayment:    row.upi_payment,
  cash:          row.cash,
  onlineBooking: row.online_booking,
  extraCharges:  row.extra_charges,
  laundryIncome: row.laundry_income,
});

const total = (entries: CollectionEntry[]) =>
  entries.reduce((s, c) => s + c.roomRent + c.upiPayment + c.cash + c.onlineBooking + c.extraCharges + c.laundryIncome, 0);

const DailyCollection = () => {
  const [collections, setCollections] = useState<CollectionEntry[]>([]);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState({
    roomRent: 0, upiPayment: 0, cash: 0, onlineBooking: 0, extraCharges: 0, laundryIncome: 0,
  });

  const fetchCollections = useCallback(async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load collections'); return; }
    setCollections((data ?? []).map(fromDb));
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('collections')
      .insert({
        date,
        room_rent:      form.roomRent,
        upi_payment:    form.upiPayment,
        cash:           form.cash,
        online_booking: form.onlineBooking,
        extra_charges:  form.extraCharges,
        laundry_income: form.laundryIncome,
      })
      .select()
      .single();

    if (error) { toast.error('Failed to add collection entry'); return; }
    setCollections(prev => [fromDb(data), ...prev]);
    setForm({ roomRent: 0, upiPayment: 0, cash: 0, onlineBooking: 0, extraCharges: 0, laundryIncome: 0 });
    toast.success('Collection entry added');
  };

  const todayEntries = collections.filter(c => c.date === today);
  const monthEntries = collections.filter(c => c.date.startsWith(currentMonth));

  const fields = [
    { key: 'roomRent'      as const, label: '🏠 Room Rent' },
    { key: 'upiPayment'    as const, label: '📱 UPI Payment' },
    { key: 'cash'          as const, label: '💵 Cash' },
    { key: 'onlineBooking' as const, label: '🌐 Online Booking' },
    { key: 'extraCharges'  as const, label: '➕ Extra Charges' },
    { key: 'laundryIncome' as const, label: '🧺 Laundry Income' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">💵 Daily Collection</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today's Collection</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">₹{total(todayEntries).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monthly Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{total(monthEntries).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Entries Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayEntries.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Collection Entry</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form[f.key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
            <div className="text-right text-lg font-bold">
              Total: ₹{Object.values(form).reduce((a, b) => a + b, 0).toLocaleString()}
            </div>
            <Button type="submit" className="w-full">Add Entry</Button>
          </form>
        </CardContent>
      </Card>

      {todayEntries.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Today's Entries</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayEntries.map(e => (
                <div key={e.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <span>Room: ₹{e.roomRent} | UPI: ₹{e.upiPayment} | Cash: ₹{e.cash}</span>
                  <span className="font-bold">₹{(e.roomRent + e.upiPayment + e.cash + e.onlineBooking + e.extraCharges + e.laundryIncome).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyCollection;
