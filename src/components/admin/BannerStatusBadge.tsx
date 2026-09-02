import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { BannerCalculatedStatus } from '../../utils/banner';

interface BannerStatusBadgeProps {
  status: BannerCalculatedStatus;
  className?: string;
}

export const BannerStatusBadge = ({ status, className = '' }: BannerStatusBadgeProps) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-600" />
          <span>Active</span>
        </span>
      );
    case 'SCHEDULED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 border border-sky-200 ${className}`}
        >
          <Calendar aria-hidden="true" className="size-3.5 text-sky-600" />
          <span>Scheduled</span>
        </span>
      );
    case 'EXPIRED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 border border-neutral-300 ${className}`}
        >
          <Clock aria-hidden="true" className="size-3.5 text-neutral-500" />
          <span>Expired</span>
        </span>
      );
    case 'INACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200 ${className}`}
        >
          <XCircle aria-hidden="true" className="size-3.5 text-rose-600" />
          <span>Inactive</span>
        </span>
      );
    default:
      return null;
  }
};

