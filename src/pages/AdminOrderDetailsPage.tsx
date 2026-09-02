import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Phone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { OrderStatusBadge } from '../components/admin/OrderStatusBadge';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { ProductMedia } from '../components/product/ProductMedia';
import { usePageMetadata } from '../hooks/use-page-metadata';
import type { AdminOrderDetail, ApiError } from '../types';
import { formatPrice } from '../utils/currency';
import { formatISTDateTime } from '../utils/date';

interface StatusTransitionModalState {
  targetStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  title: string;
  description: string;
}

const AdminOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [confirmModal, setConfirmModal] = useState<StatusTransitionModalState | null>(null);

  usePageMetadata({
    title: 'Order details',
    description: 'Review order items, customer delivery address, and update status.',
    canonicalPath: `/admin/orders/${id}`,
  });

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AdminOrderDetail>({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminApi.getOrder(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  // Order status update mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!id) return;
      return await adminApi.updateOrderStatus(id, newStatus);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      showToast(
        updated
          ? `Order #${updated.orderNumber} marked as ${updated.status}.`
          : 'Order status updated.',
        'success',
      );
      setConfirmModal(null);
    },
    onError: (err) => {
      const apiErr = err as unknown as ApiError;
      if (apiErr.status === 409) {
        showToast(
          'Conflict: Order has already been updated by another action. Refreshing details...',
          'error',
        );
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      } else {
        showToast(apiErr.message || 'Failed to update order status.', 'error');
      }
      setConfirmModal(null);
    },
  });

  const handleOpenStatusModal = (targetStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    switch (targetStatus) {
      case 'CONFIRMED':
        setConfirmModal({
          targetStatus: 'CONFIRMED',
          title: 'Confirm Customer Order',
          description:
            'Are you sure you want to mark this order as Confirmed? This indicates you have communicated with the customer and pieces are being prepared.',
        });
        break;
      case 'COMPLETED':
        setConfirmModal({
          targetStatus: 'COMPLETED',
          title: 'Complete and Fulfill Order',
          description:
            'Are you sure you want to mark this order as Completed? Completed orders are finalized and cannot be modified further.',
        });
        break;
      case 'CANCELLED':
        setConfirmModal({
          targetStatus: 'CANCELLED',
          title: 'Cancel Order',
          description:
            'Are you sure you want to cancel this order? Cancelled orders are closed and cannot be reopened.',
        });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-3xl lg:col-span-2" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center" role="alert">
        <AlertCircle className="mx-auto size-12 text-rose-600" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Order Not Found</h1>
        <p className="mt-2 text-sm text-muted">
          {(error as Error)?.message || 'The requested order could not be loaded.'}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link className="button-secondary inline-flex items-center gap-2" to="/admin/orders">
            <ArrowLeft className="size-4" /> Back to orders
          </Link>
          <button
            className="button-primary inline-flex items-center gap-2"
            onClick={() => refetch()}
            type="button"
          >
            <RotateCcw className="size-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = order.status;
  const isFinalState = currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED';

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div>
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon hover:underline mb-3"
          to="/admin/orders"
        >
          <ArrowLeft className="size-3.5" /> Back to orders list
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
                Order #{order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-xs text-muted">
              Submitted on {formatISTDateTime(order.createdAt)}
            </p>
          </div>

          {/* Status Transition Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentStatus === 'PLACED' && (
              <>
                <button
                  aria-busy={statusMutation.isPending}
                  className="button-primary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold bg-amber-700 hover:bg-amber-800"
                  disabled={statusMutation.isPending}
                  onClick={() => handleOpenStatusModal('CONFIRMED')}
                  type="button"
                >
                  <ShieldCheck className="size-4" /> Mark Confirmed
                </button>
                <button
                  aria-busy={statusMutation.isPending}
                  className="button-secondary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold border-rose-300 text-rose-700 hover:bg-rose-50"
                  disabled={statusMutation.isPending}
                  onClick={() => handleOpenStatusModal('CANCELLED')}
                  type="button"
                >
                  <XCircle className="size-4" /> Cancel Order
                </button>
              </>
            )}

            {currentStatus === 'CONFIRMED' && (
              <>
                <button
                  aria-busy={statusMutation.isPending}
                  className="button-primary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800"
                  disabled={statusMutation.isPending}
                  onClick={() => handleOpenStatusModal('COMPLETED')}
                  type="button"
                >
                  <CheckCircle2 className="size-4" /> Complete Order
                </button>
                <button
                  aria-busy={statusMutation.isPending}
                  className="button-secondary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold border-rose-300 text-rose-700 hover:bg-rose-50"
                  disabled={statusMutation.isPending}
                  onClick={() => handleOpenStatusModal('CANCELLED')}
                  type="button"
                >
                  <XCircle className="size-4" /> Cancel Order
                </button>
              </>
            )}

            {isFinalState && (
              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600 border border-neutral-300">
                Finalized Status (No further actions)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Order Items + Customer Info */}
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        {/* Left 2 Cols: Ordered Items Snapshot & Totals */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items Section */}
          <section className="rounded-3xl border border-beige bg-surface p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink border-b border-beige pb-4 flex items-center justify-between">
              <span>Order Items ({order.items?.length ?? 0})</span>
              <span className="text-xs font-normal text-muted">Preserved Order Snapshot</span>
            </h2>

            <div className="divide-y divide-beige/60">
              {order.items?.map((item, idx) => {
                const itemPrice = item.unitPrice ?? item.price ?? 0;
                return (
                  <div
                    className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    key={idx}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-beige border border-beige">
                        <ProductMedia
                          alt={item.productName}
                          className="size-full object-cover"
                          src={item.imageUrl}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink line-clamp-1">{item.productName}</p>
                        {item.productCode && (
                          <span className="font-mono text-xs text-muted block">
                            CODE: {item.productCode}
                          </span>
                        )}
                        <span className="text-xs text-muted mt-0.5 block">
                          Qty: {item.quantity} × {formatPrice(itemPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <span className="font-display text-base font-bold text-maroon">
                        {formatPrice(item.lineTotal || itemPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals Summary */}
            <div className="mt-6 border-t border-beige pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-ink border-t border-beige/60 pt-2">
                <span>Total Amount</span>
                <span className="text-xl font-display text-maroon">
                  {formatPrice(order.totalAmount || order.total || 0)}
                </span>
              </div>
            </div>
          </section>

          {/* Timeline & Metadata */}
          <section className="rounded-3xl border border-beige bg-surface p-6 shadow-soft sm:p-8 space-y-3">
            <h2 className="font-display text-lg font-bold text-ink">Order Metadata</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-xs text-muted">
              <div className="flex items-start gap-2.5">
                <Clock className="size-4 text-maroon shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-ink block">Created Time</span>
                  <span>{formatISTDateTime(order.createdAt)}</span>
                </div>
              </div>

              {order.updatedAt && (
                <div className="flex items-start gap-2.5">
                  <Calendar className="size-4 text-maroon shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-ink block">Last Status Update</span>
                    <span>{formatISTDateTime(order.updatedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right 1 Col: Customer Details & Protected Address */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <section className="rounded-3xl border border-beige bg-surface p-6 shadow-soft space-y-4">
            <h2 className="font-display text-lg font-bold text-ink border-b border-beige pb-3">
              Customer Information
            </h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <User className="size-4 text-maroon shrink-0 mt-1" />
                <div>
                  <span className="text-xs text-muted block">Full Name</span>
                  <span className="font-semibold text-ink">{order.customerName}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="size-4 text-maroon shrink-0 mt-1" />
                <div>
                  <span className="text-xs text-muted block">Contact Number</span>
                  <span className="font-mono font-semibold text-ink">{order.mobileNumber}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="size-4 text-maroon shrink-0 mt-1" />
                <div>
                  <span className="text-xs text-muted block">Delivery Address</span>
                  <p className="font-medium text-ink whitespace-pre-line mt-0.5">
                    {order.addressLine}
                    {order.city && `, ${order.city}`}
                    {order.state && `, ${order.state}`}
                    {order.postalCode && ` - ${order.postalCode}`}
                  </p>
                </div>
              </div>

              {order.customerNote && (
                <div className="flex items-start gap-3 border-t border-beige pt-3">
                  <FileText className="size-4 text-maroon shrink-0 mt-1" />
                  <div>
                    <span className="text-xs text-muted block">Customer Note</span>
                    <p className="text-xs text-ink italic mt-0.5 bg-rose/10 p-2.5 rounded-xl">
                      "{order.customerNote}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Privacy & WhatsApp Clarification Note */}
          <div className="rounded-3xl border border-beige bg-[#fdfcfa] p-5 text-xs text-muted space-y-2">
            <p className="font-semibold text-ink flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-maroon" /> Confidential Guest Order
            </p>
            <p className="text-[0.72rem] leading-5">
              Customer delivery details are stored securely. Order updates should be communicated directly to the customer's phone number or WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Status Transition Confirmation Dialog */}
      {confirmModal && (
        <ConfirmationDialog
          confirmLabel={`Mark as ${confirmModal.targetStatus}`}
          description={confirmModal.description}
          isOpen={Boolean(confirmModal)}
          onClose={() => setConfirmModal(null)}
          onConfirm={() => statusMutation.mutate(confirmModal.targetStatus)}
          title={confirmModal.title}
        />
      )}
    </div>
  );
};

export default AdminOrderDetailsPage;

