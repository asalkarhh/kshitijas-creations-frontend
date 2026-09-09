export interface ProductMedia {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  mediaType?: 'IMAGE' | 'VIDEO' | string;
  displayOrder?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  isActive?: boolean;
  active?: boolean;
  displayOrder?: number;
  productCount?: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  productCode?: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  categoryId?: string;
  category: Pick<Category, 'id' | 'slug' | 'name'>;
  media: ProductMedia[];
  isAvailable: boolean;
  available?: boolean;
  isFeatured: boolean;
  featured?: boolean;
  isNew?: boolean;
  newArrival?: boolean;
  instagramUrl?: string;
  displayOrder?: number;
  createdAt?: string;
}

export interface Banner {
  id: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  targetLink?: string;
  targetUrl?: string;
  displayOrder?: number;
  active?: boolean;
  isActive?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCategoryRequest {
  name: string;
  description?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface AdminProductRequest {
  categoryId: string;
  name: string;
  productCode: string;
  shortDescription?: string;
  description: string;
  price: number;
  available?: boolean;
  featured?: boolean;
  instagramUrl?: string;
  displayOrder?: number;
}

export interface AdminProductFilterParams {
  search?: string;
  categoryId?: string | number;
  available?: boolean | string;
  featured?: boolean | string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface BannerFilterParams {
  active?: boolean | string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}
