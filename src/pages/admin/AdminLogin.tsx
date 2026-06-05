import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { UserRole } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Brush } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const roles: { value: UserRole; label: string; icon: any; desc: string }[] = [
  { value: 'admin', label: 'Admin (Owner)', icon: Shield, desc: 'Full access to all modules' },
  { value: 'reception', label: 'Reception', icon: User, desc: 'Booking, Collection, Laundry' },
  { value: 'housekeeping', label: 'Housekeeping', icon: Brush, desc: 'Room cleaning status' },
];

const AdminLogin = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [password, setPassword] = useState('');
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(selectedRole, password)) {
      toast.success(`Logged in as ${selectedRole}`);
      navigate('/admin');
    } else {
      toast.error('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading text-primary">🏨 Malar Park Staff Login</CardTitle>
          <p className="text-sm text-muted-foreground">Select your role and enter password</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedRole === r.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <r.icon className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-xs font-medium">{r.label}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {roles.find(r => r.value === selectedRole)?.desc}
            </p>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter staff password"
                required
              />
            </div>
            <Button type="submit" className="w-full">Login</Button>
            <a href="/" className="block text-center text-sm text-muted-foreground hover:text-primary">
              ← Back to Website
            </a>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
