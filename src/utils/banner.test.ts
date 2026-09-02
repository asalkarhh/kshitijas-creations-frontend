import { getBannerStatus } from './banner';
import type { Banner } from '../types';

describe('Banner Status Calculation', () => {
  const baseBanner: Banner = {
    id: 'b-test',
    title: 'Test Banner',
    desktopImageUrl: 'http://localhost/image.jpg',
    imageAlt: 'Test',
  };

  it('returns INACTIVE if active is false', () => {
    expect(getBannerStatus({ ...baseBanner, active: false, isActive: false })).toBe('INACTIVE');
  });

  it('returns SCHEDULED if startAt is in the future', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    expect(getBannerStatus({ ...baseBanner, active: true, startAt: futureDate })).toBe(
      'SCHEDULED',
    );
  });

  it('returns EXPIRED if endAt is in the past', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    expect(getBannerStatus({ ...baseBanner, active: true, endAt: pastDate })).toBe('EXPIRED');
  });

  it('returns ACTIVE if dates are valid and currently in window or null', () => {
    expect(getBannerStatus({ ...baseBanner, active: true, startAt: null, endAt: null })).toBe(
      'ACTIVE',
    );
  });
});

