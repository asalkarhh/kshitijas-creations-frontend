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
    (await apiClient.get<AdminOrderDetail>(`/admin/orders/${id}`)).data,

  updateOrderStatus: async (id: string, status: string): Promise<AdminOrderDetail> =>
    (
      await apiClient.patch<AdminOrderDetail>(`/admin/orders/${id}/status`, {
        status,
      })
    ).data,

  // Categories
  getCategories: async (): Promise<Category[]> =>
    (await apiClient.get<Category[]>('/admin/categories')).data,

  createCategory: async (payload: AdminCategoryRequest): Promise<Category> =>
    (await apiClient.post<Category>('/admin/categories', payload)).data,

  updateCategory: async (id: string, payload: AdminCategoryRequest): Promise<Category> =>
    (await apiClient.put<Category>(`/admin/categories/${id}`, payload)).data,

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  // Products
  getProducts: async (params?: AdminProductFilterParams): Promise<PaginatedResponse<Product>> =>
    (
      await apiClient.get<PaginatedResponse<Product>>('/admin/products', {
        params,
      })
    ).data,

  getProduct: async (id: string): Promise<Product> =>
    (await apiClient.get<Product>(`/admin/products/${id}`)).data,

  createProduct: async (payload: AdminProductRequest): Promise<Product> =>
    (await apiClient.post<Product>('/admin/products', payload)).data,

  updateProduct: async (id: string, payload: AdminProductRequest): Promise<Product> =>
    (await apiClient.put<Product>(`/admin/products/${id}`, payload)).data,

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  // Media
  uploadMedia: async (productId: string, formData: FormData): Promise<ProductMedia> => {
    const res = await apiClient.post<ProductMedia | ProductMedia[]>(
      `/admin/products/${productId}/media`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return Array.isArray(res.data) ? res.data[0] : res.data;
  },

  deleteMedia: async (productId: string, mediaId: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${productId}/media/${mediaId}`);
  },

  // Banners
  getBanners: async (): Promise<Banner[]> =>
    (await apiClient.get<Banner[]>('/admin/banners')).data,

  createBanner: async (formData: FormData): Promise<Banner> =>
    (
      await apiClient.post<Banner>('/admin/banners', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    ).data,

  updateBanner: async (id: string, formData: FormData): Promise<Banner> =>
    (
      await apiClient.put<Banner>(`/admin/banners/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    ).data,

  deleteBanner: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/banners/${id}`);
  },
};
