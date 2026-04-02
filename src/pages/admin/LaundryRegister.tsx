import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LaundryEntry, LaundryStatus } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const today = new Date().toISOString().split('T')[0];

const statusColors: Record<LaundryStatus, string> = {
  Pending: 'bg-yellow-500',
  Washing: 'bg-blue-500',
  Delivered: 'bg-green-500',
};

const LaundryRegister = () => {
  const [entries, setEntries] = useLocalStorage<LaundryEntry[]>('malar_laundry', []);
  const [form, setForm] = useState({ roomNumber: '', guestName: '', clothCount: 0, rate: 30 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roomNumber || !form.guestName || !form.clothCount) { toast.error('Fill all fields'); return; }
    const entry: LaundryEntry = {
      id: Date.now().toString(),
      date: today,
      ...form,
      totalAmount: form.clothCount * form.rate,
      status: 'Pending',
    };
    setEntries(prev => [...prev, entry]);
    setForm({ roomNumber: '', guestName: '', clothCount: 0, rate: 30 });
    toast.success('Laundry entry added');
  };

  const updateStatus = (id: string, status: LaundryStatus) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    toast.success(`Status: ${status}`);
  };

  const pending = entries.filter(e => e.status !== 'Delivered');
  const delivered = entries.filter(e => e.status === 'Delivered');
  const todayIncome = entries.filter(e => e.date === today && e.status === 'Delivered')
    .reduce((s, e) => s + e.totalAmount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">🧺 Laundry Register</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{pending.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{delivered.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today Income</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{todayIncome}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>New Laundry Entry</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Room Number</Label><Input value={form.roomNumber} onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))} placeholder="101" required /></div>
              <div><Label>Guest Name</Label><Input value={form.guestName} onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cloth Count</Label><Input type="number" min={1} value={form.clothCount || ''} onChange={e => setForm(p => ({ ...p, clothCount: Number(e.target.value) }))} required /></div>
              <div><Label>Rate (₹/item)</Label><Input type="number" min={1} value={form.rate || ''} onChange={e => setForm(p => ({ ...p, rate: Number(e.target.value) }))} /></div>
            </div>
            <div className="text-right font-bold">Total: ₹{(form.clothCount * form.rate).toLocaleString()}</div>
            <Button type="submit" className="w-full">Add Entry</Button>
          </form>
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Active Laundry</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pending.map(e => (
              <div key={e.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">Room #{e.roomNumber} — {e.guestName}</div>
                  <div className="text-sm text-muted-foreground">{e.clothCount} items • ₹{e.totalAmount}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[e.status]}>{e.status}</Badge>
                  <Select value={e.status} onValueChange={v => updateStatus(e.id, v as LaundryStatus)}>
                    <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Washing">Washing</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LaundryRegister;
