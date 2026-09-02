import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { EmptyState } from '../components/common/EmptyState';
import { ProductMedia } from '../components/product/ProductMedia';
import { ProductPrice } from '../components/product/ProductPrice';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { MAX_ITEM_QUANTITY, useCart } from '../store/cart-context';
import { formatPrice } from '../utils/currency';

const CartPage = () => {
  const { items, subtotal, removeItem, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  usePageMetadata({
    title: 'Your cart',
    description: 'Review the handmade pieces saved in your cart.',
    canonicalPath: '/cart',
  });

  return (
    <div className="site-container py-10 sm:py-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">
            Your selection
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Shopping cart</h1>
        </div>
        {items.length > 0 && (
          <button
            className="text-sm font-semibold text-maroon hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon rounded"
            onClick={() => setConfirmClear(true)}
            type="button"
            aria-label="Clear complete cart"
          >
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            action={
              <Link className="button-primary" to="/products">
                Browse products
              </Link>
            }
            description="Explore the collection and add a handmade piece you love."
            title="Your cart is waiting"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-9 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="space-y-6">
            <ul className="divide-y divide-beige border-y border-beige">
              {items.map((item) => (
                <li
                  className="grid grid-cols-[5.5rem_1fr] gap-4 py-5 sm:grid-cols-[7rem_1fr_auto] sm:items-center"
                  key={item.productId}
                >
                  <Link
                    className="aspect-square overflow-hidden rounded-2xl bg-beige"
                    to={`/products/${item.slug}`}
                    aria-label={`View ${item.name} details`}
                  >
                    <ProductMedia
                      alt={item.imageAlt || item.name}
                      className="object-[70%_center]"
                      src={item.primaryImageUrl || item.image}
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      className="font-display text-lg text-ink hover:text-maroon"
                      to={`/products/${item.slug}`}
                    >
                      {item.name}
                    </Link>
                    {item.productCode && (
                      <span className="mt-0.5 block text-xs font-bold uppercase tracking-wider text-muted">
                        CODE: {item.productCode}
                      </span>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className="text-muted text-xs">Unit price:</span>
                      <ProductPrice className="font-medium" price={item.price} />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-beige bg-surface">
                        <button
                          aria-label={`Decrease ${item.name} quantity`}
                          className="quantity-button"
                          disabled={item.quantity <= 1}
                          onClick={() => decreaseQuantity(item.productId)}
                          type="button"
                        >
                          <Minus aria-hidden="true" className="size-3.5" />
                        </button>
                        <span
                          aria-label={`Quantity: ${item.quantity}`}
                          className="min-w-8 text-center text-sm font-semibold text-ink"
                        >
                          {item.quantity}
                        </span>
                        <button
                          aria-label={`Increase ${item.name} quantity`}
                          className="quantity-button"
                          disabled={item.quantity >= MAX_ITEM_QUANTITY}
                          onClick={() => increaseQuantity(item.productId)}
                          type="button"
                        >
                          <Plus aria-hidden="true" className="size-3.5" />
                        </button>
                      </div>
                      <button
                        aria-label={`Remove ${item.name} from cart`}
                        className="grid size-9 place-items-center rounded-full text-muted hover:bg-rose/30 hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
                        onClick={() => removeItem(item.productId)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-start-2 sm:col-auto sm:text-right">
                    <span className="text-xs text-muted block sm:hidden">Line total:</span>
                    <p className="text-sm font-bold text-ink">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-2">
              <Link className="button-secondary inline-flex items-center gap-2" to="/products">
                <ArrowLeft className="size-4" /> Continue Shopping
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-beige bg-surface p-6 shadow-soft">
            <h2 className="font-display text-2xl text-ink">Order summary</h2>
            <div className="mt-5 flex items-center justify-between border-b border-beige pb-5 text-sm">
              <span className="text-muted">Estimated Subtotal</span>
              <strong className="text-lg text-maroon">{formatPrice(subtotal)}</strong>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted">
              Final price and product availability will be verified when you submit the order.
            </p>
            <Link className="button-primary mt-6 w-full justify-center" to="/checkout">
              <ShoppingBag aria-hidden="true" className="size-4" /> Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}

      <ConfirmationDialog
        confirmLabel="Clear cart"
        description="This will remove every item currently saved in your cart."
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearCart}
        title="Clear your cart?"
      />
    </div>
  );
};

export default CartPage;
