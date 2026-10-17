import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  Eye,
  RotateCcw,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { OrderStatusBadge } from '../components/admin/OrderStatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { formatPrice } from '../utils/currency';
import { formatISTCompact } from '../utils/date';
import { maskMobileNumber } from '../utils/privacy';

const STATUS_TABS = [
  { label: 'All Orders', value: '' },
  { label: 'Placed', value: 'PLACED' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const AdminOrdersPage = () => {
  usePageMetadata({
    title: 'Manage orders',
    description: 'Track customer order submissions, review statuses, and fulfillment details.',
    canonicalPath: '/admin/orders',
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || '';
  const fromDateParam = searchParams.get('fromDate') || '';
  const toDateParam = searchParams.get('toDate') || '';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [searchInput, setSearchInput] = useState(searchParam);

  // Fetch dashboard stats for badge counts
  const { data: dashboard } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.dashboard,
    staleTime: 60_000,
  });

  const stats = dashboard?.stats;

  // Search input debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchParam) {
        const next = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
          next.set('search', searchInput.trim());
        } else {
          next.delete('search');
        }
        next.set('page', '0');
        setSearchParams(next, { replace: true });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, searchParam, searchParams, setSearchParams]);

  // Orders Query
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'admin',
      'orders',
      {
        search: searchParam,
        status: statusParam,
        fromDate: fromDateParam,
        toDate: toDateParam,
        page: pageParam,
      },
    ],
    queryFn: () =>
      adminApi.getOrders({
        search: searchParam || undefined,
        status: statusParam || undefined,
        fromDate: fromDateParam || undefined,
        toDate: toDateParam || undefined,
        page: pageParam,
        size: 10,
        sort: 'createdAt,desc',
      }),
    staleTime: 30_000,
  });

  const orders = ordersData?.content ?? [];
  const totalPages = ordersData?.totalPages ?? 0;
  const totalElements = ordersData?.totalElements ?? 0;

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const getStatusCount = (statusValue: string) => {
    if (!stats) return null;
    switch (statusValue) {
      case '':
        return stats.totalOrders;
      case 'PLACED':
        return stats.placedOrders ?? stats.newOrders ?? 0;
      case 'CONFIRMED':
        return stats.confirmedOrders;
      case 'COMPLETED':
        return stats.completedOrders;
      case 'CANCELLED':
        return stats.cancelledOrders;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">
          Order fulfillment
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
          Customer Orders
        </h1>
        <p className="mt-1 text-sm text-muted">
          Review placed orders, verify customer contact details, and update fulfillment progress.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-beige pb-3">
        {STATUS_TABS.map((tab) => {
          const isActive = statusParam === tab.value;
          const count = getStatusCount(tab.value);

          return (
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-maroon text-white shadow-sm'
                  : 'bg-surface text-ink hover:bg-rose/20 border border-beige hover:text-maroon'
              }`}
              key={tab.value}
              onClick={() => updateParam('status', tab.value)}
              type="button"
            >
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-beige/80 text-muted'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Date Range Filter Bar */}
      <div className="rounded-3xl border border-beige bg-surface p-5 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              aria-label="Search orders by number, customer, or phone"
              className="form-input pl-10 text-sm"
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order #, customer name, mobile..."
              type="text"
              value={searchInput}
            />
          </div>

          {/* From Date */}
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
            <input
              aria-label="Filter from date"
              className="form-input pl-10 text-xs"
              onChange={(e) => updateParam('fromDate', e.target.value)}
              type="date"
              value={fromDateParam}
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
            <input
              aria-label="Filter to date"
              className="form-input pl-10 text-xs"
              onChange={(e) => updateParam('toDate', e.target.value)}
              type="date"
              value={toDateParam}
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div
          className="flex items-start justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load orders</p>
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

      {/* Orders Table */}
      <div className="rounded-3xl border border-beige bg-surface p-6 shadow-soft sm:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                className="flex items-center justify-between py-3.5 border-b border-beige/60"
                key={i}
              >
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart aria-hidden="true" className="mx-auto size-10 text-muted" />
            <h2 className="mt-3 font-display text-lg text-ink">No customer orders found</h2>
            <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
              {searchParam || statusParam || fromDateParam || toDateParam
                ? 'Try adjusting your filters or date ranges to find orders.'
                : 'Customer orders will appear here automatically as they are placed.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-beige text-[0.7rem] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Mobile (Protected)</th>
                  <th className="py-3 px-3">City</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date (IST)</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {orders.map((order) => {
                  const targetId = order.id || order.orderNumber;
                  const displayPhone = order.maskedMobile || maskMobileNumber(order.mobileNumber);

                  return (
                    <tr className="hover:bg-rose/5 transition-colors" key={order.orderNumber}>
                      <td className="py-3.5 px-3 font-mono font-bold text-ink">
                        <Link
                          className="hover:text-maroon underline-offset-2 hover:underline inline-flex items-center gap-2"
                          to={`/admin/orders/${targetId}`}
                        >
                          <span>{order.orderNumber}</span>
                          {order.viewed === false && (
                            <span className="inline-flex items-center rounded-full bg-rose-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-maroon uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-ink">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs text-muted">
                        {displayPhone}
                      </td>
                      <td className="py-3.5 px-3 text-muted">
                        {order.city || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted">
                        {order.itemCount ?? 1} {order.itemCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-maroon">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted whitespace-nowrap">
                        {formatISTCompact(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          className="button-secondary inline-flex items-center gap-1.5 py-1 px-3 text-xs"
                          to={`/admin/orders/${targetId}`}
                        >
                          <Eye className="size-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-beige pt-4">
            <p className="text-xs text-muted">
              Showing {orders.length} of {totalElements} orders
            </p>
            <Pagination
              currentPage={pageParam}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;

