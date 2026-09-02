import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import type { Product, ApiError } from '../types';

export const useProduct = (slug: string) => {
  return useQuery<Product, ApiError>({
    queryKey: ['product', slug],
    queryFn: () => productsApi.bySlug(slug),
    staleTime: 5 * 60 * 1000,
    enabled: !!slug,
  });
};

