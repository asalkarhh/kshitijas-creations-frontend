import type { Banner } from '../types';
import { apiClient } from './client';

export const bannersApi = {
  listActive: async () => (await apiClient.get<Banner[]>('/public/banners')).data,
};
