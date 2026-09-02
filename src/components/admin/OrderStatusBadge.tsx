import { CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge = ({ status, className = '' }: OrderStatusBadgeProps) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'PLACED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 border border-sky-200 ${className}`}
        >
          <Clock aria-hidden="true" className="size-3.5 text-sky-600" />
          <span>Placed</span>
        </span>
      );
    case 'CONFIRMED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 ${className}`}
        >
          <ShieldCheck aria-hidden="true" className="size-3.5 text-amber-600" />
          <span>Confirmed</span>
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200 ${className}`}
        >
          <XCircle aria-hidden="true" className="size-3.5 text-rose-600" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800 border border-neutral-200 ${className}`}
        >
          <Clock aria-hidden="true" className="size-3.5 text-neutral-600" />
          <span>{status}</span>
        </span>
      );
  }
};

