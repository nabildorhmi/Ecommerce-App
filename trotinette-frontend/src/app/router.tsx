import { createBrowserRouter, Navigate } from 'react-router';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { ProductDetailPage } from '../features/catalog/pages/ProductDetailPage';
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage';
import { AdminProductEditPage } from '../features/admin/pages/AdminProductEditPage';
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AdminUserDetailPage } from '../features/admin/pages/AdminUserDetailPage';
import { AdminDeliveryZonesPage } from '../features/admin/pages/AdminDeliveryZonesPage';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { AdminRoute } from '../shared/components/AdminRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage';
import { OrderConfirmationPage } from '../features/checkout/pages/OrderConfirmationPage';
import { MyOrdersPage } from '../features/orders/pages/MyOrdersPage';
import { AdminOrdersPage } from '../features/orders/pages/AdminOrdersPage';
import { AdminOrderDetailPage } from '../features/orders/pages/AdminOrderDetailPage';
import { RootLayout } from '../shared/components/RootLayout';
import { HomePage } from '../features/home/pages/HomePage';

// Admin home — redirect to product list (primary admin landing)
const AdminHomePage = () => <Navigate to="/admin/products" replace />;

export const router = createBrowserRouter([
  {
    // Root layout wraps all routes with the Navbar
    element: <RootLayout />,
    children: [
      {
        // Homepage — MiraiTech landing page with hero + featured carousel
        path: '/',
        element: <HomePage />,
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
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/orders/:orderNumber/confirmation',
        element: <OrderConfirmationPage />,
      },
      // Protected routes — require authentication
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/orders',
            element: <MyOrdersPage />,
          },
        ],
      },
      // Admin routes — require admin role
      {
        element: <AdminRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminHomePage />,
          },
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
          {
            path: '/admin/users',
            element: <AdminUsersPage />,
          },
          {
            path: '/admin/users/:id',
            element: <AdminUserDetailPage />,
          },
          {
            path: '/admin/orders',
            element: <AdminOrdersPage />,
          },
          {
            path: '/admin/orders/:id',
            element: <AdminOrderDetailPage />,
          },
          {
            path: '/admin/delivery-zones',
            element: <AdminDeliveryZonesPage />,
          },
        ],
      },
    ],
  },
]);
