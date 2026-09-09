import { CheckCircle2, MessageCircle, ShoppingBag, AlertCircle, Copy, Check, Sparkles } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { useToast } from '../components/common/Toast';
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

  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

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

  const copyOrderNumber = () => {
    if (!orderData?.orderNumber) return;
    navigator.clipboard.writeText(orderData.orderNumber);
    setCopied(true);
    showToast(`Copied Order #${orderData.orderNumber} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!orderData || !orderData.orderNumber) {
    return (
      <div className="site-container py-16 text-center">
        <div className="mx-auto max-w-md rounded-4xl border border-beige/80 bg-surface/90 p-8 shadow-soft">
          <AlertCircle className="mx-auto size-12 text-muted/60" />
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">No recent order found</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted font-sans">
            If you recently submitted an order, it may have already been processed. You can browse our collection to start a new order.
          </p>
          <Link className="button-primary mt-6 inline-flex items-center gap-2 shadow-md" to="/products">
            <ShoppingBag className="size-4" /> <span>Continue Shopping</span>
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
          { label: 'Order Confirmation' },
        ]}
      />

      <div className="mx-auto mt-8 max-w-2xl rounded-5xl border border-beige/80 bg-surface/95 p-6 shadow-float sm:p-12 text-center">
        {/* Celebration Badge */}
        <div className="relative mx-auto grid size-24 place-items-center rounded-full bg-emerald-50 text-emerald-600 shadow-glow border border-emerald-200/60">
          <CheckCircle2 aria-hidden="true" className="size-14" strokeWidth={1.8} />
          <Sparkles className="absolute -top-1 -right-1 size-6 text-gold animate-bounce" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 font-sans">
          <span>Order Successfully Saved</span>
        </div>

        <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl text-ink" tabIndex={-1}>
          Order submitted successfully
        </h1>

        {/* Order Details Card */}
        <div className="my-8 rounded-3xl bg-canvas/70 border border-beige/80 p-6 text-left space-y-3.5 shadow-2xs font-sans">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Order Number</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-ink text-base sm:text-lg">{orderData.orderNumber}</span>
              <button
                type="button"
                onClick={copyOrderNumber}
                aria-label="Copy order number"
                className="p-1.5 rounded-full hover:bg-rose/40 text-muted hover:text-maroon transition-colors"
              >
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Order Status</span>
            <span className="rounded-full bg-surface px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-maroon border border-maroon/20">
              {orderData.status || 'PLACED'}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-beige/60 pt-3.5">
            <span className="text-sm font-bold text-ink">Order Total</span>
            <strong className="text-xl font-black text-maroon">{formatPrice(finalTotal)}</strong>
          </div>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-muted max-w-lg mx-auto font-sans">
          Your order has been saved. To notify Kshitija’s Creations immediately, please click below and press Send in WhatsApp.
        </p>

        {/* Big Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {hasSafeWhatsAppUrl && orderData.whatsappUrl ? (
            <a
              className="button-whatsapp w-full sm:w-auto min-h-13 px-8 text-base shadow-md hover:shadow-xl inline-flex items-center justify-center gap-2.5 font-sans animate-pulse-glow"
              href={orderData.whatsappUrl}
              onClick={handleWhatsAppClick}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" className="size-5.5 fill-white text-white" />
              <span>Send Order on WhatsApp</span>
            </a>
          ) : (
            <button
              className="button-primary w-full sm:w-auto min-h-13 px-8 text-base opacity-75 cursor-not-allowed font-sans"
              disabled
              type="button"
            >
              <MessageCircle aria-hidden="true" className="size-5.5" />
              <span>Send Order on WhatsApp</span>
            </button>
          )}

          <Link
            className="button-secondary w-full sm:w-auto min-h-13 px-6 inline-flex items-center justify-center gap-2 font-sans"
            to="/products"
          >
            <ShoppingBag className="size-4.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted/80 font-sans">
          Questions about this order? Reach out anytime quoting Order <strong className="text-ink font-mono font-bold">#{orderData.orderNumber}</strong>.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
