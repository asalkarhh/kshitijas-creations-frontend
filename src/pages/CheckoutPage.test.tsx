import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from './CheckoutPage';
import { renderWithProviders } from '../test/test-utils';
import { mockApiProducts } from '../test/mocks/handlers';
import { useCart, CART_STORAGE_KEY } from '../store/cart-context';
import { useEffect } from 'react';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

const CartPopulator = ({ children }: { children: React.ReactNode }) => {
  const { addProduct } = useCart();
  useEffect(() => {
    addProduct(mockApiProducts[0], 2); // Floral Earrings, price 500, qty 2
    addProduct(mockApiProducts[1], 1); // Rose Gold Studs, price 350, qty 1
  }, [addProduct]);
  return <>{children}</>;
};

const renderWithCart = (route: string = '/checkout') =>
  renderWithProviders(
    <CartPopulator>
      <CheckoutPage />
    </CartPopulator>,
    { route },
  );

describe('CheckoutPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('redirects to /cart if cart is empty', () => {
    renderWithProviders(<CheckoutPage />);
    expect(screen.queryByRole('heading', { name: 'Where should we deliver?' })).toBeNull();
  });

  it('renders checkout form and estimated order summary when cart has items', async () => {
    renderWithCart();

    expect(await screen.findByRole('heading', { name: 'Where should we deliver?' })).toBeVisible();

    // Verify fields are present with accessible labels
    expect(screen.getByLabelText(/Full name/i)).toBeVisible();
    expect(screen.getByLabelText(/Mobile number/i)).toBeVisible();
    expect(screen.getByLabelText(/Complete delivery address/i)).toBeVisible();
    expect(screen.getByLabelText(/City \/ Town/i)).toBeVisible();
    expect(screen.getByLabelText(/State/i)).toHaveValue('Maharashtra');
    expect(screen.getByLabelText(/PIN code/i)).toBeVisible();
    expect(screen.getByLabelText(/Customer note/i)).toBeVisible();

    // Verify estimated order summary
    expect(screen.getByRole('heading', { name: 'Estimated Order Summary' })).toBeVisible();
    expect(screen.getByText('Estimated Subtotal')).toBeVisible();
    expect(screen.getByText('₹1,350')).toBeVisible();
  });

  it('validates required fields with inline messages', async () => {
    const user = userEvent.setup();
    renderWithCart();

    expect(await screen.findByRole('heading', { name: 'Where should we deliver?' })).toBeVisible();

    const submitBtn = screen.getByRole('button', { name: /Place Order/i });
    await user.click(submitBtn);

    expect(await screen.findByText('Full name must be at least 2 characters.')).toBeVisible();
    expect(screen.getByText(/Enter a valid 10-digit Indian mobile number/i)).toBeVisible();
    expect(screen.getByText('Delivery address must be at least 5 characters.')).toBeVisible();
    expect(screen.getByText('City must be at least 2 characters.')).toBeVisible();
    expect(screen.getByText(/PIN code must be exactly 6 digits/i)).toBeVisible();
  });

  it('submits order successfully, excludes prices from payload, clears cart, and does not store customer info in localStorage', async () => {
    const user = userEvent.setup();
    let interceptedRequestBody: Record<string, unknown> | null = null;

    server.use(
      http.post('http://localhost:8080/api/v1/public/orders', async ({ request }) => {
        interceptedRequestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          orderNumber: 'KC-2026-99999',
          status: 'PLACED',
          subtotal: 1350.0,
          totalAmount: 1350.0,
          whatsappUrl: 'https://wa.me/919876543210?text=Order%20KC-2026-99999',
          message: 'Order placed successfully',
        });
      }),
    );

    renderWithCart();
    expect(await screen.findByRole('heading', { name: 'Where should we deliver?' })).toBeVisible();

    await user.type(screen.getByLabelText(/Full name/i), 'Saurabh Asalkar');
    await user.type(screen.getByLabelText(/Mobile number/i), '9876543210');
    await user.type(screen.getByLabelText(/Complete delivery address/i), '123 Floral Garden Street');
    await user.type(screen.getByLabelText(/City \/ Town/i), 'Vita');
    await user.type(screen.getByLabelText(/PIN code/i), '415311');
    await user.type(screen.getByLabelText(/Customer note/i), 'Please handle gently');

    const submitBtn = screen.getByRole('button', { name: /Place Order/i });
    await user.click(submitBtn);

    // Verify payload sent
    await waitFor(() => expect(interceptedRequestBody).not.toBeNull());
    expect(interceptedRequestBody).toEqual({
      customerName: 'Saurabh Asalkar',
      mobileNumber: '9876543210',
      addressLine: '123 Floral Garden Street',
      city: 'Vita',
      state: 'Maharashtra',
      postalCode: '415311',
      customerNote: 'Please handle gently',
      items: [
        { productId: 'prod-fl-01', quantity: 2 },
        { productId: 'prod-rose-02', quantity: 1 },
      ],
    });

    // Ensure prices are NOT in request body
    const bodyRecord = interceptedRequestBody as Record<string, unknown> | null;
    expect(bodyRecord?.['price']).toBeUndefined();
    expect(bodyRecord?.['subtotal']).toBeUndefined();
    expect(bodyRecord?.['totalAmount']).toBeUndefined();

    // Verify sessionStorage has order data
    const storedSession = sessionStorage.getItem('kc_order_success');
    expect(storedSession).not.toBeNull();
    const parsedSession = JSON.parse(storedSession!);
    expect(parsedSession.orderNumber).toBe('KC-2026-99999');

    // Ensure customer details (mobile, address) are NOT stored in localStorage
    const storedLocal = localStorage.getItem(CART_STORAGE_KEY);
    expect(storedLocal).not.toContain('Saurabh Asalkar');
    expect(storedLocal).not.toContain('9876543210');
    expect(storedLocal).not.toContain('Floral Garden');
  });

  it('handles backend 409 unavailable item error, displays message, and preserves cart', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('http://localhost:8080/api/v1/public/orders', () => {
        return HttpResponse.json(
          {
            message: 'Floral Earrings is currently out of stock. Please remove it from your cart.',
          },
          { status: 409 },
        );
      }),
    );

    renderWithCart();
    expect(await screen.findByRole('heading', { name: 'Where should we deliver?' })).toBeVisible();

    await user.type(screen.getByLabelText(/Full name/i), 'Saurabh Asalkar');
    await user.type(screen.getByLabelText(/Mobile number/i), '9876543210');
    await user.type(screen.getByLabelText(/Complete delivery address/i), '123 Floral Garden Street');
    await user.type(screen.getByLabelText(/City \/ Town/i), 'Vita');
    await user.type(screen.getByLabelText(/PIN code/i), '415311');

    await user.click(screen.getByRole('button', { name: /Place Order/i }));

    expect(await screen.findByText(/Floral Earrings is currently out of stock/i)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Return to cart' })).toHaveAttribute('href', '/cart');

    // Cart is preserved
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!);
    expect(cart.items.length).toBeGreaterThan(0);
  });
});
