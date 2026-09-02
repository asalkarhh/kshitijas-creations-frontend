import type { Banner } from '../types';

export type BannerCalculatedStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE';

/**
 * Calculates current banner schedule status based on startAt, endAt, and active flag.
 *
 * Rules:
 * - active=false: INACTIVE
 * - Future start: SCHEDULED
 * - Past end: EXPIRED
 * - Currently valid or no time bounds: ACTIVE
 */
export const getBannerStatus = (banner: Banner): BannerCalculatedStatus => {
  const isActive = banner.isActive ?? banner.active ?? true;
  if (!isActive) return 'INACTIVE';

  const now = new Date();

  if (banner.startAt) {
    const start = new Date(banner.startAt);
    if (!isNaN(start.getTime()) && start > now) {
      return 'SCHEDULED';
    }
  }

  if (banner.endAt) {
    const end = new Date(banner.endAt);
    if (!isNaN(end.getTime()) && end < now) {
      return 'EXPIRED';
    }
  }

  return 'ACTIVE';
};

