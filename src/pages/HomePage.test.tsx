import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from './HomePage';
import { renderWithProviders } from '../test/test-utils';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('HomePage', () => {
  it('renders banners, active categories, featured products, and new arrivals', async () => {
    renderWithProviders(<HomePage />);

    // Banner
    expect(await screen.findByRole('heading', { name: 'Spring Collection' })).toBeVisible();

    // Category cards
    const earrings = await screen.findAllByText('Earrings');
    expect(earrings.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Necklaces').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bracelets').length).toBeGreaterThan(0);

    // Featured section
    expect(await screen.findByRole('heading', { name: 'Handmade, and much loved' })).toBeVisible();

    // New products section
    expect(await screen.findByRole('heading', { name: 'Fresh from the worktable' })).toBeVisible();
  });

  it('clicking a category card links to /products?category={slug}', async () => {
    renderWithProviders(<HomePage />);
    const earringsLinks = await screen.findAllByRole('link', { name: /Earrings/i });
    expect(earringsLinks[0]).toHaveAttribute('href', '/products?category=earrings');
  });

  it('displays error and retry button when category fetching fails', async () => {
    const user = userEvent.setup();
    let fail = true;
    server.use(
      http.get('http://localhost:8080/api/v1/public/categories', () => {
        if (fail) {
          return HttpResponse.json({ message: 'Category service down' }, { status: 500 });
        }
        return HttpResponse.json([
          {
            id: 'c1',
            name: 'Recovered Collection',
            slug: 'recovered',
            isActive: true,
            displayOrder: 1,
          },
        ]);
      }),
    );

    renderWithProviders(<HomePage />);
    expect(await screen.findByText(/Could not load categories/i)).toBeVisible();

    fail = false;
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    await user.click(retryBtn);

    expect(await screen.findByText('Recovered Collection')).toBeVisible();
  });

  it('hides banner section if banners array is empty', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/public/banners', () => {
        return HttpResponse.json([]);
      }),
    );

    renderWithProviders(<HomePage />);
    await screen.findByRole('heading', { name: 'Shop by category' });
    expect(screen.queryByRole('region', { name: 'Featured collections' })).toBeNull();
  });
});

