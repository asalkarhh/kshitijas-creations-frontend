import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProtectedAdminRoute, PublicOnlyAdminRoute } from '../store/auth-context';
import { ScrollRestoration } from './ScrollRestoration';

const PublicLayout = lazy(() => import('../layouts/PublicLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const HomePage = lazy(() => import('../pages/HomePage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('../pages/OrderSuccessPage'));
const StaticPolicyPage = lazy(() => import('../pages/StaticPolicyPage'));
const AdminLoginPage = lazy(() => import('../pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const AdminCategoriesPage = lazy(() => import('../pages/AdminCategoriesPage'));
const AdminProductsPage = lazy(() => import('../pages/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('../pages/AdminProductFormPage'));
const AdminBannersPage = lazy(() => import('../pages/AdminBannersPage'));
const AdminOrdersPage = lazy(() => import('../pages/AdminOrdersPage'));
const AdminOrderDetailsPage = lazy(() => import('../pages/AdminOrderDetailsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner label="Loading page" />}>
    <ScrollRestoration />
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />} path="/">
        <Route element={<HomePage />} index />
        <Route element={<ProductsPage />} path="products" />
        <Route element={<ProductDetailPage />} path="products/:slug" />
        <Route element={<CartPage />} path="cart" />
        <Route element={<CheckoutPage />} path="checkout" />
        <Route element={<OrderSuccessPage />} path="order-success" />
        <Route element={<StaticPolicyPage />} path="privacy" />
        <Route element={<StaticPolicyPage />} path="terms" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>

      {/* Admin Login (Public only for unauthenticated users) */}
      <Route
        element={
          <PublicOnlyAdminRoute>
            <AdminLoginPage />
          </PublicOnlyAdminRoute>
        }
        path="admin/login"
      />

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
        path="admin"
      >
        <Route element={<AdminDashboardPage />} index />
        <Route element={<AdminCategoriesPage />} path="categories" />
        <Route element={<AdminProductsPage />} path="products" />
        <Route element={<AdminProductFormPage />} path="products/new" />
        <Route element={<AdminProductFormPage />} path="products/:id/edit" />
        <Route element={<AdminBannersPage />} path="banners" />
        <Route element={<AdminOrdersPage />} path="orders" />
        <Route element={<AdminOrderDetailsPage />} path="orders/:id" />
      </Route>
    </Routes>
  </Suspense>
);
