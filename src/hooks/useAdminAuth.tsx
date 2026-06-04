import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export type AppRole = 'owner' | 'admin' | 'staff';

export interface SessionUser {
  id: string;
  email: string | null;
  name: string;
  role: AppRole | null;
}

interface AuthContextType {
  user: SessionUser | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasAccess: (module: string) => boolean;
}

const ACCESS_MAP: Record<AppRole, string[] | '*'> = {
  owner: '*',
  admin: '*',
  staff: ['dashboard', 'reception', 'rooms', 'collection', 'laundry', 'maintenance'],
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase
    .from('user_roles' as any)
    .select('role')
    .eq('user_id', userId);
  const roles = ((data ?? []) as unknown as { role: AppRole }[]).map(r => r.role);
  if (roles.includes('owner')) return 'owner';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('staff')) return 'staff';
  return null;
}

function toSessionUser(u: User, role: AppRole | null): SessionUser {
  return {
    id: u.id,
    email: u.email ?? null,
    name: (u.user_metadata?.full_name as string) || u.email || 'User',
    role,
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener first (sync), then load existing session
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // Defer role fetch to avoid deadlock inside the auth callback
        setTimeout(async () => {
          const role = await fetchRole(s.user.id);
          setUser(toSessionUser(s.user, role));
        }, 0);
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        const role = await fetchRole(data.session.user.id);
        setUser(toSessionUser(data.session.user, role));
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const hasAccess = (module: string) => {
    if (!user?.role) return false;
    const allowed = ACCESS_MAP[user.role];
    return allowed === '*' || allowed.includes(module);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
