import type { Category } from '../types';
import { apiClient } from './client';
import { normalizeCategory } from './normalizers';

export const categoriesApi = {
  list: async (): Promise<Category[]> =>
    (await apiClient.get<unknown[]>('/public/categories')).data.map(normalizeCategory),
};
