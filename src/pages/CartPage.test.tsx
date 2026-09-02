import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartPage from './CartPage';
import { renderWithProviders } from '../test/test-utils';
import { mockApiProducts } from '../test/mocks/handlers';
import { useCart } from '../store/cart-context';
import { useEffect } from 'react';

const CartPopulator = ({ children }: { children: React.ReactNode }) => {
  const { addProduct } = useCart();
  useEffect(() => {
    addProduct(mockApiProducts[0], 2); // Floral Earrings, price 500, qty 2
    addProduct(mockApiProducts[1], 1); // Rose Gold Studs, price 350, qty 1
  }, [addProduct]);
  return <>{children}</>;
};

const renderWithCartItems = () =>
  renderWithProviders(
    <CartPopulator>
      <CartPage />
    </CartPopulator>,
  );

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty cart state when no items are present', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByRole('heading', { name: 'Your cart is waiting' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Browse products' })).toHaveAttribute('href', '/products');
  });

  it('displays items, product codes, unit prices, quantities, and line totals', async () => {
    renderWithCartItems();

    expect(await screen.findByRole('link', { name: 'Floral Earrings' })).toBeVisible();
    expect(screen.getByText('CODE: FL-01')).toBeVisible();
    expect(screen.getByText('₹500')).toBeVisible(); // unit price
    expect(screen.getByText('₹1,000')).toBeVisible(); // line total

    expect(screen.getByRole('link', { name: 'Rose Gold Studs' })).toBeVisible();
    expect(screen.getByText('CODE: RG-02')).toBeVisible();

    // Check estimated subtotal
    expect(screen.getByText('₹1,350')).toBeVisible();

    // Check price disclaimer message
    expect(
      screen.getByText('Final price and product availability will be verified when you submit the order.'),
    ).toBeVisible();
  });

  it('handles quantity increase and decrease', async () => {
    const user = userEvent.setup();
    renderWithCartItems();

    expect(await screen.findByRole('link', { name: 'Floral Earrings' })).toBeVisible();

    const increaseBtn = screen.getByRole('button', { name: 'Increase Floral Earrings quantity' });
    const decreaseBtn = screen.getByRole('button', { name: 'Decrease Floral Earrings quantity' });

    await user.click(increaseBtn);
    expect(screen.getByLabelText('Quantity: 3')).toBeVisible();
    expect(screen.getByText('₹1,500')).toBeVisible();

    await user.click(decreaseBtn);
    expect(screen.getByLabelText('Quantity: 2')).toBeVisible();
    expect(screen.getByText('₹1,000')).toBeVisible();
  });

  it('removes an item when the trash button is clicked', async () => {
    const user = userEvent.setup();
    renderWithCartItems();

    expect(await screen.findByRole('link', { name: 'Floral Earrings' })).toBeVisible();

    const removeBtn = screen.getByRole('button', { name: 'Remove Rose Gold Studs from cart' });
    await user.click(removeBtn);

    expect(screen.queryByRole('link', { name: 'Rose Gold Studs' })).toBeNull();
  });

  it('confirms before clearing complete cart', async () => {
    const user = userEvent.setup();
    renderWithCartItems();

    expect(await screen.findByRole('link', { name: 'Floral Earrings' })).toBeVisible();

    const clearCartBtn = screen.getByRole('button', { name: 'Clear complete cart' });
    await user.click(clearCartBtn);

    // Confirmation dialog appears
    expect(screen.getByRole('heading', { name: 'Clear your cart?' })).toBeVisible();

    // Confirm clearing
    const confirmBtn = screen.getByRole('button', { name: 'Clear cart' });
    await user.click(confirmBtn);

    // Empty state is rendered
    expect(screen.getByRole('heading', { name: 'Your cart is waiting' })).toBeVisible();
  });

  it('navigates to checkout when Proceed to Checkout button is clicked', async () => {
    renderWithCartItems();
    expect(await screen.findByRole('link', { name: /Proceed to Checkout/i })).toHaveAttribute(
      'href',
      '/checkout',
    );
  });
});

