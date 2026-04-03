import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MaintenanceActivity, ActivityFrequency } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];

const frequencyDays: Record<ActivityFrequency, number> = {
  'Daily': 1,
  'Weekly': 7,
  'Monthly': 30,
  'Every 3 Months': 90,
};

const getActivityStatus = (lastCompleted: string, frequency: ActivityFrequency): { label: string; color: string; emoji: string } => {
  if (!lastCompleted) return { label: 'NOT COMPLETED', color: 'bg-red-500', emoji: '🔴' };
  const last = new Date(lastCompleted);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  const maxDays = frequencyDays[frequency];
  if (daysSince >= maxDays) return { label: 'NOT COMPLETED', color: 'bg-red-500', emoji: '🔴' };
  if (daysSince >= maxDays * 0.8) return { label: 'Due Soon', color: 'bg-yellow-500', emoji: '🟡' };
  return { label: 'Completed', color: 'bg-green-500', emoji: '🟢' };
};

const defaultActivities: MaintenanceActivity[] = [
  { id: '1', name: 'Window Cleaning', frequency: 'Weekly', assignedStaff: '', lastCompleted: '' },
  { id: '2', name: 'AC Cleaning', frequency: 'Monthly', assignedStaff: '', lastCompleted: '' },
  { id: '3', name: 'Tank Cleaning', frequency: 'Every 3 Months', assignedStaff: '', lastCompleted: '' },
  { id: '4', name: 'Switch Cleaning', frequency: 'Weekly', assignedStaff: '', lastCompleted: '' },
  { id: '5', name: 'Deep Room Cleaning', frequency: 'Monthly', assignedStaff: '', lastCompleted: '' },
  { id: '6', name: 'Mattress Cleaning', frequency: 'Every 3 Months', assignedStaff: '', lastCompleted: '' },
];

const MaintenanceActivities = () => {
  const [activities, setActivities] = useLocalStorage<MaintenanceActivity[]>('malar_maintenance', defaultActivities);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', frequency: 'Weekly' as ActivityFrequency, assignedStaff: '' });

  const addActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error('Enter activity name'); return; }
    setActivities(prev => [...prev, { id: Date.now().toString(), ...form, lastCompleted: '' }]);
    setForm({ name: '', frequency: 'Weekly', assignedStaff: '' });
    setShowAdd(false);
    toast.success('Activity added');
  };

  const markCompleted = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, lastCompleted: today } : a));
    toast.success('Marked as completed');
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success('Activity removed');
  };

  const overdue = activities.filter(a => getActivityStatus(a.lastCompleted, a.frequency).emoji === '🔴');
  const dueSoon = activities.filter(a => getActivityStatus(a.lastCompleted, a.frequency).emoji === '🟡');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">🧹 Maintenance Activities</h1>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add Activity</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🔴 Overdue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{overdue.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🟡 Due Soon</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{dueSoon.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{activities.length}</div></CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {activities.map(a => {
          const status = getActivityStatus(a.lastCompleted, a.frequency);
          return (
            <Card key={a.id} className={`border-l-4 ${
              status.emoji === '🔴' ? 'border-l-red-500' :
              status.emoji === '🟡' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {a.frequency} {a.assignedStaff && `• ${a.assignedStaff}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last: {a.lastCompleted || 'Never'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={status.color}>{status.emoji} {status.label}</Badge>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => markCompleted(a.id)}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Done
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteActivity(a.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Maintenance Activity</DialogTitle></DialogHeader>
          <form onSubmit={addActivity} className="space-y-3">
            <div><Label>Activity Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="AC Cleaning" required /></div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v as ActivityFrequency }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Every 3 Months">Every 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Assigned Staff</Label><Input value={form.assignedStaff} onChange={e => setForm(p => ({ ...p, assignedStaff: e.target.value }))} placeholder="Staff name (optional)" /></div>
            <Button type="submit" className="w-full">Add Activity</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceActivities;
