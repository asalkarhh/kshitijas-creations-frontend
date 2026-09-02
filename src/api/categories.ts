import type { Category } from '../types';
import { apiClient } from './client';

export const categoriesApi = {
  list: async () => (await apiClient.get<Category[]>('/public/categories')).data,
};
