import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/admin/login" replace />;

  const isRoot = location.pathname === '/admin';

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="h-12 flex items-center justify-between border-b px-4 bg-card shrink-0">
        <div className="flex items-center gap-2">
          {!isRoot && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <span className="text-sm font-medium text-muted-foreground">🏨 Malar Park Admin — {user.name}</span>
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
