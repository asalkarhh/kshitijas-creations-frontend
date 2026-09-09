import { Instagram, ShieldCheck, ShoppingBag, Sparkles, Plus, Minus, MessageCircle, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { env } from '../app/config/env';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useToast } from '../components/common/Toast';
import { AvailabilityBadge } from '../components/product/AvailabilityBadge';
import { ProductPrice } from '../components/product/ProductPrice';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductGrid } from '../components/product/ProductGrid';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { useProduct } from '../hooks/use-product';
import { useProducts } from '../hooks/use-products';
import { useCart } from '../store/cart-context';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { isSafeUrl } from '../utils/url';

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addProduct } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'delivery'>('details');

  const { data: product, isLoading, error, refetch } = useProduct(slug ?? '');
  
  const { data: relatedProductsResponse } = useProducts(
    product?.category?.slug ? { category: product.category.slug, size: 8 } : undefined,
  );

  const isAvailable = product ? (product.isAvailable ?? product.available ?? true) : false;
  const primaryImage = product?.media?.find((m) => m.isPrimary) ?? product?.media?.[0];
  const productCode = product?.productCode ?? (product?.id ? product.id.replace(/^prod-/, '').toUpperCase() : '');
  const instagramUrl = product?.instagramUrl || env.instagramUrl;
  const hasSafeInstagram = Boolean(instagramUrl && isSafeUrl(instagramUrl));

  usePageMetadata({
    title: product?.name ?? 'Product details',
    description: product?.shortDescription ?? product?.description ?? 'View handcrafted piece details.',
    canonicalPath: product ? `/products/${product.slug}` : undefined,
    image: primaryImage?.url,
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: primaryImage?.url ? [primaryImage.url] : undefined,
          description: product.shortDescription || product.description,
          sku: productCode || product.id,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${env.siteUrl}/products/${product.slug}`,
          },
        }
      : undefined,
  });

  if (error) {
    return (
      <div className="site-container py-20 text-center">
        <ErrorMessage message="Could not load product details. Please try again." onRetry={refetch} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="site-container py-10 sm:py-14">
        <Skeleton className="h-6 w-1/3 mb-8" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Skeleton className="aspect-[4/5] w-full rounded-5xl" />
          <div className="self-center space-y-6">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-3/4 rounded-2xl" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-32 rounded-full" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="site-container py-20 text-center">
        <h1 className="font-display text-4xl font-bold text-ink">This piece could not be found</h1>
        <p className="mt-4 text-muted font-sans">
          It may have moved or is no longer part of the current collection.
        </p>
        <Link className="button-primary mt-7 inline-flex" to="/products">
          Browse all products
        </Link>
      </div>
    );
  }

  const relatedProducts = (relatedProductsResponse?.content ?? [])
    .filter((p) => p.id !== product.id && p.slug !== product.slug)
    .slice(0, 4);

  const handleDecrease = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity((prev) => Math.min(20, prev + 1));

  return (
    <>
      <div className="site-container py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Products', to: '/products' },
            ...(product.category?.name
              ? [{ label: product.category.name, to: `/products?category=${product.category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          {/* Gallery Column */}
          <div className="sticky top-28">
            <ProductGallery media={product.media ?? []} productName={product.name} />
          </div>
          
          {/* Purchase Details Column */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2.5">
              <AvailabilityBadge isAvailable={isAvailable} />
              {product.category?.name && (
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="rounded-full bg-rose/40 px-3 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-maroon hover:bg-rose/60 transition-colors font-sans"
                >
                  {product.category.name}
                </Link>
              )}
              {productCode && (
                <span className="text-[0.7rem] font-mono text-muted/70 bg-surface px-2.5 py-0.5 rounded-full border border-beige/60">
                  CODE: {productCode}
                </span>
              )}
            </div>
            
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <ProductPrice className="text-3xl font-black text-maroon font-sans" price={product.price} />
              <span className="text-xs text-muted/80 font-sans">Inclusive of all taxes</span>
            </div>

            {product.shortDescription && (
              <p className="mt-4 text-base leading-relaxed text-ink/85 font-sans font-medium">
                {product.shortDescription}
              </p>
            )}

            <p className="mt-2 leading-relaxed text-muted font-sans text-sm">
              {product.description}
            </p>
            
            {/* Quantity Stepper */}
            {isAvailable && (
              <div className="mt-7 flex items-center gap-4 p-4 rounded-3xl bg-surface border border-beige/80 shadow-2xs w-fit">
                <span className="text-xs font-bold uppercase tracking-wider text-ink font-sans">Quantity</span>
                <div className="flex items-center rounded-full border border-beige bg-canvas/60">
                  <button 
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="p-2 text-maroon hover:bg-rose/30 disabled:opacity-30 rounded-l-full transition-colors"
                    aria-label="Decrease quantity"
                    type="button"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-extrabold text-ink font-sans" aria-label={`Selected quantity: ${quantity}`}>
                    {quantity}
                  </span>
                  <button 
                    onClick={handleIncrease}
                    disabled={quantity >= 20}
                    className="p-2 text-maroon hover:bg-rose/30 disabled:opacity-30 rounded-r-full transition-colors"
                    aria-label="Increase quantity"
                    type="button"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <button
                className="button-primary flex-1 min-w-[200px] shadow-md hover:shadow-lg"
                disabled={!isAvailable}
                onClick={() => {
                  if (addProduct(product, quantity)) {
                    showToast(`${quantity > 1 ? `${quantity} x ` : ''}${product.name} added to your cart.`);
                    setQuantity(1);
                  }
                }}
                type="button"
              >
                <ShoppingBag aria-hidden="true" className="size-4.5" />
                <span>{isAvailable ? 'Add to cart' : 'Currently unavailable'}</span>
              </button>
              
              {hasSafeInstagram && (
                <a
                  className="button-secondary"
                  href={instagramUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <Instagram aria-hidden="true" className="size-4.5" />
                  <span>View on Instagram</span>
                </a>
              )}
            </div>

            {/* Information Tabs */}
            <div className="mt-10 border-t border-beige/80 pt-6">
              <div className="flex gap-4 border-b border-beige/60 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 transition-colors border-b-2 font-sans ${
                    activeTab === 'details' ? 'border-maroon text-maroon' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  Craft Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('care')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 transition-colors border-b-2 font-sans ${
                    activeTab === 'care' ? 'border-maroon text-maroon' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  Care Guide
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('delivery')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 transition-colors border-b-2 font-sans ${
                    activeTab === 'delivery' ? 'border-maroon text-maroon' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  Shipping & WhatsApp
                </button>
              </div>

              <div className="mt-4 text-xs sm:text-sm text-muted leading-relaxed font-sans">
                {activeTab === 'details' && (
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Sparkles className="size-4 text-gold shrink-0" />
                      Handmade in small batches in India.
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-maroon shrink-0" />
                      Tested skin-safe materials & durable craftsmanship.
                    </li>
                  </ul>
                )}
                {activeTab === 'care' && (
                  <p>
                    Store in a dry pouch away from moisture and direct perfumes. Wipe gently with a soft dry cloth after wearing to maintain lustre.
                  </p>
                )}
                {activeTab === 'delivery' && (
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Truck className="size-4 text-maroon shrink-0" />
                      Carefully packaged and dispatched across India within 2-4 business days.
                    </li>
                    <li className="flex items-center gap-2">
                      <MessageCircle className="size-4 text-[#25D366] shrink-0" />
                      Direct WhatsApp order confirmation with real-time updates.
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="section-space bg-rose/20 mt-12 border-t border-beige/60">
          <div className="site-container">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon font-sans">Curated For You</p>
                <h2 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">You may also like</h2>
              </div>
              <Link to="/products" className="text-xs font-bold text-maroon hover:underline font-sans hidden sm:block">
                View All Creations →
              </Link>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetailPage;
