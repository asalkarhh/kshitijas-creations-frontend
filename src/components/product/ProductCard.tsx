import { Instagram, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { useToast } from '../common/Toast';
import { useCart } from '../../store/cart-context';
import { AvailabilityBadge } from './AvailabilityBadge';
import { ProductMedia } from './ProductMedia';
import { ProductPrice } from './ProductPrice';
import { isSafeUrl } from '../../utils/url';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addProduct } = useCart();
  const { showToast } = useToast();
  const image = product.media?.find((media) => media.isPrimary) ?? product.media?.[0];
  const isAvailable = product.isAvailable ?? product.available ?? true;
  const isFeatured = product.isFeatured ?? product.featured ?? false;
  const isNew = product.isNew ?? product.newArrival ?? false;
  const hasInstagram = product.instagramUrl && isSafeUrl(product.instagramUrl);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (addProduct(product)) {
      showToast(`${product.name} added to your bag.`);
    }
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-4xl border border-beige/60 bg-surface/90 p-3.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-card">
      <div>
        {/* Product Image Box */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-beige/40">
          <ProductMedia
            alt={image?.altText || product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
            src={image?.url}
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {isNew && (
              <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-maroon shadow-xs backdrop-blur-xs">
                New
              </span>
            )}
            {isFeatured && (
              <span className="rounded-full bg-gold/90 px-2.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-ink shadow-xs backdrop-blur-xs">
                Featured
              </span>
            )}
          </div>
          {hasInstagram && (
            <a
              aria-label={`View ${product.name} on Instagram`}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/80 backdrop-blur-md text-maroon shadow-xs transition-all hover:scale-110 hover:bg-white"
              href={product.instagramUrl}
              rel="noreferrer noopener"
              target="_blank"
            >
              <Instagram aria-hidden="true" className="size-4" />
            </a>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <AvailabilityBadge isAvailable={isAvailable} />
            {product.category?.name && (
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted/70 font-sans">
                {product.category.name}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink sm:text-xl line-clamp-1">
            <Link
              className="rounded-md outline-none transition-colors hover:text-maroon focus-visible:ring-2 focus-visible:ring-maroon"
              to={`/products/${product.slug}`}
            >
              {product.name}
            </Link>
          </h3>
          {product.shortDescription && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted font-sans">
              {product.shortDescription}
            </p>
          )}
          <div className="mt-3 flex items-baseline justify-between">
            <ProductPrice className="text-base font-extrabold text-ink font-sans" price={product.price} />
            {product.productCode && (
              <span className="text-[0.65rem] font-mono text-muted/60">#{product.productCode}</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-beige/40">
        <Link
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-maroon/20 bg-canvas/70 px-3 py-2 text-xs font-bold text-maroon transition-all hover:border-maroon hover:bg-rose/40"
          to={`/products/${product.slug}`}
        >
          <Eye className="size-3.5" />
          <span>View details</span>
        </Link>
        <button
          aria-label={`Add ${product.name} to cart`}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-maroon/90 hover:shadow-sm disabled:cursor-not-allowed disabled:bg-muted/40"
          disabled={!isAvailable}
          onClick={handleAdd}
          type="button"
        >
          <ShoppingBag aria-hidden="true" className="size-3.5" />
          <span>Add</span>
        </button>
      </div>
    </article>
  );
};
