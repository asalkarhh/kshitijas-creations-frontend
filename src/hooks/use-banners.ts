import { useQuery } from '@tanstack/react-query';
import { bannersApi } from '../api/banners';
import type { Banner, ApiError } from '../types';

export const useBanners = () => {
  return useQuery<Banner[], ApiError>({
    queryKey: ['banners'],
    queryFn: bannersApi.listActive,
    staleTime: 5 * 60 * 1000,
  });
};

