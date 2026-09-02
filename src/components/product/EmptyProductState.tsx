import { Link } from 'react-router-dom';
import { EmptyState } from '../common/EmptyState';

export const EmptyProductState = () => (
  <EmptyState
    action={
      <Link className="button-primary" to="/products">
        View all products
      </Link>
    }
    description="Try another category or return soon—new handmade pieces are added in small batches."
    title="No pieces found"
  />
);
