import { Instagram, ShoppingBag } from 'lucide-react';
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

  const handleAdd = () => {
    if (addProduct(product)) showToast(`${product.name} added to your cart.`);
  };

  return (
    <article className="group min-w-0 flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-beige shadow-card">
          <ProductMedia
            alt={image?.altText || product.name}
            className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            src={image?.url}
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {isNew && (
              <span className="rounded-full bg-surface/95 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-maroon shadow-sm">
                New
              </span>
            )}
            {isFeatured && (
              <span className="rounded-full bg-gold/90 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-ink shadow-sm">
                Loved
              </span>
            )}
          </div>
        </div>
        <div className="pt-4">
          <div className="flex items-center justify-between gap-2">
            <AvailabilityBadge isAvailable={isAvailable} />
            {product.category?.name && (
              <span className="text-[0.75rem] font-semibold text-muted">
                {product.category.name}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-lg leading-snug text-ink sm:text-xl">
            <Link
              className="rounded outline-none hover:text-maroon focus-visible:ring-2 focus-visible:ring-maroon"
              to={`/products/${product.slug}`}
            >
              {product.name}
            </Link>
          </h3>
          {product.shortDescription && (
            <p className="mt-1 line-clamp-2 text-xs text-muted leading-relaxed">
              {product.shortDescription}
            </p>
          )}
          <ProductPrice className="mt-2 block font-bold" price={product.price} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          className="button-secondary min-h-10 px-4 py-2 text-xs flex-1 justify-center text-center"
          to={`/products/${product.slug}`}
        >
          View details
        </Link>
        <button
          aria-label={`Add ${product.name} to cart`}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-maroon text-white transition-colors hover:bg-maroon/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon disabled:cursor-not-allowed disabled:bg-muted/40"
          disabled={!isAvailable}
          onClick={handleAdd}
          type="button"
        >
          <ShoppingBag aria-hidden="true" className="size-4" />
        </button>
        {hasInstagram && (
          <a
            aria-label={`View ${product.name} on Instagram`}
            className="grid size-10 shrink-0 place-items-center rounded-full text-maroon hover:bg-rose/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
            href={product.instagramUrl}
            rel="noreferrer noopener"
            target="_blank"
          >
            <Instagram aria-hidden="true" className="size-4" />
          </a>
        )}
      </div>
    </article>
  );
};

