import { createBrowserRouter } from 'react-router';

// Placeholder pages — replaced in Phase 2 and 3
const HomePage = () => <div>Home (Phase 2)</div>;
const AdminHomePage = () => <div>Admin (Phase 2)</div>;
const LoginPage = () => <div>Login (Phase 3)</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
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
