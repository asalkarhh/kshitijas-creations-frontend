import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboardPage from './AdminDashboardPage';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('renders dashboard greeting, statistics cards, and quick actions', async () => {
    renderWithProviders(<AdminDashboardPage />);

    // Greeting
    expect(await screen.findByRole('heading', { name: /Welcome back, Kshitija Asalkar/i })).toBeVisible();

    // Quick actions
    expect(screen.getByRole('link', { name: /Add Product/i })).toHaveAttribute(
      'href',
      '/admin/products/new',
    );
    expect(screen.getByRole('link', { name: /Add Banner/i })).toHaveAttribute(
      'href',
      '/admin/banners',
    );
    expect(screen.getByRole('link', { name: /View Orders/i })).toHaveAttribute(
      'href',
      '/admin/orders',
    );
    expect(screen.getByRole('link', { name: /Public Store/i })).toHaveAttribute(
      'href',
      '/',
    );

    // Summary cards
    expect(await screen.findByText('42')).toBeVisible(); // Total Products
    expect(screen.getByText('36')).toBeVisible(); // Available Products
    expect(screen.getByText('128')).toBeVisible(); // Total Orders
    expect(screen.getAllByText('8').length).toBe(2); // Placed Orders and Cancelled Orders
    expect(screen.getByText('14')).toBeVisible(); // Confirmed Orders
    expect(screen.getByText('98')).toBeVisible(); // Completed Orders
  });

  it('displays recent orders table with customer name, city, formatted total, and status badges', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('KC-2026-00042')).toBeVisible();
    expect(screen.getByText('Priya Sharma')).toBeVisible();
    expect(screen.getByText('Pune')).toBeVisible();
    expect(screen.getByText('₹1,850')).toBeVisible();
    expect(screen.getByText('Placed')).toBeVisible();

    expect(screen.getByText('KC-2026-00041')).toBeVisible();
    expect(screen.getByText('Ananya Deshmukh')).toBeVisible();
    expect(screen.getByText('₹2,400')).toBeVisible();
    expect(screen.getByText('Confirmed')).toBeVisible();

    expect(screen.getByText('KC-2026-00040')).toBeVisible();
    expect(screen.getByText('Rohan Patil')).toBeVisible();
    expect(screen.getByText('Completed')).toBeVisible();
  });

  it('displays empty state when recent orders list is empty', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/admin/dashboard', () => {
        return HttpResponse.json({
          stats: {
            totalProducts: 10,
            availableProducts: 8,
            totalOrders: 0,
            placedOrders: 0,
            confirmedOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
          },
          recentOrders: [],
        });
      }),
    );

    renderWithProviders(<AdminDashboardPage />);
    expect(await screen.findByRole('heading', { name: 'No recent orders yet' })).toBeVisible();
  });

  it('handles dashboard API error with a retry action', async () => {
    const user = userEvent.setup();
    let fail = true;

    server.use(
      http.get('http://localhost:8080/api/v1/admin/dashboard', () => {
        if (fail) {
          return HttpResponse.json({ message: 'Dashboard service unavailable' }, { status: 500 });
        }
        return HttpResponse.json({
          stats: {
            totalProducts: 55,
            availableProducts: 50,
            totalOrders: 200,
            placedOrders: 10,
            confirmedOrders: 20,
            completedOrders: 160,
            cancelledOrders: 10,
          },
          recentOrders: [],
        });
      }),
    );

    renderWithProviders(<AdminDashboardPage />);
    expect(await screen.findByText('Unable to load dashboard data')).toBeVisible();

    fail = false;
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    await user.click(retryBtn);

    expect(await screen.findByText('55')).toBeVisible();
  });
});
