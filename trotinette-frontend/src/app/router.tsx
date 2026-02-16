import { createBrowserRouter, Navigate } from 'react-router';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { ProductDetailPage } from '../features/catalog/pages/ProductDetailPage';
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage';
import { AdminProductEditPage } from '../features/admin/pages/AdminProductEditPage';
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage';

// Placeholder pages — replaced in Phase 3
const AdminHomePage = () => <div>Admin (Phase 3)</div>;
const LoginPage = () => <div>Login (Phase 3)</div>;

export const router = createBrowserRouter([
  {
    // Home redirects to the product catalog (primary customer experience)
    path: '/',
    element: <Navigate to="/products" replace />,
  },
  {
    path: '/products',
    element: <CatalogPage />,
  },
  {
    path: '/products/:slug',
    element: <ProductDetailPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AdminHomePage />,
  },
  // Admin product management (02-03)
  {
    path: '/admin/products',
    element: <AdminProductsPage />,
  },
  {
    path: '/admin/products/create',
    element: <AdminProductEditPage />,
  },
  {
    path: '/admin/products/:id/edit',
    element: <AdminProductEditPage />,
  },
  {
    path: '/admin/categories',
    element: <AdminCategoriesPage />,
  },
]);
