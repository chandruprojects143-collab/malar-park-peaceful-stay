import { createContext, useContext, useState, ReactNode } from 'react';
import { AdminUser, UserRole } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: AdminUser | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  hasAccess: (module: string) => boolean;
}

const ADMIN_MODULES = [
  'dashboard', 'rooms', 'reviews', 'room-photos', 'gallery-photos',
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (password: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('verify_admin_login', {
      p_username: 'admin' as UserRole,
      p_password: password,
    });

    if (error || !data || data.length === 0) return false;

    const adminUser: AdminUser = { role: 'admin', name: 'Admin (Owner)' };
    setUser(adminUser);
    sessionStorage.setItem('admin_user', JSON.stringify(adminUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('admin_user');
  };

  const hasAccess = (module: string) => {
    if (!user) return false;
    return ADMIN_MODULES.includes(module);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
