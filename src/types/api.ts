export interface ApiError {
  status: number;
  message: string;
  code?: string;
  requestId?: string;
  fieldErrors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OrderItemRequest {
  productId: string | number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  mobileNumber: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  customerNote?: string;
  items: OrderItemRequest[];
}

export interface CreateOrderResponse {
  orderId?: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  totalAmount: number;
  whatsappUrl?: string;
  whatsappMessage?: string;
  message?: string;
}

export interface OrderItemDetail {
  id?: string;
  productId?: string;
  productName: string;
  productCode?: string;
  imageUrl?: string;
  price: number;
  unitPrice?: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: 'PLACED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;
  customerName: string;
  mobileNumber: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  customerNote?: string;
  subtotal: number;
  totalAmount: number;
  total?: number;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemDetail[];
  reviews?: { id: string; productId: string | number; productName: string; rating: number; text?: string; reviewerName: string; reviewerCity: string; published: boolean }[];
  reviewRating?: number;
  reviewText?: string;
  reviewerName?: string;
  reviewerCity?: string;
  reviewProductId?: string | number;
  reviewPublished?: boolean;
  reviewUsed?: boolean;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  mobileNumber: string;
  maskedMobile?: string;
  city: string;
  itemCount: number;
  totalAmount: number;
  status: 'PLACED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;
  createdAt: string;
}

export interface AdminOrderFilterParams {
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}


export interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  token?: string;
  expiresAt?: string;
  admin?: AdminUser;
  user?: AdminUser;
}

export interface DashboardStats {
  totalProducts: number;
  availableProducts: number;
  totalOrders: number;
  placedOrders: number;
  newOrders?: number;
  confirmedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface DashboardRecentOrder {
  id?: string | number;
  orderNumber: string;
  customerName: string;
  city: string;
  totalAmount?: number;
  total?: number;
  status: 'PLACED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;
  createdAt: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentOrders: DashboardRecentOrder[];
}

