import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLoginPage from './AdminLoginPage';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';

describe('AdminLoginPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('renders login form with accessible fields and return link', () => {
    renderWithProviders(<AdminLoginPage />, { route: '/admin/login' });

    expect(screen.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();
    expect(screen.getByLabelText(/Admin email/i)).toBeVisible();
    expect(screen.getByLabelText(/^Password/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Return to public store/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('validates email and password fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLoginPage />, { route: '/admin/login' });

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    expect(await screen.findByText('Email address is required.')).toBeVisible();
    expect(screen.getByText('Password is required.')).toBeVisible();

    // Invalid email format
    await user.type(screen.getByLabelText(/Admin email/i), 'not-an-email');
    await user.click(submitBtn);
    expect(await screen.findByText('Please enter a valid email address.')).toBeVisible();
  });

  it('toggles password visibility between text and password input types', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLoginPage />, { route: '/admin/login' });

    const passwordInput = screen.getByLabelText(/^Password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows generic invalid credentials error message on authentication failure', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLoginPage />, { route: '/admin/login' });

    await user.type(screen.getByLabelText(/Admin email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'incorrect-password');

    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(
      await screen.findByText(
        'Invalid email or password. Please check your credentials and try again.',
      ),
    ).toBeVisible();
  });

  it('authenticates successfully and saves token in sessionStorage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminLoginPage />, { route: '/admin/login' });

    await user.type(screen.getByLabelText(/Admin email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'password');

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    await waitFor(() =>
      expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBe('mock-jwt-token-xyz'),
    );
  });
});

