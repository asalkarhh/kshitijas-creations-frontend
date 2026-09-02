import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LockKeyhole, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProductMedia } from '../components/product/ProductMedia';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { checkoutSchema, type CheckoutFormValues } from '../schemas/checkout';
import { useCart } from '../store/cart-context';
import type { ApiError } from '../types';
import { trackEvent } from '../utils/analytics';
import { formatPrice } from '../utils/currency';

const ORDER_STORAGE_KEY = 'kc_order_success';

const CheckoutPage = () => {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  usePageMetadata({
    title: 'Guest checkout',
    description: 'Enter your delivery address to complete your handmade order.',
    canonicalPath: '/checkout',
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      mobileNumber: '',
      addressLine: '',
      city: '',
      state: 'Maharashtra',
      postalCode: '',
      customerNote: '',
    },
  });

  useEffect(() => {
    if (items.length > 0) {
      trackEvent('checkout_started', {
        itemCount: totalItems,
        subtotal,
      });
    }
  }, [items.length, totalItems, subtotal]);

  const isSubmittedRef = useState(false);
  const [isSubmitted, setIsSubmitted] = isSubmittedRef;

  // If cart is empty and not just submitted, redirect to /cart immediately
  if (items.length === 0 && !isSubmitted) {
    return <Navigate replace to="/cart" />;
  }

  const onSubmit = async (formValues: CheckoutFormValues) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Build order payload strictly with delivery details and product items
      // Do NOT send prices, names, subtotals, or WhatsApp numbers
      const payload = {
        customerName: formValues.customerName.trim(),
        mobileNumber: formValues.mobileNumber.trim(),
        addressLine: formValues.addressLine.trim(),
        city: formValues.city.trim(),
        state: formValues.state.trim(),
        postalCode: formValues.postalCode.trim(),
        customerNote: formValues.customerNote?.trim() || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await ordersApi.create(payload);

      // Temporarily store ONLY order-success response in sessionStorage
      sessionStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify({
          orderNumber: response.orderNumber,
          status: response.status || 'PLACED',
          subtotal: response.subtotal,
          totalAmount: response.totalAmount ?? response.subtotal,
          whatsappUrl: response.whatsappUrl,
          message: response.message,
          timestamp: new Date().toISOString(),
        }),
      );

      trackEvent('order_submitted', {
        orderNumber: response.orderNumber,
        subtotal: response.subtotal,
      });

      // Clear cart only after successful order
      setIsSubmitted(true);
      clearCart();

      // Navigate to order-success page
      navigate('/order-success');
    } catch (err) {
      const error = err as ApiError;
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, msg]) => {
          if (field in formValues) {
            setError(field as keyof CheckoutFormValues, {
              type: 'server',
              message: msg,
            });
          }
        });
      }

      if (error.status === 404 || error.status === 409) {
        setApiError(
          error.message ||
            'One or more items in your cart are no longer available. Please review your cart.',
        );
      } else if (error.status === 400) {
        setApiError(
          error.message || 'Please verify the delivery details provided and try again.',
        );
      } else {
        setApiError(
          error.message ||
            'We were unable to process your order due to a network or server issue. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-container py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Cart', to: '/cart' },
          { label: 'Delivery address' },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">
            Guest checkout
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            Where should we deliver?
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            No account or online payment needed. Your address is used only to prepare your order.
          </p>

          {apiError && (
            <div
              className="mt-6 flex items-start gap-3 rounded-2xl border border-maroon/20 bg-rose/20 p-4 text-sm text-ink"
              role="alert"
            >
              <AlertCircle className="size-5 shrink-0 text-maroon mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-maroon">Could not submit order</p>
                <p className="mt-1 text-muted">{apiError}</p>
                <Link className="mt-2 inline-block font-semibold text-maroon hover:underline" to="/cart">
                  Return to cart
                </Link>
              </div>
            </div>
          )}

          <form
            className="mt-8 grid gap-5 sm:grid-cols-2"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="customerName">
                Full name <span className="text-maroon">*</span>
              </label>
              <input
                {...register('customerName')}
                aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                aria-invalid={Boolean(errors.customerName)}
                autoComplete="name"
                className="form-input text-base sm:text-sm"
                id="customerName"
                placeholder="e.g. Priya Sharma"
              />
              {errors.customerName && (
                <p className="mt-1.5 text-sm text-maroon" id="customerName-error" role="alert">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="mobileNumber">
                Mobile number <span className="text-maroon">*</span>
              </label>
              <input
                {...register('mobileNumber')}
                aria-describedby={errors.mobileNumber ? 'mobileNumber-error' : undefined}
                aria-invalid={Boolean(errors.mobileNumber)}
                autoComplete="tel"
                className="form-input text-base sm:text-sm"
                id="mobileNumber"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
              />
              {errors.mobileNumber && (
                <p className="mt-1.5 text-sm text-maroon" id="mobileNumber-error" role="alert">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="addressLine">
                Complete delivery address <span className="text-maroon">*</span>
              </label>
              <textarea
                {...register('addressLine')}
                aria-describedby={errors.addressLine ? 'addressLine-error' : undefined}
                aria-invalid={Boolean(errors.addressLine)}
                autoComplete="street-address"
                className="form-input min-h-[5rem] text-base sm:text-sm resize-y"
                id="addressLine"
                placeholder="House / flat number, building name, street, locality"
                rows={3}
              />
              {errors.addressLine && (
                <p className="mt-1.5 text-sm text-maroon" id="addressLine-error" role="alert">
                  {errors.addressLine.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="city">
                City / Town <span className="text-maroon">*</span>
              </label>
              <input
                {...register('city')}
                aria-describedby={errors.city ? 'city-error' : undefined}
                aria-invalid={Boolean(errors.city)}
                autoComplete="address-level2"
                className="form-input text-base sm:text-sm"
                id="city"
                placeholder="e.g. Pune"
              />
              {errors.city && (
                <p className="mt-1.5 text-sm text-maroon" id="city-error" role="alert">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="state">
                State <span className="text-maroon">*</span>
              </label>
              <input
                {...register('state')}
                aria-describedby={errors.state ? 'state-error' : undefined}
                aria-invalid={Boolean(errors.state)}
                autoComplete="address-level1"
                className="form-input text-base sm:text-sm"
                id="state"
                placeholder="e.g. Maharashtra"
              />
              {errors.state && (
                <p className="mt-1.5 text-sm text-maroon" id="state-error" role="alert">
                  {errors.state.message}
                </p>
              )}
            </div>

            {/* PIN Code */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="postalCode">
                PIN code <span className="text-maroon">*</span>
              </label>
              <input
                {...register('postalCode')}
                aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
                aria-invalid={Boolean(errors.postalCode)}
                autoComplete="postal-code"
                className="form-input text-base sm:text-sm max-w-xs"
                id="postalCode"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit PIN code"
              />
              {errors.postalCode && (
                <p className="mt-1.5 text-sm text-maroon" id="postalCode-error" role="alert">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            {/* Customer Note */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="customerNote">
                Customer note <span className="text-xs font-normal text-muted">(optional)</span>
              </label>
              <textarea
                {...register('customerNote')}
                aria-describedby={errors.customerNote ? 'customerNote-error' : undefined}
                aria-invalid={Boolean(errors.customerNote)}
                className="form-input min-h-[4rem] text-base sm:text-sm resize-y"
                id="customerNote"
                maxLength={500}
                placeholder="Any special requests or instructions for your order"
                rows={2}
              />
              {errors.customerNote && (
                <p className="mt-1.5 text-sm text-maroon" id="customerNote-error" role="alert">
                  {errors.customerNote.message}
                </p>
              )}
            </div>

            {/* Submit Actions */}
            <div className="sm:col-span-2 flex flex-col gap-4 border-t border-beige pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-maroon hover:underline"
                to="/cart"
              >
                <ArrowLeft aria-hidden="true" className="size-4" /> Back to cart
              </Link>
              <button
                className="button-primary justify-center min-h-12"
                disabled={isSubmitting}
                type="submit"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="rounded-3xl border border-beige bg-surface p-6 shadow-soft">
          <h2 className="font-display text-2xl text-ink">Estimated Order Summary</h2>
          <ul className="mt-5 space-y-4 divide-y divide-beige/60 text-sm text-muted">
            {items.map((item) => (
              <li className="flex items-center gap-3 pt-3 first:pt-0" key={item.productId}>
                <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-beige">
                  <ProductMedia
                    alt={item.imageAlt || item.name}
                    className="h-full w-full object-cover"
                    src={item.primaryImageUrl || item.image}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-ink">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between border-t border-beige pt-5 font-semibold">
            <span>Estimated Subtotal</span>
            <span className="text-maroon font-bold">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            <LockKeyhole aria-hidden="true" className="inline size-3.5 mr-1 text-maroon" />
            No online payment is collected on this website. Final product price and availability will be verified when you submit the order.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
