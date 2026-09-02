import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { useAuth, sanitizeAdminRedirect } from './auth-context';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';
import { CART_STORAGE_KEY, useCart } from './cart-context';
import { mockApiProducts } from '../test/mocks/handlers';
import { useEffect } from 'react';

const AuthHarness = () => {
  const { admin, accessToken, isAuthenticated, isInitializing, login, logout } = useAuth();
  const { addProduct } = useCart();

  useEffect(() => {
    // Populate public cart
    addProduct(mockApiProducts[0]);
  }, [addProduct]);

  return (
    <div>
      <span data-testid="is-init">{String(isInitializing)}</span>
      <span data-testid="is-auth">{String(isAuthenticated)}</span>
      <span data-testid="admin-name">{admin?.name ?? 'Anonymous'}</span>
      <span data-testid="admin-role">{admin?.role ?? 'None'}</span>
      <span data-testid="token">{accessToken ?? 'None'}</span>
      <button
        onClick={() => login({ email: 'admin@example.com', password: 'password' })}
        type="button"
      >
        Login Success
      </button>
      <button
        onClick={() => login({ email: 'admin@example.com', password: 'wrong' })}
        type="button"
      >
        Login Failure
      </button>
      <button onClick={logout} type="button">
        Logout
      </button>
    </div>
  );
};

describe('auth-context and session management', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('initializes with unauthenticated state when no token is in sessionStorage', async () => {
    renderWithProviders(<AuthHarness />);
    await waitFor(() => expect(screen.getByTestId('is-init')).toHaveTextContent('false'));
    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
    expect(screen.getByTestId('admin-name')).toHaveTextContent('Anonymous');
  });

  it('restores admin session when a valid token is present in sessionStorage via /auth/me', async () => {
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
    renderWithProviders(<AuthHarness />);

    await waitFor(() => expect(screen.getByTestId('is-init')).toHaveTextContent('false'));
    expect(screen.getByTestId('is-auth')).toHaveTextContent('true');
    expect(screen.getByTestId('admin-name')).toHaveTextContent('Kshitija Asalkar');
    expect(screen.getByTestId('admin-role')).toHaveTextContent('ADMIN');
  });

  it('clears invalid or expired token from sessionStorage on startup failure', async () => {
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'invalid-expired-token');
    renderWithProviders(<AuthHarness />);

    await waitFor(() => expect(screen.getByTestId('is-init')).toHaveTextContent('false'));
    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('logs in successfully, updates state, and stores token in sessionStorage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthHarness />);

    await waitFor(() => expect(screen.getByTestId('is-init')).toHaveTextContent('false'));
    await user.click(screen.getByRole('button', { name: 'Login Success' }));

    await waitFor(() => expect(screen.getByTestId('is-auth')).toHaveTextContent('true'));
    expect(screen.getByTestId('admin-name')).toHaveTextContent('Kshitija Asalkar');
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBe('mock-jwt-token-xyz');
  });

  it('logout clears sessionStorage and auth state but preserves customer public cart', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');

    renderWithProviders(<AuthHarness />);
    await waitFor(() => expect(screen.getByTestId('is-auth')).toHaveTextContent('true'));

    // Verify public cart exists in localStorage
    expect(localStorage.getItem(CART_STORAGE_KEY)).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();

    // Verify public cart was NOT wiped out by admin logout
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!);
    expect(cart.items.length).toBeGreaterThan(0);
  });
});

describe('sanitizeAdminRedirect', () => {
  it('allows safe internal /admin paths', () => {
    expect(sanitizeAdminRedirect('/admin/products')).toBe('/admin/products');
    expect(sanitizeAdminRedirect('/admin/orders/123')).toBe('/admin/orders/123');
    expect(sanitizeAdminRedirect('/admin')).toBe('/admin');
  });

  it('rejects external URLs and unsafe schemes', () => {
    expect(sanitizeAdminRedirect('https://malicious.com')).toBe('/admin');
    expect(sanitizeAdminRedirect('//malicious.com')).toBe('/admin');
    expect(sanitizeAdminRedirect('javascript:alert(1)')).toBe('/admin');
    expect(sanitizeAdminRedirect(null)).toBe('/admin');
    expect(sanitizeAdminRedirect('')).toBe('/admin');
  });
});
