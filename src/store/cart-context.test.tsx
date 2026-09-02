import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { mockApiProducts } from '../test/mocks/handlers';
import { formatPrice } from '../utils/currency';
import {
  CART_STORAGE_KEY,
  CartProvider,
  MAX_ITEM_QUANTITY,
  cartReducer,
  useCart,
} from './cart-context';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/common/Toast';
import { render } from '@testing-library/react';

const CartHarness = () => {
  const { items, itemCount, subtotal, addProduct, removeItem, increaseQuantity } = useCart();
  const unavailableProduct = mockApiProducts.find((p) => !p.isAvailable) || {
    ...mockApiProducts[0],
    id: 'unavail-1',
    isAvailable: false,
    available: false,
  };

  return (
    <div>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <span data-testid="item-length">{items.length}</span>
      <span data-testid="quantity">{items[0]?.quantity ?? 0}</span>
      <button onClick={() => addProduct(mockApiProducts[0])} type="button">
        Add
      </button>
      <button onClick={() => addProduct(mockApiProducts[0], 2)} type="button">
        Add Multiple
      </button>
      <button onClick={() => addProduct(unavailableProduct)} type="button">
        Add Unavailable
      </button>
      <button onClick={() => items[0] && removeItem(items[0].productId)} type="button">
        Remove
      </button>
      <button onClick={() => items[0] && increaseQuantity(items[0].productId)} type="button">
        Increase
      </button>
    </div>
  );
};

const renderCartOnly = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <ToastProvider>
          <CartHarness />
        </ToastProvider>
      </CartProvider>
    </MemoryRouter>,
  );

describe('cart store', () => {
  it('adds and removes items and calculates the subtotal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartHarness />);
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('subtotal')).toHaveTextContent(String(mockApiProducts[0].price));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('prevents duplicate cart lines and increments quantity instead', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartHarness />);
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Add Multiple' }));

    expect(screen.getByTestId('item-length')).toHaveTextContent('1');
    expect(screen.getByTestId('quantity')).toHaveTextContent('3');
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('rejects adding unavailable products', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartHarness />);
    await user.click(screen.getByRole('button', { name: 'Add Unavailable' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('persists and restores cart items', async () => {
    const user = userEvent.setup();
    const firstRender = renderCartOnly();
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() =>
      expect(localStorage.getItem(CART_STORAGE_KEY)).toContain(mockApiProducts[0].id),
    );
    firstRender.unmount();
    renderCartOnly();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('limits quantity to 20', () => {
    const product = mockApiProducts[0];
    const media = product.media[0];
    let state = {
      items: [
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: media.url,
          imageAlt: media.altText,
          quantity: 1,
        },
      ],
    };
    for (let index = 0; index < MAX_ITEM_QUANTITY + 5; index += 1) {
      state = cartReducer(state, { type: 'increase', productId: product.id });
    }
    expect(state.items[0].quantity).toBe(MAX_ITEM_QUANTITY);
  });
});

describe('price formatting', () => {
  it('formats prices in Indian rupees', () => {
    expect(formatPrice(1299)).toContain('₹');
    expect(formatPrice(1299).replace(/\D/g, '')).toBe('1299');
  });
});
