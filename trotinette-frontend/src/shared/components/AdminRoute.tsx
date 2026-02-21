import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../features/auth/store';

/**
 * AdminRoute — redirects unauthenticated users to /login, non-admins to /products.
 * Wrap all /admin/* routes inside this layout route.
 */
export function AdminRoute() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && user.role !== 'global_admin') {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
}
