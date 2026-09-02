import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderSuccessPage from './OrderSuccessPage';
import { renderWithProviders } from '../test/test-utils';

const ORDER_STORAGE_KEY = 'kc_order_success';

describe('OrderSuccessPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders safe empty state when no recent order is in session storage', () => {
    renderWithProviders(<OrderSuccessPage />);
    expect(screen.getByRole('heading', { name: 'No recent order found' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Continue Shopping/i })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('displays order confirmation details, backend-calculated total, and safe WhatsApp link', async () => {
    sessionStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify({
        orderNumber: 'KC-2026-00042',
        status: 'PLACED',
        subtotal: 1398.0,
        totalAmount: 1398.0,
        whatsappUrl: 'https://wa.me/919876543210?text=Hello%20KC',
      }),
    );

    renderWithProviders(<OrderSuccessPage />);

    expect(
      await screen.findByRole('heading', { name: 'Order submitted successfully' }),
    ).toBeVisible();
    expect(screen.getAllByText('KC-2026-00042').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('PLACED')).toBeVisible();
    expect(screen.getByText('₹1,398')).toBeVisible();

    // Verify clear explanation message
    expect(
      screen.getByText(
        'Your order has been saved. To notify Kshitija’s Creations immediately, please click below and press Send in WhatsApp.',
      ),
    ).toBeVisible();

    // Verify WhatsApp button attributes
    const whatsappLink = screen.getByRole('link', { name: /Send Order on WhatsApp/i });
    expect(whatsappLink).toHaveAttribute(
      'href',
      'https://wa.me/919876543210?text=Hello%20KC',
    );
    expect(whatsappLink).toHaveAttribute('target', '_blank');
    expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Ensure WhatsApp phone number is NOT directly rendered as text on page
    expect(screen.queryByText('919876543210')).toBeNull();
  });

  it('disables WhatsApp action if returned URL is unsafe or invalid scheme', () => {
    sessionStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify({
        orderNumber: 'KC-2026-00043',
        status: 'PLACED',
        totalAmount: 500,
        whatsappUrl: 'javascript:alert(1)',
      }),
    );

    renderWithProviders(<OrderSuccessPage />);

    expect(screen.getByRole('heading', { name: 'Order submitted successfully' })).toBeVisible();
    const whatsappBtn = screen.getByRole('button', { name: /Send Order on WhatsApp/i });
    expect(whatsappBtn).toBeDisabled();
  });

  it('triggers analytics event on clicking WhatsApp button', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify({
        orderNumber: 'KC-2026-00044',
        status: 'PLACED',
        totalAmount: 750,
        whatsappUrl: 'https://wa.me/919876543210?text=Order%20KC',
      }),
    );

    let eventFired = false;
    window.addEventListener('kc:analytics', (e: Event) => {
      const customEvent = e as CustomEvent<{ eventName: string }>;
      if (customEvent.detail?.eventName === 'whatsapp_button_clicked') {
        eventFired = true;
      }
    });

    renderWithProviders(<OrderSuccessPage />);
    const whatsappLink = await screen.findByRole('link', { name: /Send Order on WhatsApp/i });
    await user.click(whatsappLink);

    expect(eventFired).toBe(true);
  });
});
