import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsPage from './ProductsPage';
import { renderWithProviders } from '../test/test-utils';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('ProductsPage', () => {
  it('renders loading skeletons initially and page heading', () => {
    renderWithProviders(<ProductsPage />);
    expect(screen.getByRole('heading', { name: 'Find something made for you' })).toBeVisible();
  });

  it('renders products, categories, and prices after loading', async () => {
    renderWithProviders(<ProductsPage />);
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();
    expect(screen.getByText('₹500')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Rose Gold Studs' })).toBeVisible();
    expect(screen.getByText('₹350')).toBeVisible();
  });

  it('filters products when category is selected and displays active filter badge', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    const categorySelect = screen.getByLabelText('Filter by category');
    await user.selectOptions(categorySelect, 'necklaces');

    expect(await screen.findByRole('heading', { name: 'Vintage Pearl Necklace' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Rose Gold Studs' })).toBeNull();

    // Verify active filter badge is displayed
    expect(screen.getByText(/Category:/i)).toBeVisible();
    const removeBadgeBtn = screen.getByRole('button', { name: /Remove category filter for Necklaces/i });
    expect(removeBadgeBtn).toBeVisible();

    // Remove category filter via badge
    await user.click(removeBadgeBtn);

    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();
  });

  it('handles search input debouncing and filtering', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    const searchInput = screen.getByPlaceholderText('Search products...');
    await user.clear(searchInput);
    await user.type(searchInput, 'garnet');

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Garnet Bead Bracelet' })).toBeVisible();
        expect(screen.queryByRole('heading', { name: 'Rose Gold Studs' })).toBeNull();
      },
      { timeout: 4000 },
    );
  });

  it('handles sorting options', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    const sortSelect = screen.getByLabelText('Sort products');
    await user.selectOptions(sortSelect, 'priceAsc');

    expect(await screen.findByText(/Sort:/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /Remove sort filter/i })).toBeVisible();
  });

  it('clears all active filters when Clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductsPage />);
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    const categorySelect = screen.getByLabelText('Filter by category');
    await user.selectOptions(categorySelect, 'earrings');

    const clearButton = await screen.findByRole('button', { name: /Clear all filters/i });
    await user.click(clearButton);

    expect(screen.queryByText(/Active filters:/i)).toBeNull();
  });

  it('shows empty state when no products match', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/public/products', () => {
        return HttpResponse.json({
          content: [],
          page: 0,
          size: 12,
          totalElements: 0,
          totalPages: 0,
        });
      }),
    );
    renderWithProviders(<ProductsPage />);
    expect(await screen.findByText(/No pieces found/i)).toBeVisible();
  });

  it('shows error state with retry button on API failure', async () => {
    const user = userEvent.setup();
    let fail = true;
    server.use(
      http.get('http://localhost:8080/api/v1/public/products', () => {
        if (fail) {
          return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
        return HttpResponse.json({
          content: [
            {
              id: 'p-retried',
              slug: 'retried-earrings',
              name: 'Retried Earrings',
              price: 299,
              category: { id: 'c1', name: 'Earrings', slug: 'earrings' },
              isAvailable: true,
              media: [],
              shortDescription: 'Recovered item',
              description: 'Recovered description',
            },
          ],
          page: 0,
          size: 12,
          totalElements: 1,
          totalPages: 1,
        });
      }),
    );

    renderWithProviders(<ProductsPage />);
    expect(await screen.findByText(/We couldn't load the products/i)).toBeVisible();

    fail = false;
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    await user.click(retryBtn);

    expect(await screen.findByRole('heading', { name: 'Retried Earrings' })).toBeVisible();
  });
});
