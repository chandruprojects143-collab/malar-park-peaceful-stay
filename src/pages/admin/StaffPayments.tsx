import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { StaffPayment } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.substring(0, 7);

const StaffPayments = () => {
  const [payments, setPayments] = useLocalStorage<StaffPayment[]>('malar_staff_payments', []);
  const [form, setForm] = useState({
    staffName: '', workDone: '', amount: 0, date: today,
    paymentType: 'Cash' as 'Cash' | 'UPI' | 'Bank Transfer',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffName || !form.workDone || !form.amount) { toast.error('Fill all fields'); return; }
    setPayments(prev => [...prev, { id: Date.now().toString(), ...form }]);
    setForm({ staffName: '', workDone: '', amount: 0, date: today, paymentType: 'Cash' });
    toast.success('Payment recorded');
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    toast.success('Deleted');
  };

  const todayPayments = payments.filter(p => p.date === today);
  const monthPayments = payments.filter(p => p.date.startsWith(currentMonth));
  const todayTotal = todayPayments.reduce((s, p) => s + p.amount, 0);
  const monthTotal = monthPayments.reduce((s, p) => s + p.amount, 0);

  // Staff-wise expense
  const staffExpense = monthPayments.reduce<Record<string, number>>((acc, p) => {
    acc[p.staffName] = (acc[p.staffName] || 0) + p.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">👷 Staff Payments</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Paid Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">₹{todayTotal.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monthly Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{monthTotal.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Record Payment</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Staff Name</Label><Input value={form.staffName} onChange={e => setForm(p => ({ ...p, staffName: e.target.value }))} required /></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div><Label>Work Done</Label><Input value={form.workDone} onChange={e => setForm(p => ({ ...p, workDone: e.target.value }))} placeholder="Room cleaning, night duty..." required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (₹)</Label><Input type="number" min={0} value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} required /></div>
              <div>
                <Label>Payment Type</Label>
                <Select value={form.paymentType} onValueChange={v => setForm(p => ({ ...p, paymentType: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">Record Payment</Button>
          </form>
        </CardContent>
      </Card>

      {Object.keys(staffExpense).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Staff Expense Report (This Month)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(staffExpense).map(([name, amt]) => (
                <div key={name} className="flex justify-between text-sm border-b pb-1">
                  <span>{name}</span>
                  <span className="font-bold">₹{amt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {todayPayments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Today's Payments</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Work</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayPayments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.staffName}</TableCell>
                    <TableCell>{p.workDone}</TableCell>
                    <TableCell className="font-bold">₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.paymentType}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deletePayment(p.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffPayments;
