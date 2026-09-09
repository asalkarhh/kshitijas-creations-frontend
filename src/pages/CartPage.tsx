import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, Sparkles, ShieldCheck } from 'lucide-react';
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
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shopping cart' }]} />
      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-rose/30 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-maroon shadow-2xs font-sans">
            <Sparkles className="size-3 text-gold" />
            <span>Bag Review</span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink sm:text-5xl">Shopping cart</h1>
        </div>
        {items.length > 0 && (
          <button
            className="text-xs font-bold text-maroon hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon rounded-full px-3 py-1 bg-rose/30 hover:bg-rose/50 transition-colors font-sans"
            onClick={() => setConfirmClear(true)}
            type="button"
            aria-label="Clear complete cart"
          >
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-4xl border border-beige/80 bg-surface/90 p-8 sm:p-12 shadow-soft">
          <EmptyState
            action={
              <Link className="button-primary mt-4 shadow-md" to="/products">
                Browse products
              </Link>
            }
            description="Your cart is currently empty. Add pieces from our collection to get started."
            title="Your cart is waiting"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-9 lg:grid-cols-[1fr_24rem] lg:items-start">
          <div className="space-y-4">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  className="grid grid-cols-[5.5rem_1fr] gap-4 p-5 rounded-3xl border border-beige/80 bg-surface/90 shadow-soft sm:grid-cols-[7rem_1fr_auto] sm:items-center transition-all hover:border-gold/40"
                  key={item.productId}
                >
                  <Link
                    className="aspect-square overflow-hidden rounded-2xl bg-beige/40 border border-beige/60"
                    to={`/products/${item.slug}`}
                    aria-label={`View ${item.name} details`}
                  >
                    <ProductMedia
                      alt={item.imageAlt || item.name}
                      className="h-full w-full object-cover object-center"
                      src={item.primaryImageUrl || item.image}
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      className="font-display text-lg font-bold text-ink hover:text-maroon transition-colors line-clamp-1"
                      to={`/products/${item.slug}`}
                    >
                      {item.name}
                    </Link>
                    {item.productCode && (
                      <span className="mt-0.5 block text-[0.68rem] font-mono font-bold uppercase tracking-wider text-muted/70">
                        CODE: {item.productCode}
                      </span>
                    )}
                    <div className="mt-1.5 flex items-center gap-2 text-sm font-sans">
                      <span className="text-muted text-xs">Unit:</span>
                      <ProductPrice className="font-bold text-ink" price={item.price} />
                    </div>
                    <div className="mt-3.5 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-beige bg-canvas/60">
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
                          className="min-w-8 text-center text-sm font-extrabold text-ink font-sans"
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
                        className="grid size-9 place-items-center rounded-full text-muted hover:bg-rose/40 hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon transition-colors"
                        onClick={() => removeItem(item.productId)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-start-2 sm:col-auto sm:text-right">
                    <span className="text-xs text-muted block sm:hidden font-sans">Total:</span>
                    <p className="text-base font-black text-maroon font-sans">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-4">
              <Link className="button-secondary inline-flex items-center gap-2" to="/products">
                <ArrowLeft className="size-4" /> Continue Shopping
              </Link>
            </div>
          </div>

          <aside className="rounded-4xl border border-beige/80 bg-surface/90 p-6 sm:p-7 shadow-soft sticky top-28">
            <h2 className="font-display text-2xl font-bold text-ink">Order Summary</h2>
            <div className="mt-5 space-y-3 border-b border-beige/70 pb-5 text-sm font-sans">
              <div className="flex items-center justify-between">
                <span className="text-muted">Total Pieces</span>
                <span className="font-bold text-ink">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Subtotal</span>
                <strong className="text-2xl font-black text-maroon">{formatPrice(subtotal)}</strong>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-rose/25 p-3.5 text-xs text-muted font-sans leading-relaxed">
              <ShieldCheck className="size-4.5 text-maroon shrink-0 mt-0.5" />
              <span>Final price and product availability will be verified when you submit the order.</span>
            </div>

            <Link className="button-primary mt-6 w-full justify-center shadow-md hover:shadow-lg" to="/checkout">
              <ShoppingBag aria-hidden="true" className="size-4.5" />
              <span>Proceed to Checkout</span>
            </Link>
          </aside>
        </div>
      )}

      <ConfirmationDialog
        confirmLabel="Clear cart"
        description="This will remove every item currently saved in your shopping cart."
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearCart}
        title="Clear your cart?"
      />
    </div>
  );
};

export default CartPage;
