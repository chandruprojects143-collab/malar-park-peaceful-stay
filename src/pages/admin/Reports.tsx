import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Room, Expense, CollectionEntry, LaundryEntry, StaffMember, SalaryRecord } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const currentMonth = new Date().toISOString().substring(0, 7);
const COLORS = ['#0F5B4C', '#D4AF37', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

const Reports = () => {
  const [rooms] = useLocalStorage<Room[]>('malar_rooms', []);
  const [expenses] = useLocalStorage<Expense[]>('malar_expenses', []);
  const [collections] = useLocalStorage<CollectionEntry[]>('malar_collections', []);
  const [laundry] = useLocalStorage<LaundryEntry[]>('malar_laundry', []);
  const [staff] = useLocalStorage<StaffMember[]>('malar_staff', []);
  const [salaryRecords] = useLocalStorage<SalaryRecord[]>('malar_salary', []);

  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const monthCollections = collections.filter(c => c.date.startsWith(currentMonth));

  const totalRevenue = monthCollections.reduce((s, c) =>
    s + c.roomRent + c.upiPayment + c.cash + c.onlineBooking + c.extraCharges + c.laundryIncome, 0);
  const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // Expense by category
  const categoryData = monthExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Daily revenue for bar chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const dailyRevenue = last7Days.map(date => {
    const dayCollections = collections.filter(c => c.date === date);
    const rev = dayCollections.reduce((s, c) =>
      s + c.roomRent + c.upiPayment + c.cash + c.onlineBooking + c.extraCharges + c.laundryIncome, 0);
    const exp = expenses.filter(e => e.date === date).reduce((s, e) => s + e.amount, 0);
    return { date: date.substring(5), revenue: rev, expense: exp };
  });

  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const totalRooms = rooms.length || 12;
  const laundryIncome = laundry.filter(l => l.date.startsWith(currentMonth) && l.status === 'Delivered')
    .reduce((s, l) => s + l.totalAmount, 0);

  const totalSalary = staff.reduce((s, st) => s + st.salary, 0);
  const paidSalary = salaryRecords.filter(r => r.month === currentMonth).reduce((s, r) => s + r.salaryPaid, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">📈 Reports</h1>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Monthly Revenue</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Monthly Expenses</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Profit</CardTitle></CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${totalRevenue - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(totalRevenue - totalExpense).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Occupancy</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{Math.round((occupiedRooms / totalRooms) * 100)}%</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Last 7 Days — Revenue vs Expenses</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#0F5B4C" name="Revenue" />
                  <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Laundry Income</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">₹{laundryIncome.toLocaleString()}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Room Occupancy</CardTitle></CardHeader>
              <CardContent><div className="text-xl font-bold">{occupiedRooms}/{totalRooms}</div></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Expense Breakdown</CardTitle></CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No expense data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Staff Salary Report</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm font-medium border-b pb-2">
                <span>Total Monthly Salary</span>
                <span>₹{totalSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid This Month</span>
                <span className="text-green-600">₹{paidSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="text-red-600">₹{(totalSalary - paidSalary).toLocaleString()}</span>
              </div>
              {staff.map(s => (
                <div key={s.id} className="flex justify-between text-sm border-t pt-1">
                  <span>{s.name} ({s.role})</span>
                  <span>₹{s.salary.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
