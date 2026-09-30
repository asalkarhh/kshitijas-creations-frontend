import { Link } from 'react-router-dom';
import type { Category } from '../../types';
import { ProductMedia } from './ProductMedia';

export const CategoryCard = ({ category, imageUrl }: { category: Category; index?: number; imageUrl?: string }) => (
  <Link
    className="group flex flex-col items-center shrink-0 w-32 sm:w-40 text-center transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
    to={`/products?category=${category.slug}`}
  >
    <div className="relative aspect-square w-28 sm:w-36 overflow-hidden rounded-full border-2 border-beige/80 bg-beige/40 shadow-card transition-all duration-300 group-hover:border-maroon group-hover:shadow-float">
      <ProductMedia
        alt={category.imageAlt || category.name}
        className="size-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
        src={category.imageUrl || imageUrl}
        eager
      />
    </div>
    <span className="mt-3.5 font-display text-sm font-bold text-ink transition-colors group-hover:text-maroon sm:text-base">
      {category.name}
    </span>
  </Link>
);
