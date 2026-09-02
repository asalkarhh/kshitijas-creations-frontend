import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { renderWithProviders } from '../test-utils';

describe('Complete Customer Journey E2E Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('navigates home -> catalogue -> product details -> add to cart -> checkout -> order success', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    // 1. Home page loads with Hero Banners and Categories
    expect(await screen.findByRole('heading', { name: /Shop by collection/i })).toBeVisible();

    // 2. Click "Products" in navigation
    const productsNav = screen.getByRole('link', { name: 'Products' });
    await user.click(productsNav);

    // 3. Products catalogue loads
    expect(
      await screen.findByRole('heading', { name: /Find something made for you/i }),
    ).toBeVisible();
    expect(await screen.findByText('Floral Earrings')).toBeVisible();

    // 4. Click product link to go to details
    const productLinks = await screen.findAllByRole('link', { name: 'Floral Earrings' });
    await user.click(productLinks[0]);

    // 5. Product detail page loads
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();
    expect(screen.getByText('₹500')).toBeVisible();

    // 6. Add to cart on product detail page
    const addToCartBtn = await screen.findByRole('button', { name: 'Add to cart' });
    await user.click(addToCartBtn);

    // 7. Open Cart
    const cartNavBtn = screen.getByRole('link', { name: /Cart with 1 items/i });
    await user.click(cartNavBtn);

    // 8. Review Cart page
    expect(await screen.findByRole('heading', { name: 'Shopping cart' })).toBeVisible();
    expect(screen.getByText('Floral Earrings')).toBeVisible();

    // 9. Proceed to Checkout
    const checkoutBtn = screen.getByRole('link', { name: /Proceed to Checkout/i });
    await user.click(checkoutBtn);

    // 10. Checkout Page loads
    expect(
      await screen.findByRole('heading', { name: /Where should we deliver\?/i }),
    ).toBeVisible();

    // 11. Fill Delivery Address Form
    await user.type(screen.getByLabelText(/Full name/i), 'Kavita Joshi');
    await user.type(screen.getByLabelText(/Mobile number/i), '9822012345');
    await user.type(screen.getByLabelText(/Complete delivery address/i), 'Flat 101, Anand Vihar, FC Road');
    await user.type(screen.getByLabelText(/City \/ Town/i), 'Pune');
    await user.type(screen.getByLabelText(/State/i), 'Maharashtra');
    await user.type(screen.getByLabelText(/PIN code/i), '411004');

    // 12. Submit Order
    const placeOrderBtn = screen.getByRole('button', { name: /Place Order/i });
    await user.click(placeOrderBtn);

    // 13. Order Success page loads
    expect(
      await screen.findByRole('heading', { name: /Order submitted successfully/i }),
    ).toBeVisible();
    expect(screen.getAllByText(/KC-2026-00001/i)[0]).toBeVisible();
    expect(screen.getByRole('link', { name: /Send order on WhatsApp/i })).toBeVisible();

    // 14. Cart is cleared
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Cart with 0 items/i })).toBeVisible();
    });
  });
});
