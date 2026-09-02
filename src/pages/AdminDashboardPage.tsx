import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { OrderStatusBadge } from '../components/admin/OrderStatusBadge';
import { Skeleton } from '../components/common/Skeleton';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { useAuth } from '../store/auth-context';
import { formatPrice } from '../utils/currency';

export const formatISTDateTime = (isoString?: string): string => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
};

const AdminDashboardPage = () => {
  const { admin } = useAuth();

  usePageMetadata({
    title: 'Admin dashboard',
    description: 'Studio overview, catalog statistics, and recent customer orders.',
    canonicalPath: '/admin',
  });

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.dashboard,
    staleTime: 60_000,
  });

  const stats = dashboard?.stats;
  const recentOrders = dashboard?.recentOrders ?? [];

  return (
    <div className="space-y-8">
      {/* Header & Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">
            Studio management
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Welcome back, {admin?.name || 'Administrator'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here is the current status of your small-batch catalog and customer orders.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            className="button-primary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold"
            to="/admin/products/new"
          >
            <Plus className="size-3.5" /> Add Product
          </Link>
          <Link
            className="button-secondary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold"
            to="/admin/banners"
          >
            <ImageIcon className="size-3.5" /> Add Banner
          </Link>
          <Link
            className="button-secondary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold"
            to="/admin/orders"
          >
            <ShoppingCart className="size-3.5" /> View Orders
          </Link>
          <Link
            className="button-secondary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold"
            target="_blank"
            to="/"
          >
            <ExternalLink className="size-3.5" /> Public Store
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div
          className="flex items-start justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load dashboard data</p>
              <p className="mt-1 text-sm text-rose-700">
                {(error as Error)?.message || 'Please check your connection and try again.'}
              </p>
            </div>
          </div>
          <button
            className="button-secondary shrink-0 text-xs border-rose-300 hover:bg-rose-100"
            onClick={() => refetch()}
            type="button"
          >
            <RotateCcw className="size-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Metric Summary Cards */}
      <section aria-label="Catalog and order statistics">
        <h2 className="sr-only">Summary statistics</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                className="rounded-3xl border border-beige bg-surface p-5 shadow-soft space-y-3"
                key={i}
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Products */}
            <div className="rounded-3xl border border-beige bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Total Products
                </span>
                <Package aria-hidden="true" className="size-4 text-maroon" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-ink">{stats.totalProducts}</p>
              <span className="mt-1 block text-xs text-muted">In entire catalog</span>
            </div>

            {/* Available Products */}
            <div className="rounded-3xl border border-beige bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Available Products
                </span>
                <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-emerald-700">
                {stats.availableProducts}
              </p>
              <span className="mt-1 block text-xs text-muted">Ready to purchase</span>
            </div>

            {/* Total Orders */}
            <div className="rounded-3xl border border-beige bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Total Orders
                </span>
                <ShoppingBag aria-hidden="true" className="size-4 text-maroon" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-ink">{stats.totalOrders}</p>
              <span className="mt-1 block text-xs text-muted">Lifetime submissions</span>
            </div>

            {/* Placed / New Orders */}
            <div className="rounded-3xl border border-sky-200 bg-sky-50/50 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  New / Placed Orders
                </span>
                <Clock aria-hidden="true" className="size-4 text-sky-600" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-sky-900">
                {stats.placedOrders ?? stats.newOrders ?? 0}
              </p>
              <span className="mt-1 block text-xs text-sky-700">Awaiting WhatsApp confirmation</span>
            </div>

            {/* Confirmed Orders */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Confirmed Orders
                </span>
                <ShieldCheck aria-hidden="true" className="size-4 text-amber-600" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-amber-900">
                {stats.confirmedOrders}
              </p>
              <span className="mt-1 block text-xs text-amber-700">In crafting / preparation</span>
            </div>

            {/* Completed Orders */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Completed Orders
                </span>
                <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-emerald-900">
                {stats.completedOrders}
              </p>
              <span className="mt-1 block text-xs text-emerald-700">Fulfilled and delivered</span>
            </div>

            {/* Cancelled Orders */}
            <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Cancelled Orders
                </span>
                <XCircle aria-hidden="true" className="size-4 text-rose-600" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-rose-900">
                {stats.cancelledOrders}
              </p>
              <span className="mt-1 block text-xs text-rose-700">Closed or cancelled</span>
            </div>
          </div>
        ) : null}
      </section>

      {/* Recent Orders Section */}
      <section className="rounded-3xl border border-beige bg-surface p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-beige pb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Recent Customer Orders</h2>
            <p className="mt-1 text-xs text-muted">
              Most recent guest submissions. Full customer addresses remain confidential.
            </p>
          </div>
          <Link
            className="text-xs font-bold uppercase tracking-wider text-maroon hover:underline inline-flex items-center gap-1"
            to="/admin/orders"
          >
            <span>View all orders</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4 pt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="flex items-center justify-between py-3 border-b border-beige/60" key={i}>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag aria-hidden="true" className="mx-auto size-10 text-muted" />
            <h3 className="mt-3 font-display text-lg text-ink">No recent orders yet</h3>
            <p className="mt-1 text-xs text-muted">
              When customers place guest orders, they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-beige text-[0.7rem] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">City</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date (IST)</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {recentOrders.map((order) => {
                  const orderTotal = order.totalAmount ?? order.total ?? 0;
                  const orderId = order.id || order.orderNumber;
                  return (
                    <tr className="hover:bg-rose/5 transition-colors" key={order.orderNumber}>
                      <td className="py-3.5 px-3 font-mono font-bold text-ink">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-ink">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 px-3 text-muted">
                        {order.city || '—'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-maroon">
                        {formatPrice(orderTotal)}
                      </td>
                      <td className="py-3.5 px-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted whitespace-nowrap">
                        {formatISTDateTime(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          className="button-secondary inline-flex py-1 px-3 text-xs"
                          to={`/admin/orders/${orderId}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboardPage;

