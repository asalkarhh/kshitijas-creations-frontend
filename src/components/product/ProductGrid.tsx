import type { Product } from '../../types';
import { EmptyProductState } from './EmptyProductState';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ products }: { products: Product[] }) => {
  if (products.length === 0) return <EmptyProductState />;
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
