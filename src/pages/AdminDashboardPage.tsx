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
  ShoppingBag,
  ShoppingCart,
  Sparkles,
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
    <div className="space-y-8 font-sans">
      {/* Header & Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-rose/30 px-3 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-maroon">
            <Sparkles className="size-2.5 text-gold" /> Atelier Overview
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Welcome back, {admin?.name || 'Administrator'}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Here is the live status of your small-batch catalog, active promotions, and customer orders.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="button-primary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-bold shadow-xs hover:shadow-sm"
            to="/admin/products/new"
          >
            <Plus className="size-3.5" /> Add Product
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-beige/80 bg-surface px-4 py-2 text-xs font-bold text-ink hover:border-gold hover:text-maroon transition-all shadow-xs"
            to="/admin/banners"
          >
            <ImageIcon className="size-3.5 text-maroon" /> Add Banner
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-beige/80 bg-surface px-4 py-2 text-xs font-bold text-ink hover:border-maroon/40 hover:text-maroon transition-all shadow-xs"
            to="/admin/orders"
          >
            <ShoppingCart className="size-3.5 text-maroon" /> View Orders
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-beige/80 bg-surface px-4 py-2 text-xs font-bold text-ink hover:border-maroon/40 hover:text-maroon transition-all shadow-xs"
            to="/"
          >
            <ExternalLink className="size-3.5 text-maroon" /> Public Store
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div
          className="flex items-start justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-xs"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Unable to load dashboard data</p>
              <p className="mt-0.5 text-xs text-rose-700">
                {(error as Error)?.message || 'Please check your connection and try again.'}
              </p>
            </div>
          </div>
          <button
            className="button-secondary shrink-0 text-xs py-1.5 px-3 border-rose-300 hover:bg-rose-100"
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                className="rounded-4xl border border-beige/80 bg-surface/90 p-5 shadow-soft space-y-3"
                key={i}
              >
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-xl" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Total Products */}
            <div className="rounded-4xl border border-beige/80 bg-surface/90 p-5 shadow-soft hover:border-gold/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">
                  Total Products
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-rose/40 text-maroon">
                  <Package aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-ink">{stats.totalProducts}</p>
              <span className="mt-1 block text-[0.7rem] text-muted">In entire studio catalog</span>
            </div>

            {/* Available Products */}
            <div className="rounded-4xl border border-beige/80 bg-surface/90 p-5 shadow-soft hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-800">
                  Available Products
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-emerald-700">
                {stats.availableProducts}
              </p>
              <span className="mt-1 block text-[0.7rem] text-muted">Available to customer orders</span>
            </div>

            {/* Total Orders */}
            <div className="rounded-4xl border border-beige/80 bg-surface/90 p-5 shadow-soft hover:border-maroon/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-maroon">
                  Total Orders
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-rose/40 text-maroon">
                  <ShoppingBag aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-ink">{stats.totalOrders}</p>
              <span className="mt-1 block text-[0.7rem] text-muted">All-time customer submissions</span>
            </div>

            {/* Placed Orders */}
            <div className="rounded-4xl border border-sky-200 bg-sky-50/60 p-5 shadow-soft hover:border-sky-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-sky-800">
                  Placed Orders
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-sky-100 text-sky-700">
                  <Clock aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-sky-900">
                {stats.placedOrders ?? stats.newOrders ?? 0}
              </p>
              <span className="mt-1 block text-[0.7rem] text-sky-700">Awaiting artisan confirmation</span>
            </div>

            {/* Confirmed Orders */}
            <div className="rounded-4xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-soft hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-indigo-800">
                  Confirmed Orders
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Clock aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-indigo-900">
                {stats.confirmedOrders ?? 0}
              </p>
              <span className="mt-1 block text-[0.7rem] text-indigo-700">In production / preparation</span>
            </div>

            {/* Completed Orders */}
            <div className="rounded-4xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-soft hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-emerald-800">
                  Completed Orders
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-emerald-900">
                {stats.completedOrders ?? 0}
              </p>
              <span className="mt-1 block text-[0.7rem] text-emerald-700">Fulfilled and delivered</span>
            </div>

            {/* Cancelled Orders */}
            <div className="rounded-4xl border border-rose-200 bg-rose-50/50 p-5 shadow-soft hover:border-rose-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-rose-800">
                  Cancelled Orders
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-rose-100 text-rose-700">
                  <XCircle aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-rose-900">
                {stats.cancelledOrders ?? 0}
              </p>
              <span className="mt-1 block text-[0.7rem] text-rose-700">Closed or cancelled</span>
            </div>
          </div>
        ) : null}
      </section>

      {/* Recent Orders Section */}
      <section className="rounded-4xl border border-beige/80 bg-surface/90 p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-beige/70 pb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Recent Customer Submissions</h2>
            <p className="mt-1 text-xs text-muted">
              Live guest orders awaiting processing or confirmation.
            </p>
          </div>
          <Link
            className="text-xs font-bold uppercase tracking-wider text-maroon hover:underline inline-flex items-center gap-1.5"
            to="/admin/orders"
          >
            <span>View all orders</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 pt-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex items-center justify-between py-3 border-b border-beige/40" key={i}>
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag aria-hidden="true" className="mx-auto size-10 text-muted/60" />
            <h3 className="mt-3 font-display text-lg font-bold text-ink">No recent orders yet</h3>
            <p className="mt-1 text-xs text-muted">
              When customers place guest orders, they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-beige/70 text-[0.68rem] font-bold uppercase tracking-wider text-muted">
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
              <tbody className="divide-y divide-beige/50">
                {recentOrders.map((order) => {
                  const orderTotal = order.totalAmount ?? order.total ?? 0;
                  const orderId = order.id || order.orderNumber;
                  return (
                    <tr className="hover:bg-rose/10 transition-colors" key={order.orderNumber}>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-ink">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-ink font-display">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 px-3 text-muted text-xs">
                        {order.city || '—'}
                      </td>
                      <td className="py-3.5 px-3 font-black text-maroon">
                        {formatPrice(orderTotal)}
                      </td>
                      <td className="py-3.5 px-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted whitespace-nowrap font-mono">
                        {formatISTDateTime(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          className="inline-flex items-center rounded-full border border-maroon/20 bg-surface px-3 py-1 text-xs font-bold text-maroon hover:bg-rose/30 transition-all shadow-2xs"
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
