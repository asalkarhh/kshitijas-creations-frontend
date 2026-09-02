import type { AdminUser, AuthResponse, LoginRequest } from '../types/api';
import { apiClient } from './client';

export const authenticationApi = {
  login: async (payload: LoginRequest): Promise<AuthResponse> =>
    (await apiClient.post<AuthResponse>('/auth/login', payload)).data,
  getMe: async (): Promise<AdminUser> => {
    const data = (await apiClient.get<AdminUser | { admin?: AdminUser; user?: AdminUser }>('/auth/me')).data;
    if ('admin' in data && data.admin) return data.admin;
    if ('user' in data && data.user) return data.user;
    return data as AdminUser;
  },
};
