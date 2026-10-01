import { Link } from 'react-router-dom';
import type { Category } from '../../types';
import { ProductMedia } from './ProductMedia';

interface SquareCategoryCardProps {
  category: Category;
  productCount?: number;
  imageUrl?: string;
}

export const SquareCategoryCard = ({ category, productCount, imageUrl }: SquareCategoryCardProps) => {
  const count = productCount ?? category.productCount ?? 0;
  const imageSrc = imageUrl || category.imageUrl;

  return (
    <Link
      aria-label={`Explore ${category.name} category with ${count} products`}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-beige/40 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
      to={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
    >
      {/* Background Category Image */}
      <ProductMedia
        alt={category.imageAlt || category.name}
        className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        src={imageSrc}
      />

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity group-hover:from-black/90" />

      {/* Content Overlay at Bottom-Left */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end text-left z-10 space-y-1">
        <h3 className="font-display text-xl font-bold text-white tracking-tight drop-shadow-sm group-hover:text-gold transition-colors sm:text-2xl">
          {category.name}
        </h3>

        <p className="text-xs font-medium text-white/80 font-sans">
          {count} {count === 1 ? 'product' : 'products'}
        </p>

        <span className="inline-block pt-1.5 text-xs font-bold text-white underline underline-offset-4 tracking-wider group-hover:text-gold transition-colors font-sans">
          Explore
        </span>
      </div>
    </Link>
  );
};
