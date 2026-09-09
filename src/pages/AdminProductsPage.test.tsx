import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminProductsPage from './AdminProductsPage';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('AdminProductsPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('renders products list with image, code, category, price, and stock status', async () => {
    renderWithProviders(<AdminProductsPage />);

    expect(await screen.findByText('Floral Earrings')).toBeVisible();
    expect(screen.getByText('FL-01')).toBeVisible();
    expect(screen.getByText('₹500')).toBeVisible();
    expect(screen.getAllByText('In stock').length).toBeGreaterThan(0);

    expect(screen.getByText('Rose Gold Studs')).toBeVisible();
    expect(screen.getByText('RG-02')).toBeVisible();
    expect(screen.getByText('Vintage Pearl Necklace')).toBeVisible();
    expect(screen.getByText('Unavailable')).toBeVisible();
  });

  it('filters products by category and stock availability', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminProductsPage />);

    expect(await screen.findByText('Floral Earrings')).toBeVisible();

    // Filter by Category
    const categorySelect = screen.getByLabelText(/Filter by category/i);
    await user.selectOptions(categorySelect, 'cat-2');

    expect(await screen.findByText('Vintage Pearl Necklace')).toBeVisible();
    expect(screen.queryByText('Rose Gold Studs')).toBeNull();

    // Filter by Availability (out of stock)
    const availSelect = screen.getByLabelText(/Filter by availability/i);
    await user.selectOptions(availSelect, 'false');

    expect(await screen.findByText('Vintage Pearl Necklace')).toBeVisible();
  });

  it('searches products with input debouncing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminProductsPage />);

    expect(await screen.findByText('Floral Earrings')).toBeVisible();

    const searchInput = screen.getByLabelText(/Search products by name or code/i);
    await user.type(searchInput, 'garnet');

    await waitFor(
      () => {
        expect(screen.getByText('Garnet Bead Bracelet')).toBeVisible();
        expect(screen.queryByText('Floral Earrings')).toBeNull();
      },
      { timeout: 3000 },
    );
  });

  it('confirms and soft-deletes a product from the public catalog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminProductsPage />);

    expect(await screen.findByText('Floral Earrings')).toBeVisible();

    const deleteBtn = screen.getByRole('button', { name: 'Delete Floral Earrings' });
    await user.click(deleteBtn);

    // Confirmation dialog appears explaining soft delete
    expect(
      screen.getByRole('heading', { name: 'Remove Product from Catalogue' }),
    ).toBeVisible();
    expect(
      screen.getByText(/It will no longer be visible on the public website/i),
    ).toBeVisible();

    const confirmBtn = screen.getByRole('button', { name: 'Remove from Catalogue' });
    await user.click(confirmBtn);

    expect(
      await screen.findByText('Product "Floral Earrings" removed from public catalogue.'),
    ).toBeVisible();
  });

  it('displays empty state when no products match filters', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/admin/products', () => {
        return HttpResponse.json({
          content: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        });
      }),
    );

    renderWithProviders(<AdminProductsPage />);
    expect(await screen.findByRole('heading', { name: 'No products found' })).toBeVisible();
  });
});
