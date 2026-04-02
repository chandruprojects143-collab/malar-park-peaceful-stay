import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { StaffMember, StaffWorkEntry, SalaryRecord } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

const StaffManagement = () => {
  const [staff, setStaff] = useLocalStorage<StaffMember[]>('malar_staff', []);
  const [workEntries, setWorkEntries] = useLocalStorage<StaffWorkEntry[]>('malar_staff_work', []);
  const [salaryRecords, setSalaryRecords] = useLocalStorage<SalaryRecord[]>('malar_salary', []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', phone: '', joiningDate: today, salary: 0, shiftTiming: 'Day' });

  const addStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) { toast.error('Fill required fields'); return; }
    setStaff(prev => [...prev, { id: Date.now().toString(), ...form }]);
    setForm({ name: '', role: '', phone: '', joiningDate: today, salary: 0, shiftTiming: 'Day' });
    setShowAdd(false);
    toast.success('Staff added');
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    toast.success('Staff removed');
  };

  const toggleWork = (staffId: string, field: keyof StaffWorkEntry) => {
    const existing = workEntries.find(w => w.staffId === staffId && w.date === today);
    if (existing) {
      setWorkEntries(prev => prev.map(w =>
        w.id === existing.id ? { ...w, [field]: !(w[field] as boolean) } : w
      ));
    } else {
      const entry: StaffWorkEntry = {
        id: Date.now().toString(), staffId, date: today,
        roomCleaning: false, laundryWork: false, receptionDuty: false,
        maintenance: false, nightShift: false, [field]: true,
      };
      setWorkEntries(prev => [...prev, entry]);
    }
  };

  const getWork = (staffId: string) =>
    workEntries.find(w => w.staffId === staffId && w.date === today);

  const workFields: { key: keyof StaffWorkEntry; label: string }[] = [
    { key: 'roomCleaning', label: '🧹 Room Cleaning' },
    { key: 'laundryWork', label: '🧺 Laundry' },
    { key: 'receptionDuty', label: '🏨 Reception' },
    { key: 'maintenance', label: '🔧 Maintenance' },
    { key: 'nightShift', label: '🌙 Night Shift' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">👨‍💼 Staff Management</h1>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add Staff</Button>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Staff List</TabsTrigger>
          <TabsTrigger value="work">Daily Work</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-3">
          {staff.length === 0 && <p className="text-muted-foreground text-sm">No staff added yet</p>}
          {staff.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 flex justify-between items-start">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-muted-foreground">{s.role} • {s.shiftTiming} Shift</div>
                  <div className="text-xs text-muted-foreground">📱 {s.phone} • Joined: {s.joiningDate}</div>
                  <div className="text-sm font-medium mt-1">Salary: ₹{s.salary.toLocaleString()}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteStaff(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="work" className="space-y-3">
          <p className="text-sm text-muted-foreground">Today's work tracking ({today})</p>
          {staff.map(s => {
            const work = getWork(s.id);
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="font-medium mb-2">{s.name} ({s.role})</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {workFields.map(f => (
                      <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={!!(work?.[f.key])}
                          onCheckedChange={() => toggleWork(s.id, f.key)}
                        />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="salary" className="space-y-3">
          {staff.map(s => {
            const records = salaryRecords.filter(r => r.staffId === s.id);
            const totalPaid = records.reduce((sum, r) => sum + r.salaryPaid, 0);
            const totalAdvance = records.reduce((sum, r) => sum + r.advance, 0);
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="font-medium">{s.name}</div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Monthly:</span>
                      <div className="font-bold">₹{s.salary.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid:</span>
                      <div className="font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Advance:</span>
                      <div className="font-bold text-yellow-600">₹{totalAdvance.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <form onSubmit={addStaff} className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div><Label>Role</Label><Input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Receptionist, Housekeeper..." required /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Joining Date</Label><Input type="date" value={form.joiningDate} onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))} /></div>
              <div><Label>Salary (₹)</Label><Input type="number" value={form.salary || ''} onChange={e => setForm(p => ({ ...p, salary: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Shift</Label><Input value={form.shiftTiming} onChange={e => setForm(p => ({ ...p, shiftTiming: e.target.value }))} placeholder="Day / Night / Rotating" /></div>
            <Button type="submit" className="w-full">Add Staff</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
