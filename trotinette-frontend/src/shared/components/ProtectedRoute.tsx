import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../features/auth/store';

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Wrap routes that require authentication inside this layout route.
 */
export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
