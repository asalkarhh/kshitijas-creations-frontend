import type { PaginatedResponse, Product } from '../types';
import { apiClient } from './client';
import { normalizeProduct } from './normalizers';

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
  list: async (params?: ProductQuery): Promise<PaginatedResponse<Product>> => {
    const response = (await apiClient.get<PaginatedResponse<unknown>>('/public/products', { params })).data;
    return { ...response, content: response.content.map(normalizeProduct) };
  },
  bySlug: async (slug: string): Promise<Product> =>
    normalizeProduct((await apiClient.get<unknown>(`/public/products/${slug}`)).data),
};
