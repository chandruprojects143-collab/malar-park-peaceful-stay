import { ReactNode } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Navigate } from "react-router-dom";

/**
 * Legacy wrapper retained for backwards compatibility.
 * Real protection now lives in <AdminLayout/> (auth + owner role check).
 * This component just ensures the wrapped page is only shown to signed-in
 * users with sufficient role; otherwise it redirects to login.
 */
export function AdminPasswordGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAdminAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'owner' && user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto mt-12 text-center text-muted-foreground">
        You need the Owner role to access this section.
      </div>
    );
  }
  return <>{children}</>;
}
