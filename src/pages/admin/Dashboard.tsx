import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Room, Expense, CollectionEntry, LaundryEntry } from '@/types/admin';
import { BedDouble, IndianRupee, Receipt, Shirt } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.substring(0, 7);

const Dashboard = () => {
  const [rooms] = useLocalStorage<Room[]>('malar_rooms', []);
  const [expenses] = useLocalStorage<Expense[]>('malar_expenses', []);
  const [collections] = useLocalStorage<CollectionEntry[]>('malar_collections', []);
  const [laundry] = useLocalStorage<LaundryEntry[]>('malar_laundry', []);

  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const totalRooms = rooms.length || 12;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const todayExpenses = expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);

  const todayCollection = collections.filter(c => c.date === today).reduce((s, c) =>
    s + c.roomRent + c.upiPayment + c.cash + c.onlineBooking + c.extraCharges + c.laundryIncome, 0);
  const monthCollection = collections.filter(c => c.date.startsWith(currentMonth)).reduce((s, c) =>
    s + c.roomRent + c.upiPayment + c.cash + c.onlineBooking + c.extraCharges + c.laundryIncome, 0);

  const pendingLaundry = laundry.filter(l => l.status !== 'Delivered').length;

  const stats = [
    { title: 'Occupancy', value: `${occupancyRate}%`, sub: `${occupiedRooms}/${totalRooms} rooms`, icon: BedDouble, color: 'text-blue-600' },
    { title: "Today's Collection", value: `₹${todayCollection.toLocaleString()}`, sub: `Month: ₹${monthCollection.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600' },
    { title: "Today's Expenses", value: `₹${todayExpenses.toLocaleString()}`, sub: `Month: ₹${monthExpenses.toLocaleString()}`, icon: Receipt, color: 'text-red-600' },
    { title: 'Pending Laundry', value: pendingLaundry.toString(), sub: 'items pending', icon: Shirt, color: 'text-yellow-600' },
  ];

  const profit = monthCollection - monthExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Profit / Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Revenue: ₹{monthCollection.toLocaleString()} — Expenses: ₹{monthExpenses.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
