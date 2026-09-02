import { formatPrice } from '../../utils/currency';

export const ProductPrice = ({ price, className = '' }: { price: number; className?: string }) => (
  <data className={`font-semibold text-maroon ${className}`} value={price}>
    {formatPrice(price)}
  </data>
);
