import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LockKeyhole, AlertCircle, Loader2, Sparkles, User, Phone, MapPin, Building, Navigation, FileText } from 'lucide-react';
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
      district: '',
      subDistrict: '',
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
      const payload = {
        customerName: formValues.customerName.trim(),
        mobileNumber: formValues.mobileNumber.trim(),
        addressLine: `${formValues.addressLine.trim()}, Subdistrict: ${formValues.subDistrict.trim()}, District: ${formValues.district.trim()}`,
        city: formValues.city.trim(),
        state: formValues.state.trim(),
        postalCode: formValues.postalCode.trim(),
        customerNote: formValues.customerNote?.trim() || undefined,
        items: items.map((item) => ({
          productId: typeof item.productId === 'string' && !isNaN(Number(item.productId)) ? Number(item.productId) : item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await ordersApi.create(payload);

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

      setIsSubmitted(true);
      clearCart();
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
          { label: 'Shopping Bag', to: '/cart' },
          { label: 'Delivery Details' },
        ]}
      />

      {/* Progress Steps */}
      <div className="my-8 flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold font-sans">
        <div className="flex items-center gap-1.5 text-muted/70">
          <span className="grid size-6 place-items-center rounded-full bg-rose/40 text-maroon text-[0.7rem]">1</span>
          <span>Shopping Bag</span>
        </div>
        <span className="h-px w-6 sm:w-10 bg-beige" />
        <div className="flex items-center gap-1.5 text-maroon">
          <span className="grid size-6 place-items-center rounded-full bg-maroon text-white text-[0.7rem] shadow-2xs">2</span>
          <span>Delivery Details</span>
        </div>
        <span className="h-px w-6 sm:w-10 bg-beige" />
        <div className="flex items-center gap-1.5 text-muted/50">
          <span className="grid size-6 place-items-center rounded-full bg-beige/60 text-muted text-[0.7rem]">3</span>
          <span>WhatsApp Confirmation</span>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="rounded-4xl border border-beige/80 bg-surface/90 p-6 sm:p-10 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-rose/30 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-maroon shadow-2xs font-sans">
            <Sparkles className="size-3 text-gold" />
            <span>Fast Guest Checkout</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Where should we deliver?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
            No password or card payment needed. Your details are used solely to deliver your handcrafted pieces.
          </p>

          {apiError && (
            <div
              className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose/30 p-4 text-sm text-ink shadow-2xs"
              role="alert"
            >
              <AlertCircle className="size-5 shrink-0 text-maroon mt-0.5" />
              <div className="flex-1 font-sans">
                <p className="font-bold text-maroon">Could not submit order</p>
                <p className="mt-1 text-xs text-muted">{apiError}</p>
                <Link className="mt-2 inline-block text-xs font-bold text-maroon hover:underline" to="/cart">
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
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="customerName">
                <User className="size-3.5 text-maroon" /> Full Name <span className="text-maroon">*</span>
              </label>
              <input
                {...register('customerName')}
                aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                aria-invalid={Boolean(errors.customerName)}
                autoComplete="name"
                className="form-input text-base sm:text-sm"
                id="customerName"
                placeholder="e.g. Radhika Deshmukh"
              />
              {errors.customerName && (
                <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="customerName-error" role="alert">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="mobileNumber">
                <Phone className="size-3.5 text-maroon" /> 10-Digit Mobile Number (WhatsApp active) <span className="text-maroon">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted font-mono">+91</span>
                <input
                  {...register('mobileNumber')}
                  aria-describedby={errors.mobileNumber ? 'mobileNumber-error' : undefined}
                  aria-invalid={Boolean(errors.mobileNumber)}
                  autoComplete="tel"
                  className="form-input pl-12 text-base sm:text-sm font-mono"
                  id="mobileNumber"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9823012345"
                onInput={(event) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                }}
                pattern="[0-9]{10}"
                type="tel"
                />
              </div>
              {errors.mobileNumber && (
                <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="mobileNumber-error" role="alert">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="addressLine">
                <MapPin className="size-3.5 text-maroon" /> Complete Delivery Address <span className="text-maroon">*</span>
              </label>
              <textarea
                {...register('addressLine')}
                aria-describedby={errors.addressLine ? 'addressLine-error' : undefined}
                aria-invalid={Boolean(errors.addressLine)}
                autoComplete="street-address"
                className="form-input min-h-[5.5rem] text-base sm:text-sm resize-y font-sans"
                id="addressLine"
                placeholder="Flat / house number, building, street, locality, landmark"
                rows={3}
              />
              {errors.addressLine && (
                <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="addressLine-error" role="alert">
                  {errors.addressLine.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="city">
                <Building className="size-3.5 text-maroon" /> City / Town <span className="text-maroon">*</span>
              </label>
              <input
                {...register('city')}
                aria-describedby={errors.city ? 'city-error' : undefined}
                aria-invalid={Boolean(errors.city)}
                autoComplete="address-level2"
                className="form-input text-base sm:text-sm"
                id="city"
                placeholder="e.g. Pune"
                onInput={(event) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/[^A-Za-z .'-]/g, '');
                }}
              />
              {errors.city && (
                <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="city-error" role="alert">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="district">
                <Navigation className="size-3.5 text-maroon" /> District <span className="text-maroon">*</span>
              </label>
              <input
                {...register('district')}
                aria-describedby={errors.district ? 'district-error' : undefined}
                aria-invalid={Boolean(errors.district)}
                className="form-input text-base sm:text-sm"
                id="district"
                onInput={(event) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/[^A-Za-z .'-]/g, '');
                }}
                placeholder="e.g. Pune"
              />
              {errors.district && <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="district-error" role="alert">{errors.district.message}</p>}
            </div>

            {/* Subdistrict */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="subDistrict">
                <Navigation className="size-3.5 text-maroon" /> Subdistrict <span className="text-maroon">*</span>
              </label>
              <input
                {...register('subDistrict')}
                aria-describedby={errors.subDistrict ? 'subDistrict-error' : undefined}
                aria-invalid={Boolean(errors.subDistrict)}
                className="form-input text-base sm:text-sm"
                id="subDistrict"
                onInput={(event) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/[^A-Za-z .'-]/g, '');
                }}
                placeholder="e.g. Haveli"
              />
              {errors.subDistrict && <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="subDistrict-error" role="alert">{errors.subDistrict.message}</p>}
            </div>

            {/* State */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="state">
                <Navigation className="size-3.5 text-maroon" /> State <span className="text-maroon">*</span>
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
                <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="state-error" role="alert">
                  {errors.state.message}
                </p>
              )}
            </div>

            {/* PIN Code */}
            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="postalCode">
                <MapPin className="size-3.5 text-maroon" /> 6-Digit PIN code <span className="text-maroon">*</span>
              </label>
              <input
                {...register('postalCode')}
                aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
                aria-invalid={Boolean(errors.postalCode)}
                autoComplete="postal-code"
                className="form-input text-base sm:text-sm max-w-xs font-mono"
                id="postalCode"
                inputMode="numeric"
                maxLength={6}
                placeholder="411005"
                onInput={(event) => {
                  event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 6);
                }}
                pattern="[0-9]{6}"
                type="text"
              />
              {errors.postalCode && (
                <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="postalCode-error" role="alert">
                  {errors.postalCode.message}
                </p>
              )}
            </div>

            {/* Customer Note */}
            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink font-sans" htmlFor="customerNote">
                <FileText className="size-3.5 text-maroon" /> Customer Note / Gift Message <span className="text-xs font-normal text-muted lowercase">(optional)</span>
              </label>
              <textarea
                {...register('customerNote')}
                aria-describedby={errors.customerNote ? 'customerNote-error' : undefined}
                aria-invalid={Boolean(errors.customerNote)}
                className="form-input min-h-[4rem] text-base sm:text-sm resize-y font-sans"
                id="customerNote"
                maxLength={500}
                placeholder="e.g. Please add a birthday greeting note or gift wrapping."
                rows={2}
              />
              {errors.customerNote && (
                <p className="mt-1.5 text-xs text-maroon font-bold font-sans" id="customerNote-error" role="alert">
                  {errors.customerNote.message}
                </p>
              )}
            </div>

            {/* Submit Actions */}
            <div className="sm:col-span-2 flex flex-col gap-4 border-t border-beige/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                className="inline-flex items-center gap-2 text-xs font-bold text-maroon hover:underline font-sans"
                to="/cart"
              >
                <ArrowLeft aria-hidden="true" className="size-4" /> Return to shopping cart
              </Link>
              <button
                className="button-primary justify-center min-h-12 shadow-md hover:shadow-lg font-sans"
                disabled={isSubmitting}
                type="submit"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Submitting Order...
                  </>
                ) : (
                  'Place Order via WhatsApp'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="rounded-4xl border border-beige/80 bg-surface/90 p-6 sm:p-7 shadow-soft sticky top-28">
          <h2 className="font-display text-2xl font-bold text-ink">Estimated Order Summary</h2>
          <ul className="mt-5 space-y-3.5 divide-y divide-beige/60 text-sm text-muted">
            {items.map((item) => (
              <li className="flex items-center gap-3 pt-3.5 first:pt-0" key={item.productId}>
                <div className="size-14 shrink-0 overflow-hidden rounded-2xl bg-beige/40 border border-beige/60">
                  <ProductMedia
                    alt={item.imageAlt || item.name}
                    className="h-full w-full object-cover"
                    src={item.primaryImageUrl || item.image}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink line-clamp-1 font-display">{item.name}</p>
                  <p className="text-xs text-muted font-sans">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="shrink-0 font-extrabold text-ink font-sans">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          
          <div className="mt-5 space-y-2 border-t border-beige/70 pt-5 font-sans">
            <div className="flex justify-between items-baseline text-sm">
              <span className="text-muted">Estimated Subtotal</span>
              <strong className="text-xl font-black text-maroon">{formatPrice(subtotal)}</strong>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Packaging & Handling</span>
              <span className="text-emerald-700 font-bold uppercase tracking-wider">Free Delivery</span>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-2xl bg-rose/25 p-3.5 text-xs text-muted font-sans leading-relaxed">
            <LockKeyhole aria-hidden="true" className="size-4 shrink-0 text-maroon mt-0.5" />
            <span>No advance payment gateway required. You will confirm your order directly with the creator on WhatsApp.</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
