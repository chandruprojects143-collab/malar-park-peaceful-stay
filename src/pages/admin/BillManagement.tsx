import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { BillEntry } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

const getBillStatus = (bill: BillEntry): { label: string; color: string; emoji: string } => {
  if (bill.paid) return { label: 'Paid', color: 'bg-green-500', emoji: '🟢' };
  const due = new Date(bill.dueDate);
  const now = new Date();
  const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { label: 'Overdue', color: 'bg-red-500', emoji: '🔴' };
  if (daysUntil <= 7) return { label: 'Due Soon', color: 'bg-yellow-500', emoji: '🟡' };
  return { label: 'Pending', color: 'bg-red-500', emoji: '🔴' };
};

const defaultBillTypes = ['EB Bill', 'Property Tax', 'Water Bill', 'Internet Bill', 'Gas Bill', 'Maintenance Bill'];

const BillManagement = () => {
  const [bills, setBills] = useLocalStorage<BillEntry[]>('malar_bills', []);
  const [billTypes, setBillTypes] = useLocalStorage<string[]>('malar_bill_types', defaultBillTypes);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [newType, setNewType] = useState('');
  const [form, setForm] = useState({ billType: '', amount: 0, dueDate: '' });

  const addBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.billType || !form.amount || !form.dueDate) { toast.error('Fill all fields'); return; }
    setBills(prev => [...prev, { id: Date.now().toString(), ...form, paid: false }]);
    setForm({ billType: '', amount: 0, dueDate: '' });
    setShowAdd(false);
    toast.success('Bill added');
  };

  const markPaid = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, paid: true, paymentDate: today } : b));
    toast.success('Marked as paid');
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
    toast.success('Bill removed');
  };

  const addBillType = () => {
    if (!newType.trim()) return;
    if (billTypes.includes(newType.trim())) { toast.error('Type already exists'); return; }
    setBillTypes(prev => [...prev, newType.trim()]);
    setNewType('');
    setShowAddType(false);
    toast.success('Bill type added');
  };

  const removeBillType = (type: string) => {
    setBillTypes(prev => prev.filter(t => t !== type));
    toast.success('Bill type removed');
  };

  const pending = bills.filter(b => !b.paid);
  const paid = bills.filter(b => b.paid);
  const overdue = pending.filter(b => getBillStatus(b).emoji === '🔴');
  const dueSoon = pending.filter(b => getBillStatus(b).emoji === '🟡');
  const totalPending = pending.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">🧾 Bill Management</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAddType(true)}>Manage Types</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add Bill</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🔴 Overdue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{overdue.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🟡 Due Soon</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{dueSoon.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{totalPending.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🟢 Paid</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{paid.length}</div></CardContent>
        </Card>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Pending Bills</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pending.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(b => {
              const status = getBillStatus(b);
              return (
                <div key={b.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                  status.emoji === '🔴' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'
                }`}>
                  <div>
                    <div className="font-medium">{b.billType}</div>
                    <div className="text-sm text-muted-foreground">Due: {b.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">₹{b.amount.toLocaleString()}</span>
                    <Badge className={status.color}>{status.emoji} {status.label}</Badge>
                    <Button size="sm" variant="outline" onClick={() => markPaid(b.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Pay
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteBill(b.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {paid.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Paid Bills</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {paid.slice(0, 10).map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <span className="font-medium">{b.billType}</span>
                  <span className="text-muted-foreground ml-2">Paid: {b.paymentDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">₹{b.amount.toLocaleString()}</span>
                  <Badge className="bg-green-500">🟢 Paid</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Bill</DialogTitle></DialogHeader>
          <form onSubmit={addBill} className="space-y-3">
            <div>
              <Label>Bill Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.billType}
                onChange={e => setForm(p => ({ ...p, billType: e.target.value }))}
                required
              >
                <option value="">Select type</option>
                {billTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><Label>Amount (₹)</Label><Input type="number" min={0} value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} required /></div>
            <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} required /></div>
            <Button type="submit" className="w-full">Add Bill</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddType} onOpenChange={setShowAddType}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Bill Types</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input value={newType} onChange={e => setNewType(e.target.value)} placeholder="New bill type..." />
              <Button onClick={addBillType}>Add</Button>
            </div>
            <div className="space-y-1">
              {billTypes.map(t => (
                <div key={t} className="flex justify-between items-center text-sm border-b pb-1">
                  <span>{t}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeBillType(t)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillManagement;
