import { useQuery } from '@tanstack/react-query';
import { productsApi, type ProductQuery } from '../api/products';
import type { PaginatedResponse, Product } from '../types';
import type { ApiError } from '../types';

export const useProducts = (params: ProductQuery = {}) => {
  return useQuery<PaginatedResponse<Product>, ApiError>({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

