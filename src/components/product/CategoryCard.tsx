import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types';
import { ProductMedia } from './ProductMedia';

export const CategoryCard = ({ category, index = 0 }: { category: Category; index?: number }) => (
  <Link
    className="group relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-4xl bg-beige/60 shadow-card border border-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-float focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
    to={`/products?category=${category.slug}`}
  >
    <ProductMedia
      alt={category.imageAlt || category.name}
      className={`transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none ${
        index === 0 ? 'object-[64%_60%]' : index === 1 ? 'object-[87%_80%]' : 'object-[92%_28%]'
      }`}
      src={category.imageUrl}
    />
    <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 text-white">
      <div className="flex flex-col">
        <span className="font-display text-2xl font-bold tracking-tight text-white group-hover:text-rose transition-colors duration-200 sm:text-3xl">
          {category.name}
        </span>
        {category.description && (
          <span className="mt-1 line-clamp-1 text-xs text-white/70 max-w-xs font-sans">
            {category.description}
          </span>
        )}
      </div>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-maroon group-hover:border-gold">
        <ArrowUpRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </span>
  </Link>
);
