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
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <SectionHeading description={description} eyebrow={eyebrow} title={title} />
        <Link
          className="text-sm font-bold text-maroon underline-offset-4 hover:underline"
          to="/products"
        >
          View all products
        </Link>
      </div>
      <ProductGrid products={products} />
    </div>
  </section>
);
