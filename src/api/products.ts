import type { PaginatedResponse, Product } from '../types';
import { apiClient } from './client';

export interface ProductQuery {
  page?: number;
  size?: number;
  category?: string;
  featured?: boolean;
  isNew?: boolean;
  sort?: string;
  search?: string;
}

export const productsApi = {
  list: async (params?: ProductQuery) =>
    (await apiClient.get<PaginatedResponse<Product>>('/public/products', { params })).data,
  bySlug: async (slug: string) => (await apiClient.get<Product>(`/public/products/${slug}`)).data,
};
