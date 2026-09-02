import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApiBanners } from '../../test/mocks/handlers';
import { renderWithProviders } from '../../test/test-utils';
import { BannerCarousel } from './BannerCarousel';
import type { Banner } from '../../types';

describe('BannerCarousel', () => {
  it('renders nothing when banners array is empty', () => {
    renderWithProviders(<BannerCarousel banners={[]} />);
    expect(screen.queryByRole('region', { name: 'Featured collections' })).toBeNull();
  });

  it('supports manual next and previous navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BannerCarousel banners={mockApiBanners} intervalMs={60_000} />);
    expect(screen.getByRole('heading', { name: mockApiBanners[0].title })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByRole('heading', { name: mockApiBanners[1].title })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(screen.getByRole('heading', { name: mockApiBanners[0].title })).toBeVisible();
  });

  it('supports keyboard arrow navigation', () => {
    renderWithProviders(<BannerCarousel banners={mockApiBanners} intervalMs={60_000} />);
    const carousel = screen.getByRole('region', { name: 'Featured collections' });
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: mockApiBanners[1].title })).toBeVisible();
  });

  it('safely handles internal and external links while rejecting unsafe javascript URLs', () => {
    const customBanners: Banner[] = [
      {
        id: 'b1',
        title: 'Safe Internal Banner',
        subtitle: 'Internal route link',
        desktopImageUrl: 'http://localhost/img1.jpg',
        imageAlt: 'img1',
        buttonText: 'Internal Link',
        targetUrl: '/products?category=earrings',
      },
      {
        id: 'b2',
        title: 'Safe External Banner',
        subtitle: 'HTTPS link',
        desktopImageUrl: 'http://localhost/img2.jpg',
        imageAlt: 'img2',
        buttonText: 'External Link',
        targetUrl: 'https://www.instagram.com',
      },
      {
        id: 'b3',
        title: 'Unsafe Banner',
        subtitle: 'Unsafe javascript scheme',
        desktopImageUrl: 'http://localhost/img3.jpg',
        imageAlt: 'img3',
        buttonText: 'Unsafe Link',
        targetUrl: 'javascript:alert(1)',
      },
    ];

    const { rerender } = renderWithProviders(<BannerCarousel banners={[customBanners[0]]} />);
    const internalLink = screen.getByRole('link', { name: 'Internal Link' });
    expect(internalLink).toHaveAttribute('href', '/products?category=earrings');

    rerender(<BannerCarousel banners={[customBanners[1]]} />);
    const externalLink = screen.getByRole('link', { name: 'External Link' });
    expect(externalLink).toHaveAttribute('href', 'https://www.instagram.com');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noreferrer noopener');

    rerender(<BannerCarousel banners={[customBanners[2]]} />);
    expect(screen.queryByRole('link', { name: 'Unsafe Link' })).toBeNull();
  });
});
