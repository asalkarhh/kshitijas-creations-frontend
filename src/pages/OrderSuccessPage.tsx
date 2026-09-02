import { CheckCircle2, MessageCircleHeart, ShoppingBag, AlertCircle } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { usePageMetadata } from '../hooks/use-page-metadata';
import type { CreateOrderResponse } from '../types';
import { trackEvent } from '../utils/analytics';
import { formatPrice } from '../utils/currency';

const ORDER_STORAGE_KEY = 'kc_order_success';

interface StoredOrderData extends Partial<CreateOrderResponse> {
  timestamp?: string;
}

const isValidWhatsAppUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'wa.me' ||
        parsed.hostname === 'api.whatsapp.com' ||
        parsed.hostname === 'web.whatsapp.com')
    );
  } catch {
    return false;
  }
};

const OrderSuccessPage = () => {
  usePageMetadata({
    title: 'Order submitted successfully',
    description: 'Your handmade order has been submitted. Confirm with WhatsApp.',
    canonicalPath: '/order-success',
  });

  const [orderData, setOrderData] = useState<StoredOrderData | null>(() => {
    try {
      const stored = sessionStorage.getItem(ORDER_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.orderNumber === 'string') {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(ORDER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.orderNumber === 'string') {
          setOrderData(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const hasSafeWhatsAppUrl = useMemo(
    () => isValidWhatsAppUrl(orderData?.whatsappUrl),
    [orderData?.whatsappUrl],
  );

  const handleWhatsAppClick = () => {
    if (orderData?.orderNumber) {
      trackEvent('whatsapp_button_clicked', {
        orderNumber: orderData.orderNumber,
        status: orderData.status,
      });
    }
  };

  if (!orderData || !orderData.orderNumber) {
    return (
      <div className="site-container py-16 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-beige bg-surface p-8 shadow-soft">
          <AlertCircle className="mx-auto size-12 text-muted" />
          <h1 className="mt-4 font-display text-2xl text-ink">No recent order found</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            If you recently submitted an order, it may have already been confirmed. You can browse our collection to start a new order.
          </p>
          <Link className="button-primary mt-6 inline-flex items-center gap-2" to="/products">
            <ShoppingBag className="size-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const finalTotal = orderData.totalAmount ?? orderData.subtotal ?? 0;

  return (
    <div className="site-container py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Checkout', to: '/checkout' },
          { label: 'Order confirmation' },
        ]}
      />

      <div className="mx-auto mt-8 max-w-2xl rounded-4xl border border-beige bg-surface p-6 shadow-soft sm:p-10 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 aria-hidden="true" className="size-12" strokeWidth={1.75} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">
          Order received
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl text-ink font-bold" tabIndex={-1}>
          Order submitted successfully
        </h1>

        <div className="my-6 rounded-2xl bg-beige/40 p-5 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Order Number</span>
            <span className="font-mono font-bold text-ink text-base sm:text-lg">{orderData.orderNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Order Status</span>
            <span className="rounded-full bg-surface px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-maroon border border-beige">
              {orderData.status || 'PLACED'}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-beige/60 pt-3">
            <span className="text-sm font-semibold text-ink">Final Order Total</span>
            <strong className="text-lg font-bold text-maroon">{formatPrice(finalTotal)}</strong>
          </div>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-muted max-w-lg mx-auto">
          Your order has been saved. To notify Kshitija’s Creations immediately, please click below and press Send in WhatsApp.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {hasSafeWhatsAppUrl && orderData.whatsappUrl ? (
            <a
              className="button-primary w-full sm:w-auto min-h-12 px-8 text-base shadow-soft hover:shadow-lg inline-flex items-center justify-center gap-2"
              href={orderData.whatsappUrl}
              onClick={handleWhatsAppClick}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircleHeart aria-hidden="true" className="size-5" /> Send Order on WhatsApp
            </a>
          ) : (
            <button
              className="button-primary w-full sm:w-auto min-h-12 px-8 text-base opacity-75 cursor-not-allowed"
              disabled
              type="button"
            >
              <MessageCircleHeart aria-hidden="true" className="size-5" /> Send Order on WhatsApp
            </button>
          )}

          <Link
            className="button-secondary w-full sm:w-auto min-h-12 px-6 inline-flex items-center justify-center gap-2"
            to="/products"
          >
            <ShoppingBag className="size-4" /> Continue Shopping
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted">
          Need help with your order? Reach out with order number <strong className="text-ink">{orderData.orderNumber}</strong>.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
