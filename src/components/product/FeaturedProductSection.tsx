import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { SectionHeading } from '../common/SectionHeading';
import { ProductGrid } from './ProductGrid';

interface FeaturedProductSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
}

export const FeaturedProductSection = ({
  eyebrow,
  title,
  description,
  products,
}: FeaturedProductSectionProps) => (
  <section className="section-space">
    <div className="site-container">
      <div className="mb-8">
        <SectionHeading description={description} eyebrow={eyebrow} title={title} />
      </div>

      <ProductGrid products={products} />

      {/* Centered View More button below product grid */}
      <div className="mt-10 flex justify-center">
        <Link
          className="inline-flex items-center gap-2.5 rounded-full border border-beige/90 bg-surface px-7 py-3 text-sm font-bold text-maroon shadow-xs transition-all hover:bg-rose/30 hover:border-gold hover:shadow-md"
          to="/products"
        >
          <span>View More</span>
          <ArrowRight aria-hidden="true" className="size-4 text-maroon" />
        </Link>
      </div>
    </div>
  </section>
);
