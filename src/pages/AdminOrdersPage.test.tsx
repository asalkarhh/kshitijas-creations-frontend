import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminOrdersPage from './AdminOrdersPage';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('renders orders list with masked phone numbers, customer names, and formatted amounts', async () => {
    renderWithProviders(<AdminOrdersPage />);

    expect(await screen.findByText('KC-2026-00042')).toBeVisible();
    expect(screen.getByText('Priya Sharma')).toBeVisible();
    expect(screen.getByText('+91 98*** **210')).toBeVisible();
    expect(screen.getByText('₹1,850')).toBeVisible();

    expect(screen.getByText('KC-2026-00041')).toBeVisible();
    expect(screen.getByText('Ananya Deshmukh')).toBeVisible();
    expect(screen.getByText('+91 98*** **678')).toBeVisible();
    expect(screen.getByText('₹2,400')).toBeVisible();

    expect(screen.getByText('KC-2026-00040')).toBeVisible();
    expect(screen.getByText('Rohan Patil')).toBeVisible();
  });

  it('filters orders by clicking status tabs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminOrdersPage />);

    expect(await screen.findByText('KC-2026-00042')).toBeVisible();

    // Click "Confirmed" status tab
    const confirmedTab = screen.getByRole('button', { name: /Confirmed/i });
    await user.click(confirmedTab);

    expect(await screen.findByText('KC-2026-00041')).toBeVisible();
  });

  it('searches orders by order number or customer name with debouncing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminOrdersPage />);

    expect(await screen.findByText('KC-2026-00042')).toBeVisible();

    const searchInput = screen.getByLabelText(/Search orders by number, customer, or phone/i);
    await user.type(searchInput, 'Rohan');

    await waitFor(
      () => {
        expect(screen.getByText('Rohan Patil')).toBeVisible();
        expect(screen.queryByText('Priya Sharma')).toBeNull();
      },
      { timeout: 3000 },
    );
  });

  it('displays empty state when no orders match filters', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/admin/orders', () => {
        return HttpResponse.json({
          content: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        });
      }),
    );

    renderWithProviders(<AdminOrdersPage />);
    expect(await screen.findByRole('heading', { name: 'No customer orders found' })).toBeVisible();
  });
});

