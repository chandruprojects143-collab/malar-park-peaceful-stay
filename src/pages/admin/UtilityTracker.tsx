import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UtilityBill, UtilityType } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const utilityTypes: { type: UtilityType; emoji: string }[] = [
  { type: 'Electricity', emoji: '⚡' },
  { type: 'Water', emoji: '💧' },
  { type: 'Internet', emoji: '🌐' },
  { type: 'Gas', emoji: '🔥' },
];

const UtilityTracker = () => {
  const [bills, setBills] = useLocalStorage<UtilityBill[]>('malar_utilities', []);
  const [activeType, setActiveType] = useState<UtilityType>('Electricity');
  const [form, setForm] = useState({
    readingStart: 0, readingEnd: 0, amount: 0, paymentDate: new Date().toISOString().split('T')[0],
    month: new Date().toISOString().substring(0, 7),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const units = form.readingEnd - form.readingStart;
    if (units < 0) { toast.error('End reading must be greater'); return; }
    const bill: UtilityBill = {
      id: Date.now().toString(),
      type: activeType,
      ...form,
      unitsUsed: units,
    };
    setBills(prev => [...prev, bill]);
    setForm({ readingStart: 0, readingEnd: 0, amount: 0, paymentDate: new Date().toISOString().split('T')[0], month: new Date().toISOString().substring(0, 7) });
    toast.success(`${activeType} bill added`);
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
    toast.success('Deleted');
  };

  const typeBills = bills.filter(b => b.type === activeType).sort((a, b) => b.month.localeCompare(a.month));
  const yearTotal = bills.filter(b => b.type === activeType && b.month.startsWith(new Date().getFullYear().toString()))
    .reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">⚡ Utility Bills</h1>

      <Tabs value={activeType} onValueChange={v => setActiveType(v as UtilityType)}>
        <TabsList className="grid grid-cols-4">
          {utilityTypes.map(u => (
            <TabsTrigger key={u.type} value={u.type}>{u.emoji} {u.type}</TabsTrigger>
          ))}
        </TabsList>

        {utilityTypes.map(u => (
          <TabsContent key={u.type} value={u.type} className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Year Total ({u.type})</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">₹{yearTotal.toLocaleString()}</div></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Add {u.emoji} {u.type} Bill</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Month</Label><Input type="month" value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} /></div>
                    <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Reading Start</Label><Input type="number" min={0} value={form.readingStart || ''} onChange={e => setForm(p => ({ ...p, readingStart: Number(e.target.value) }))} /></div>
                    <div><Label>Reading End</Label><Input type="number" min={0} value={form.readingEnd || ''} onChange={e => setForm(p => ({ ...p, readingEnd: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Units: {Math.max(0, form.readingEnd - form.readingStart)}
                  </div>
                  <div><Label>Amount (₹)</Label><Input type="number" min={0} value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} /></div>
                  <Button type="submit" className="w-full">Add Bill</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>History</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {typeBills.length === 0 && <p className="text-sm text-muted-foreground">No bills recorded</p>}
                {typeBills.map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div>
                      <span className="font-medium">{b.month}</span>
                      <span className="text-muted-foreground ml-2">{b.unitsUsed} units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">₹{b.amount.toLocaleString()}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteBill(b.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UtilityTracker;
