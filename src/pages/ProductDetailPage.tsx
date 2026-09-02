import { Instagram, ShieldCheck, ShoppingBag, Sparkles, Plus, Minus } from 'lucide-react';
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
          <Skeleton className="aspect-[4/5] w-full rounded-4xl" />
          <div className="self-center space-y-6">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-12 w-3/4 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-24 w-full rounded" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-32 rounded" />
              <Skeleton className="h-12 w-40 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="site-container py-20 text-center">
        <h1 className="font-display text-4xl text-ink">This piece could not be found</h1>
        <p className="mt-4 text-muted">
          It may have moved or is no longer part of the current collection.
        </p>
        <Link className="button-primary mt-7 inline-flex" to="/products">
          Browse all products
        </Link>
      </div>
    );
  }

  // Filter out the current product from related products and limit to maximum 4
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
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery media={product.media ?? []} productName={product.name} />
          
          <div className="self-center">
            <AvailabilityBadge isAvailable={isAvailable} />
            <div className="mt-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-maroon/70">
              {product.category?.name && (
                <Link to={`/products?category=${product.category.slug}`} className="hover:underline">
                  {product.category.name}
                </Link>
              )}
              {productCode && <span className="text-muted/60">| CODE: {productCode}</span>}
            </div>
            
            <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {product.name}
            </h1>
            <ProductPrice className="mt-4 block text-2xl font-bold" price={product.price} />
            <p className="mt-6 leading-8 text-muted">{product.description}</p>
            
            {isAvailable && (
              <div className="mt-8 flex items-center gap-4">
                <span className="text-sm font-semibold text-ink">Quantity</span>
                <div className="flex items-center rounded-full border border-beige bg-surface">
                  <button 
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="p-2 text-maroon hover:bg-rose/20 disabled:opacity-40 rounded-l-full"
                    aria-label="Decrease quantity"
                    type="button"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-ink" aria-label={`Selected quantity: ${quantity}`}>
                    {quantity}
                  </span>
                  <button 
                    onClick={handleIncrease}
                    disabled={quantity >= 20}
                    className="p-2 text-maroon hover:bg-rose/20 disabled:opacity-40 rounded-r-full"
                    aria-label="Increase quantity"
                    type="button"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="button-primary"
                disabled={!isAvailable}
                onClick={() => {
                  if (addProduct(product, quantity)) {
                    showToast(`${quantity > 1 ? `${quantity} x ` : ''}${product.name} added to your cart.`);
                    setQuantity(1);
                  }
                }}
                type="button"
              >
                <ShoppingBag aria-hidden="true" className="size-4" />
                {isAvailable ? 'Add to cart' : 'Currently unavailable'}
              </button>
              
              {hasSafeInstagram && (
                <a
                  className="button-secondary"
                  href={instagramUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  <Instagram aria-hidden="true" className="size-4" /> View on Instagram
                </a>
              )}
            </div>
            
            <ul className="mt-9 space-y-3 border-t border-beige pt-7 text-sm text-muted">
              <li className="flex gap-3">
                <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />{' '}
                Handcrafted in a small batch
              </li>
              <li className="flex gap-3">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />{' '}
                Availability confirmed personally after ordering
              </li>
            </ul>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="section-space bg-rose/5 mt-10">
          <div className="site-container">
            <h2 className="mb-8 font-display text-3xl text-ink">You may also like</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetailPage;

