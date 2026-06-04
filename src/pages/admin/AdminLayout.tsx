import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const { user, loading, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!user.role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h2 className="text-xl font-semibold">No role assigned</h2>
        <p className="text-muted-foreground max-w-md">
          Your account ({user.email}) is signed in but has no role yet. Ask the Owner to grant you access.
        </p>
        <Button variant="outline" onClick={logout}>Sign out</Button>
      </div>
    );
  }

  const isRoot = location.pathname === '/admin';
  const roleLabel = user.role === 'owner' ? 'Owner' : user.role === 'admin' ? 'Admin' : 'Staff';

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="h-12 flex items-center justify-between border-b px-4 bg-card shrink-0">
        <div className="flex items-center gap-2">
          {!isRoot && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <span className="text-sm font-medium text-muted-foreground">🏨 Malar Park {roleLabel} — {user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="/">Back to Site</a>
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
