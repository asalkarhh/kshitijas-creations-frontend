import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types';
import { ProductMedia } from './ProductMedia';

export const CategoryCard = ({ category, index = 0 }: { category: Category; index?: number }) => (
  <Link
    className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-beige shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
    to={`/products?category=${category.slug}`}
  >
    <ProductMedia
      alt={category.imageAlt || category.name}
      className={`transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none ${
        index === 0 ? 'object-[64%_60%]' : index === 1 ? 'object-[87%_80%]' : 'object-[92%_28%]'
      }`}
      src={category.imageUrl}
    />
    <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
      <span>
        <span className="block font-display text-2xl">{category.name}</span>
        <span className="mt-1 block text-sm text-white/80">{category.productCount} pieces</span>
      </span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
        <ArrowUpRight aria-hidden="true" className="size-5" />
      </span>
    </span>
  </Link>
);
