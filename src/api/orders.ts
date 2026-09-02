import type { CreateOrderRequest, CreateOrderResponse } from '../types';
import { apiClient } from './client';

export const ordersApi = {
  create: async (payload: CreateOrderRequest) =>
    (await apiClient.post<CreateOrderResponse>('/public/orders', payload)).data,
};

