import type { Banner } from '../types';
import { apiClient } from './client';
import { normalizeBanner } from './normalizers';

export const bannersApi = {
  listActive: async (): Promise<Banner[]> =>
    (await apiClient.get<unknown[]>('/public/banners')).data.map(normalizeBanner),
};
