import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, ExpenseCategory } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const categories: ExpenseCategory[] = [
  'Laundry Expense', 'EB Bill', 'Water Bill', 'Cleaning Materials',
  'Staff Food', 'Maintenance', 'Salary Payment', 'Daily Wages', 'Transport', 'Other Expense'
];

const categoryEmoji: Record<ExpenseCategory, string> = {
  'Laundry Expense': '🧺', 'EB Bill': '⚡', 'Water Bill': '💧',
  'Cleaning Materials': '🧹', 'Staff Food': '🍽️', 'Maintenance': '🔧',
  'Salary Payment': '💰', 'Daily Wages': '👷', 'Transport': '🚕', 'Other Expense': '📦',
};

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.substring(0, 7);

const ExpenseManager = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('malar_expenses', []);
  const { user } = useAdminAuth();
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<ExpenseCategory>('Other Expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) { toast.error('Fill all fields'); return; }
    const entry: Expense = {
      id: Date.now().toString(), date, category, description,
      amount, paymentMode, enteredBy: user?.name ?? 'Unknown',
    };
    setExpenses(prev => [...prev, entry]);
    setDescription('');
    setAmount(0);
    toast.success('Expense added');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success('Deleted');
  };

  const todayTotal = expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
  const monthTotal = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);

  const recentExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">📊 Daily Accounts</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today's Expenses</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">₹{todayTotal.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Monthly Expenses</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{monthTotal.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Expense</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={v => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{categoryEmoji[c]} {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What was this expense for?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" min={0} value={amount || ''} onChange={e => setAmount(Number(e.target.value))} />
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Select value={paymentMode} onValueChange={v => setPaymentMode(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">Add Expense</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Expenses</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentExpenses.length === 0 && <p className="text-sm text-muted-foreground">No expenses yet</p>}
            {recentExpenses.map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <span className="mr-2">{categoryEmoji[e.category]}</span>
                  <span className="font-medium">{e.description}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{e.date} • {e.paymentMode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600">₹{e.amount.toLocaleString()}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteExpense(e.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManager;
