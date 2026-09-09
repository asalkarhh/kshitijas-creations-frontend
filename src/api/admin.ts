import type {
  AdminCategoryRequest,
  AdminOrderDetail,
  AdminOrderFilterParams,
  AdminOrderListItem,
  AdminProductFilterParams,
  AdminProductRequest,
  Banner,
  Category,
  PaginatedResponse,
  Product,
  ProductMedia,
} from '../types';
import type { CreateOrderResponse, DashboardResponse } from '../types/api';
import { apiClient } from './client';
import {
  normalizeAdminOrder,
  normalizeBanner,
  normalizeCategory,
  normalizeMedia,
  normalizeProduct,
} from './normalizers';

export const adminApi = {
  // Dashboard
  dashboard: async (): Promise<DashboardResponse> => {
    const res = (await apiClient.get<Record<string, unknown>>('/admin/dashboard')).data;
    if (res.stats && typeof res.stats === 'object') {
      return res as unknown as DashboardResponse;
    }
    return {
      stats: {
        totalProducts: Number(res.totalProducts ?? 0),
        availableProducts: Number(res.availableProducts ?? 0),
        totalOrders: Number(res.totalOrders ?? 0),
        placedOrders: Number(res.placedOrders ?? res.newOrders ?? 0),
        newOrders: Number(res.placedOrders ?? res.newOrders ?? 0),
        confirmedOrders: Number(res.confirmedOrders ?? 0),
        completedOrders: Number(res.completedOrders ?? 0),
        cancelledOrders: Number(res.cancelledOrders ?? 0),
      },
      recentOrders: (res.recentOrders as DashboardResponse['recentOrders']) ?? [],
    };
  },

  // Orders
  orders: async (page = 0): Promise<PaginatedResponse<CreateOrderResponse>> =>
    (
      await apiClient.get<PaginatedResponse<CreateOrderResponse>>('/admin/orders', {
        params: { page },
      })
    ).data,

  getOrders: async (
    params?: AdminOrderFilterParams,
  ): Promise<PaginatedResponse<AdminOrderListItem>> =>
    (
      await apiClient.get<PaginatedResponse<AdminOrderListItem>>('/admin/orders', {
        params,
      })
    ).data,

  getOrder: async (id: string): Promise<AdminOrderDetail> =>
    normalizeAdminOrder((await apiClient.get<unknown>(`/admin/orders/${id}`)).data),

  updateOrderStatus: async (id: string, status: string): Promise<AdminOrderDetail> =>
    normalizeAdminOrder((
      await apiClient.patch<unknown>(`/admin/orders/${id}/status`, {
        status,
      })
    ).data),

  // Categories
  getCategories: async (): Promise<Category[]> =>
    (await apiClient.get<unknown[]>('/admin/categories')).data.map(normalizeCategory),

  createCategory: async (payload: AdminCategoryRequest): Promise<Category> =>
    normalizeCategory((await apiClient.post<unknown>('/admin/categories', payload)).data),

  updateCategory: async (id: string, payload: AdminCategoryRequest): Promise<Category> =>
    normalizeCategory((await apiClient.put<unknown>(`/admin/categories/${id}`, payload)).data),

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  // Products
  getProducts: async (params?: AdminProductFilterParams): Promise<PaginatedResponse<Product>> => {
    const response = (
      await apiClient.get<PaginatedResponse<unknown>>('/admin/products', { params })
    ).data;
    return { ...response, content: response.content.map(normalizeProduct) };
  },

  getProduct: async (id: string): Promise<Product> =>
    normalizeProduct((await apiClient.get<unknown>(`/admin/products/${id}`)).data),

  createProduct: async (payload: AdminProductRequest): Promise<Product> =>
    normalizeProduct((await apiClient.post<unknown>('/admin/products', payload)).data),

  updateProduct: async (id: string, payload: AdminProductRequest): Promise<Product> =>
    normalizeProduct((await apiClient.put<unknown>(`/admin/products/${id}`, payload)).data),

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  // Media
  uploadMedia: async (productId: string, formData: FormData): Promise<ProductMedia> => {
    const res = await apiClient.post<unknown | unknown[]>(`/admin/products/${productId}/media`, formData);
    return normalizeMedia(Array.isArray(res.data) ? res.data[0] : res.data);
  },

  deleteMedia: async (productId: string, mediaId: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${productId}/media/${mediaId}`);
  },

  // Banners
  getBanners: async (): Promise<Banner[]> => {
    const response = (await apiClient.get<PaginatedResponse<unknown> | unknown[]>('/admin/banners')).data;
    const banners = Array.isArray(response)
      ? response
      : ((response as PaginatedResponse<unknown>)?.content ?? []);
    return banners.map(normalizeBanner);
  },

  createBanner: async (formData: FormData): Promise<Banner> =>
    normalizeBanner((await apiClient.post<unknown>('/admin/banners', formData)).data),

  updateBanner: async (id: string, formData: FormData): Promise<Banner> =>
    normalizeBanner((await apiClient.put<unknown>(`/admin/banners/${id}`, formData)).data),

  deleteBanner: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/banners/${id}`);
  },
};
