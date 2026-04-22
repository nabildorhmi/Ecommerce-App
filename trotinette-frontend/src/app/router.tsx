/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, useRouteError } from 'react-router';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AdminRoute } from '@/shared/components/AdminRoute';
import { RootLayout } from '@/shared/components/RootLayout';
import { PageLoader } from '@/shared/components/PageLoader';

function RouteErrorPage() {
  const error = useRouteError();
  const isChunkError =
    error instanceof Error && error.message.toLowerCase().includes('failed to fetch');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        backgroundColor: '#0c0c14',
        color: '#E8ECF2',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚡</div>
      <h2 style={{ margin: 0, fontWeight: 800, color: '#00C2FF' }}>
        {isChunkError ? 'Erreur de chargement' : 'Une erreur est survenue'}
      </h2>
      <p style={{ margin: 0, color: '#8A919D', maxWidth: 360, fontSize: '0.9rem' }}>
        {isChunkError
          ? 'Le module n\'a pas pu être chargé. Cela arrive parfois après une mise à jour. Rafraîchissez la page.'
          : 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '8px',
          padding: '12px 28px',
          background: '#00C2FF',
          color: '#0c0c14',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          letterSpacing: '0.06em',
        }}
      >
        Rafraîchir la page
      </button>
    </div>
  );
}

// Lazy-loaded page components
const HomePage = lazy(() => import('@/features/home/pages/HomePage').then(m => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('@/features/catalog/pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const ProductDetailPage = lazy(() => import('@/features/catalog/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('@/features/checkout/pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const MyOrdersPage = lazy(() => import('@/features/orders/pages/MyOrdersPage').then(m => ({ default: m.MyOrdersPage })));
const AboutPage = lazy(() => import('@/features/info/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/features/info/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const CgvPage = lazy(() => import('@/features/info/pages/CgvPage').then(m => ({ default: m.CgvPage })));
const MentionsLegalesPage = lazy(() => import('@/features/info/pages/MentionsLegalesPage').then(m => ({ default: m.MentionsLegalesPage })));
const DynamicPage = lazy(() => import('@/features/info/pages/DynamicPage').then(m => ({ default: m.DynamicPage })));

// Admin layout + pages
const AdminLayout = lazy(() => import('@/shared/components/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('@/features/admin/pages/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminProductEditPage = lazy(() => import('@/features/admin/pages/AdminProductEditPage').then(m => ({ default: m.AdminProductEditPage })));
const AdminCategoriesPage = lazy(() => import('@/features/admin/pages/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminUserDetailPage = lazy(() => import('@/features/admin/pages/AdminUserDetailPage').then(m => ({ default: m.AdminUserDetailPage })));
const AdminOrdersPage = lazy(() => import('@/features/orders/pages/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('@/features/orders/pages/AdminOrderDetailPage').then(m => ({ default: m.AdminOrderDetailPage })));
const AdminPagesPage = lazy(() => import('@/features/admin/pages/AdminPagesPage').then(m => ({ default: m.AdminPagesPage })));
const AdminVariationTypesPage = lazy(() => import('@/features/admin/pages/AdminVariationTypesPage').then(m => ({ default: m.AdminVariationTypesPage })));
const AdminHeroBannersPage = lazy(() => import('@/features/admin/pages/AdminHeroBannersPage').then(m => ({ default: m.AdminHeroBannersPage })));
const AdminSiteSettingsPage = lazy(() => import('@/features/admin/pages/AdminSiteSettingsPage').then(m => ({ default: m.AdminSiteSettingsPage })));

export const router = createBrowserRouter([
  {
    // Root layout wraps all routes with the Navbar
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        // Homepage — MiraiTech landing page with hero + featured carousel
        path: '/',
        element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense>,
      },
      {
        path: '/products',
        element: <Suspense fallback={<PageLoader />}><CatalogPage /></Suspense>,
      },
      {
        path: '/products/:slug',
        element: <Suspense fallback={<PageLoader />}><ProductDetailPage /></Suspense>,
      },
      {
        path: '/login',
        element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
      },
      {
        path: '/forgot-password',
        element: <Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>,
      },
      {
        path: '/reset-password',
        element: <Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>,
      },
      {
        path: '/checkout',
        element: <Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>,
      },
      {
        path: '/orders/:orderNumber/confirmation',
        element: <Suspense fallback={<PageLoader />}><OrderConfirmationPage /></Suspense>,
      },
      {
        path: '/a-propos',
        element: <Suspense fallback={<PageLoader />}><AboutPage /></Suspense>,
      },
      {
        path: '/contact',
        element: <Suspense fallback={<PageLoader />}><ContactPage /></Suspense>,
      },
      {
        path: '/cgv',
        element: <Suspense fallback={<PageLoader />}><CgvPage /></Suspense>,
      },
      {
        path: '/mentions-legales',
        element: <Suspense fallback={<PageLoader />}><MentionsLegalesPage /></Suspense>,
      },
      {
        path: '/pages/:slug',
        element: <Suspense fallback={<PageLoader />}><DynamicPage /></Suspense>,
      },
      // Protected routes — require authentication
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/profile',
            element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>,
          },
          {
            path: '/orders',
            element: <Suspense fallback={<PageLoader />}><MyOrdersPage /></Suspense>,
          },
        ],
      },
    ],
  },
  {
    // Admin layout — separate from storefront
    element: <AdminRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>,
        children: [
          { path: '/admin', element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense> },
          { path: '/admin/products', element: <Suspense fallback={<PageLoader />}><AdminProductsPage /></Suspense> },
          { path: '/admin/products/create', element: <Suspense fallback={<PageLoader />}><AdminProductEditPage /></Suspense> },
          { path: '/admin/products/:id/edit', element: <Suspense fallback={<PageLoader />}><AdminProductEditPage /></Suspense> },
          { path: '/admin/categories', element: <Suspense fallback={<PageLoader />}><AdminCategoriesPage /></Suspense> },
          { path: '/admin/users', element: <Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense> },
          { path: '/admin/users/:id', element: <Suspense fallback={<PageLoader />}><AdminUserDetailPage /></Suspense> },
          { path: '/admin/orders', element: <Suspense fallback={<PageLoader />}><AdminOrdersPage /></Suspense> },
          { path: '/admin/orders/:id', element: <Suspense fallback={<PageLoader />}><AdminOrderDetailPage /></Suspense> },
          { path: '/admin/pages', element: <Suspense fallback={<PageLoader />}><AdminPagesPage /></Suspense> },
          { path: '/admin/site-settings', element: <Suspense fallback={<PageLoader />}><AdminSiteSettingsPage /></Suspense> },
          { path: '/admin/variation-types', element: <Suspense fallback={<PageLoader />}><AdminVariationTypesPage /></Suspense> },
          { path: '/admin/hero-banners', element: <Suspense fallback={<PageLoader />}><AdminHeroBannersPage /></Suspense> },
        ],
      },
    ],
  },
]);
