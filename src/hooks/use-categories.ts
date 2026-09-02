import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories';
import type { Category } from '../types';

export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

