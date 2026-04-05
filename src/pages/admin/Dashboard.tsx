import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Room, BookingEntry, LaundryEntry, StaffPayment, MaintenanceActivity, BillEntry } from '@/types/admin';
import {
  BedDouble, IndianRupee, Shirt, Wrench, Receipt, Bell, AlertTriangle,
  ClipboardList, CreditCard, Zap, BarChart3, Users, LayoutDashboard, Search
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.substring(0, 7);

const frequencyDays: Record<string, number> = {
  'Daily': 1, 'Weekly': 7, 'Monthly': 30, 'Every 3 Months': 90,
};

const getActivityStatus = (lastCompleted: string, frequency: string) => {
  if (!lastCompleted) return 'overdue';
  const daysSince = Math.floor((Date.now() - new Date(lastCompleted).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince >= (frequencyDays[frequency] || 30)) return 'overdue';
  if (daysSince >= (frequencyDays[frequency] || 30) * 0.8) return 'due';
  return 'ok';
};

const moduleItems = [
  { title: 'Reception', url: '/admin/reception', icon: ClipboardList, module: 'reception', color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Room Status', url: '/admin/rooms', icon: BedDouble, module: 'rooms', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Room Prices', url: '/admin/room-prices', icon: CreditCard, module: 'room-prices', color: 'text-violet-600', bg: 'bg-violet-50' },
  { title: 'Collection', url: '/admin/collection', icon: IndianRupee, module: 'collection', color: 'text-green-600', bg: 'bg-green-50' },
  { title: 'Laundry', url: '/admin/laundry', icon: Shirt, module: 'laundry', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { title: 'Maintenance', url: '/admin/maintenance', icon: Wrench, module: 'maintenance', color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: 'Staff Payments', url: '/admin/staff-payments', icon: Users, module: 'staff-payments', color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'Bills', url: '/admin/bills', icon: Bell, module: 'bills', color: 'text-red-600', bg: 'bg-red-50' },
  { title: 'Expenses', url: '/admin/expenses', icon: Receipt, module: 'expenses', color: 'text-pink-600', bg: 'bg-pink-50' },
  { title: 'Staff', url: '/admin/staff', icon: Users, module: 'staff', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Utilities', url: '/admin/utilities', icon: Zap, module: 'utilities', color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3, module: 'reports', color: 'text-teal-600', bg: 'bg-teal-50' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasAccess } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms] = useLocalStorage<Room[]>('malar_rooms', []);
  const [bookings] = useLocalStorage<BookingEntry[]>('malar_bookings', []);
  const [laundry] = useLocalStorage<LaundryEntry[]>('malar_laundry', []);
  const [staffPayments] = useLocalStorage<StaffPayment[]>('malar_staff_payments', []);
  const [activities] = useLocalStorage<MaintenanceActivity[]>('malar_maintenance', []);
  const [bills] = useLocalStorage<BillEntry[]>('malar_bills', []);

  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const totalRooms = rooms.length || 12;
  const availableRooms = rooms.filter(r => r.status === 'available').length;

  const todayCollection = bookings.filter(b => b.date === today).reduce((s, b) => s + b.advance, 0);
  const monthRevenue = bookings.filter(b => b.date.startsWith(currentMonth)).reduce((s, b) => s + b.roomPrice, 0);

  const pendingLaundry = laundry.filter(l => l.status !== 'Delivered').length;
  const todayStaffPayments = staffPayments.filter(p => p.date === today).reduce((s, p) => s + p.amount, 0);

  const overdueActivities = activities.filter(a => getActivityStatus(a.lastCompleted, a.frequency) === 'overdue');
  const pendingBills = bills.filter(b => !b.paid);
  const overdueBills = pendingBills.filter(b => new Date(b.dueDate) < new Date());

  const notifications: { text: string; type: 'danger' | 'warning' }[] = [];
  if (pendingLaundry > 0) notifications.push({ text: `🧺 ${pendingLaundry} laundry items pending`, type: 'warning' });
  overdueBills.forEach(b => notifications.push({ text: `🔴 ${b.billType} — ₹${b.amount.toLocaleString()} overdue`, type: 'danger' }));
  overdueActivities.forEach(a => notifications.push({ text: `🔴 ${a.name} — cleaning overdue`, type: 'danger' }));
  if (todayStaffPayments > 0) notifications.push({ text: `👷 Staff payments today: ₹${todayStaffPayments.toLocaleString()}`, type: 'warning' });

  const stats = [
    { title: 'Today Collection', value: `₹${todayCollection.toLocaleString()}`, sub: `Month: ₹${monthRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600' },
    { title: 'Room Availability', value: `${availableRooms}/${totalRooms}`, sub: `${occupiedRooms} occupied`, icon: BedDouble, color: 'text-blue-600' },
    { title: 'Pending Laundry', value: pendingLaundry.toString(), sub: 'items pending', icon: Shirt, color: 'text-yellow-600' },
    { title: 'Staff Payments', value: `₹${todayStaffPayments.toLocaleString()}`, sub: 'paid today', icon: Receipt, color: 'text-purple-600' },
    { title: 'Pending Bills', value: pendingBills.length.toString(), sub: `${overdueBills.length} overdue`, icon: AlertTriangle, color: 'text-red-600' },
    { title: 'Maintenance Alerts', value: overdueActivities.length.toString(), sub: 'overdue tasks', icon: Wrench, color: 'text-orange-600' },
  ];

  const visibleModules = moduleItems.filter(m => hasAccess(m.module));
  const filteredModules = visibleModules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">📊 Owner Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <s.icon className={`w-4 h-4 ${s.color}`} /> {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> 🔔 Notification Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <div key={i} className={`text-sm p-2 rounded ${
                  n.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {n.text}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module Navigation Tiles */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-lg font-semibold">📁 Modules</h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredModules.map(m => (
            <Card
              key={m.url}
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-primary/30"
              onClick={() => navigate(m.url)}
            >
              <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
                <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <span className="text-sm font-medium">{m.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Today's Bookings</CardTitle></CardHeader>
          <CardContent>
            {bookings.filter(b => b.date === today).length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings today</p>
            ) : (
              <div className="space-y-2">
                {bookings.filter(b => b.date === today).map(b => (
                  <div key={b.id} className="flex justify-between text-sm border-b pb-1">
                    <span>Room #{b.roomNumber} — {b.guestName}</span>
                    <span className="font-bold">₹{b.advance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Room Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Available: {availableRooms}</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Occupied: {occupiedRooms}</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Cleaning: {rooms.filter(r => r.status === 'cleaning').length}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
