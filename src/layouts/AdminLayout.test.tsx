import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLayout from './AdminLayout';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';

describe('AdminLayout', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('renders sidebar navigation links and logged-in admin identity', async () => {
    renderWithProviders(<AdminLayout />);

    expect(await screen.findByText('Kshitija Asalkar')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute(
      'href',
      '/admin/categories',
    );
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute(
      'href',
      '/admin/products',
    );
    expect(screen.getByRole('link', { name: 'Banners' })).toHaveAttribute(
      'href',
      '/admin/banners',
    );
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute(
      'href',
      '/admin/orders',
    );
  });

  it('opens and closes mobile navigation drawer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLayout />);

    expect(await screen.findByText('Kshitija Asalkar')).toBeVisible();

    const mobileToggle = screen.getByRole('button', { name: /Open navigation menu/i });
    await user.click(mobileToggle);

    expect(screen.getByRole('dialog', { name: 'Admin mobile navigation' })).toBeVisible();

    const closeBtn = screen.getByRole('button', { name: /Close mobile navigation/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('dialog', { name: 'Admin mobile navigation' })).toBeNull();
  });
});

