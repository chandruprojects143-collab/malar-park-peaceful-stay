import { createContext, useContext, useState, ReactNode } from 'react';
import { AdminUser, UserRole } from '@/types/admin';
import { setAdminWritePassword, clearAdminWritePassword } from '@/lib/adminWrite';

const PASSWORDS: Record<UserRole, string> = {
  admin: 'malar2024',
  reception: 'reception2024',
  housekeeping: 'housekeeping2024',
};

const ROLE_NAMES: Record<UserRole, string> = {
  admin: 'Admin (Owner)',
  reception: 'Reception',
  housekeeping: 'Housekeeping',
};

interface AuthContextType {
  user: AdminUser | null;
  login: (role: UserRole, password: string) => boolean;
  logout: () => void;
  hasAccess: (module: string) => boolean;
}

const ACCESS_MAP: Record<UserRole, string[]> = {
  admin: [
    'dashboard', 'reception', 'rooms', 'room-prices', 'collection', 'expenses',
    'staff', 'laundry', 'maintenance', 'staff-payments', 'bills', 'utilities', 'reports',
    'room-photos', 'gallery-photos', 'availability', 'content'
  ],
  reception: ['dashboard', 'reception', 'rooms', 'collection', 'laundry'],
  housekeeping: ['rooms', 'maintenance'],
};


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

  const login = (role: UserRole, password: string) => {
    if (PASSWORDS[role] === password) {
      const adminUser: AdminUser = { role, name: ROLE_NAMES[role] };
      setUser(adminUser);
      sessionStorage.setItem('admin_user', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('admin_user');
  };

  const hasAccess = (module: string) => {
    if (!user) return false;
    return ACCESS_MAP[user.role]?.includes(module) ?? false;
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
