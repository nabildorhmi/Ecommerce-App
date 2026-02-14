import { createBrowserRouter } from 'react-router';
import { RtlSmokeTest } from '../shared/components/RtlSmokeTest';

// Placeholder pages — replaced in Phase 2 and 3
const AdminHomePage = () => <div>Admin (Phase 2)</div>;
const LoginPage = () => <div>Login (Phase 3)</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RtlSmokeTest />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AdminHomePage />,
  },
]);
