import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CollectionEntry } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.substring(0, 7);

const DailyCollection = () => {
  const [collections, setCollections] = useLocalStorage<CollectionEntry[]>('malar_collections', []);
  const [date, setDate] = useState(today);
  const [form, setForm] = useState({
    roomRent: 0, upiPayment: 0, cash: 0, onlineBooking: 0, extraCharges: 0, laundryIncome: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: CollectionEntry = {
      id: Date.now().toString(),
      date,
      ...form,
    };
    setCollections(prev => [...prev, entry]);
    setForm({ roomRent: 0, upiPayment: 0, cash: 0, onlineBooking: 0, extraCharges: 0, laundryIncome: 0 });
    toast.success('Collection entry added');
  };

  const total = (entries: CollectionEntry[]) =>
    entries.reduce((s, c) => s + c.roomRent + c.upiPayment + c.cash + c.onlineBooking + c.extraCharges + c.laundryIncome, 0);

  const todayEntries = collections.filter(c => c.date === today);
  const monthEntries = collections.filter(c => c.date.startsWith(currentMonth));

  const fields = [
    { key: 'roomRent', label: '🏠 Room Rent' },
    { key: 'upiPayment', label: '📱 UPI Payment' },
    { key: 'cash', label: '💵 Cash' },
    { key: 'onlineBooking', label: '🌐 Online Booking' },
    { key: 'extraCharges', label: '➕ Extra Charges' },
    { key: 'laundryIncome', label: '🧺 Laundry Income' },
  ] as const;

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
