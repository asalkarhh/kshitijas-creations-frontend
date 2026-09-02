import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import AdminOrderDetailsPage from './AdminOrderDetailsPage';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';

const renderDetailsPage = (orderId = 'ord-1') => {
  return renderWithProviders(
    <Routes>
      <Route element={<AdminOrderDetailsPage />} path="/admin/orders/:id" />
    </Routes>,
    { route: `/admin/orders/${orderId}` },
  );
};

describe('AdminOrderDetailsPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('renders order details, customer unmasked contact, address, note, and items snapshot', async () => {
    renderDetailsPage('ord-1');

    expect(await screen.findByRole('heading', { name: /Order #KC-2026-00042/i })).toBeVisible();
    expect(screen.getByText('Priya Sharma')).toBeVisible();
    expect(screen.getByText('9876543210')).toBeVisible();
    expect(screen.getByText(/Flat 402, Lotus Residency, Baner Road/i)).toBeVisible();
    expect(screen.getByText(/"Please wrap carefully as a gift\."/i)).toBeVisible();

    // Snapshot items
    expect(screen.getByText('Floral Earrings')).toBeVisible();
    expect(screen.getByText('CODE: FL-01')).toBeVisible();
    expect(screen.getByText('Vintage Pearl Necklace')).toBeVisible();
    expect(screen.getByText('CODE: PN-03')).toBeVisible();
    expect(screen.getAllByText('₹1,850').length).toBeGreaterThan(0);
  });

  it('allows transitioning status from PLACED to CONFIRMED with confirmation dialog', async () => {
    const user = userEvent.setup();
    renderDetailsPage('ord-1');

    expect(await screen.findByRole('heading', { name: /Order #KC-2026-00042/i })).toBeVisible();

    const confirmBtn = screen.getByRole('button', { name: /Mark Confirmed/i });
    await user.click(confirmBtn);

    expect(screen.getByRole('heading', { name: 'Confirm Customer Order' })).toBeVisible();
    expect(
      screen.getByText(/Are you sure you want to mark this order as Confirmed\?/i),
    ).toBeVisible();

    const submitConfirm = screen.getByRole('button', { name: 'Mark as CONFIRMED' });
    await user.click(submitConfirm);

    await waitFor(() =>
      expect(screen.getByText('Order #KC-2026-00042 marked as CONFIRMED.')).toBeVisible(),
    );
  });

  it('allows cancelling an order with confirmation', async () => {
    const user = userEvent.setup();
    renderDetailsPage('ord-1');

    expect(await screen.findByRole('heading', { name: /Order #KC-2026-00042/i })).toBeVisible();

    const cancelBtn = screen.getByRole('button', { name: /Cancel Order/i });
    await user.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Cancel Order' })).toBeVisible();

    const submitCancel = screen.getByRole('button', { name: 'Mark as CANCELLED' });
    await user.click(submitCancel);

    await waitFor(() =>
      expect(screen.getByText('Order #KC-2026-00042 marked as CANCELLED.')).toBeVisible(),
    );
  });

  it('displays 404 state when order does not exist', async () => {
    renderDetailsPage('missing-order-id');
    expect(await screen.findByRole('heading', { name: 'Order Not Found' })).toBeVisible();
  });
});
