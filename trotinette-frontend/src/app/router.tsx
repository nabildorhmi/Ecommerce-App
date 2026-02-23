import { createBrowserRouter } from 'react-router';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { ProductDetailPage } from '../features/catalog/pages/ProductDetailPage';
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage';
import { AdminProductEditPage } from '../features/admin/pages/AdminProductEditPage';
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AdminUserDetailPage } from '../features/admin/pages/AdminUserDetailPage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { AdminRoute } from '../shared/components/AdminRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage';
import { OrderConfirmationPage } from '../features/checkout/pages/OrderConfirmationPage';
import { MyOrdersPage } from '../features/orders/pages/MyOrdersPage';
import { AdminOrdersPage } from '../features/orders/pages/AdminOrdersPage';
import { AdminOrderDetailPage } from '../features/orders/pages/AdminOrderDetailPage';
import { AdminPagesPage } from '../features/admin/pages/AdminPagesPage';
import { AdminVariationTypesPage } from '../features/admin/pages/AdminVariationTypesPage';
import { RootLayout } from '../shared/components/RootLayout';
import { HomePage } from '../features/home/pages/HomePage';
import { AboutPage } from '../features/info/pages/AboutPage';
import { ContactPage } from '../features/info/pages/ContactPage';
import { CgvPage } from '../features/info/pages/CgvPage';
import { MentionsLegalesPage } from '../features/info/pages/MentionsLegalesPage';

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
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/orders/:orderNumber/confirmation',
        element: <OrderConfirmationPage />,
      },
      {
        path: '/a-propos',
        element: <AboutPage />,
      },
      {
        path: '/contact',
        element: <ContactPage />,
      },
      {
        path: '/cgv',
        element: <CgvPage />,
      },
      {
        path: '/mentions-legales',
        element: <MentionsLegalesPage />,
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
            element: <AdminDashboardPage />,
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
            path: '/admin/pages',
            element: <AdminPagesPage />,
          },
          {
            path: '/admin/variation-types',
            element: <AdminVariationTypesPage />,
          },
        ],
      },
    ],
  },
]);
