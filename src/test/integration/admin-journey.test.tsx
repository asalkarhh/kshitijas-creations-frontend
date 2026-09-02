import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { renderWithProviders } from '../test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../../api/client';

describe('Complete Admin Journey E2E Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('admin login -> dashboard -> view categories -> view products -> view orders -> update status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/admin/login' });

    // 1. Admin Login Page
    expect(await screen.findByRole('heading', { name: 'Admin Portal' })).toBeVisible();
    await user.type(screen.getByLabelText(/Admin email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'password');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    // 2. Admin Dashboard Loads
    expect(
      await screen.findByRole('heading', { name: /Welcome back, Kshitija Asalkar/i }),
    ).toBeVisible();

    // 3. Navigate to Categories
    const categoriesNavLinks = screen.getAllByRole('link', { name: /Categories/i });
    await user.click(categoriesNavLinks[0]);
    expect(await screen.findByRole('heading', { name: 'Categories' })).toBeVisible();
    expect(await screen.findByText('Earrings')).toBeVisible();

    // 4. Navigate to Products
    const productsNavLinks = screen.getAllByRole('link', { name: /Products/i });
    await user.click(productsNavLinks[0]);
    expect(await screen.findByRole('heading', { name: 'Products' })).toBeVisible();
    expect(await screen.findByText('Floral Earrings')).toBeVisible();

    // 5. Navigate to Banners
    const bannersNavLinks = screen.getAllByRole('link', { name: /Banners/i });
    await user.click(bannersNavLinks[0]);
    expect(await screen.findByRole('heading', { name: 'Hero Banners' })).toBeVisible();
    expect(await screen.findByText('Spring Collection')).toBeVisible();

    // 6. Navigate to Orders
    const ordersNavLinks = screen.getAllByRole('link', { name: /Orders/i });
    await user.click(ordersNavLinks[0]);
    expect(await screen.findByRole('heading', { name: 'Customer Orders' })).toBeVisible();
    expect(await screen.findByText('KC-2026-00042')).toBeVisible();

    // 7. Click to open Order Details
    const orderLink = screen.getByRole('link', { name: 'KC-2026-00042' });
    await user.click(orderLink);

    // 8. Order Details page loads
    expect(await screen.findByRole('heading', { name: /Order #KC-2026-00042/i })).toBeVisible();
    expect(await screen.findByText('Priya Sharma')).toBeVisible();
    expect(screen.getByText('9876543210')).toBeVisible();

    // 9. Update order status from PLACED to CONFIRMED
    const markConfirmedBtn = screen.getByRole('button', { name: /Mark Confirmed/i });
    await user.click(markConfirmedBtn);

    const submitConfirm = screen.getByRole('button', { name: 'Mark as CONFIRMED' });
    await user.click(submitConfirm);

    await waitFor(() => {
      expect(screen.getByText('Order #KC-2026-00042 marked as CONFIRMED.')).toBeVisible();
    });

    // 10. Logout
    const logoutBtn = screen.getByRole('button', { name: /Log out of admin session/i });
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();
      expect(screen.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();
    });
  });
});

