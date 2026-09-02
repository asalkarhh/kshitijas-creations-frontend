import { screen } from '@testing-library/react';
import App from './App';
import { renderWithProviders } from './test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from './api/client';

describe('application routes', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('renders the homepage', async () => {
    renderWithProviders(<App />);
    expect(
      await screen.findByRole('heading', { name: /Shop by collection/i }),
    ).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });

  it('renders the 404 page for an unknown route', async () => {
    renderWithProviders(<App />, { route: '/this-does-not-exist' });
    expect(await screen.findByRole('heading', { name: 'This page wandered away' })).toBeVisible();
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/');
  });

  it('redirects unauthenticated user accessing /admin to /admin/login', async () => {
    renderWithProviders(<App />, { route: '/admin' });
    expect(await screen.findByRole('heading', { name: 'Admin Portal' })).toBeVisible();
  });

  it('redirects authenticated admin accessing /admin/login to /admin dashboard', async () => {
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
    renderWithProviders(<App />, { route: '/admin/login' });
    expect(await screen.findByRole('heading', { name: /Welcome back, Kshitija Asalkar/i })).toBeVisible();
  });
});
