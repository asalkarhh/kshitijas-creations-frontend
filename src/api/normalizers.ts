import type { AdminOrderDetail, Banner, Category, Product, ProductMedia } from '../types';

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord =>
  value !== null && typeof value === 'object' ? (value as ApiRecord) : {};

const asString = (value: unknown, fallback = ''): string =>
  value === null || value === undefined ? fallback : String(value);

export const normalizeCategory = (value: unknown): Category => {
  const category = asRecord(value);
  const active = category.isActive ?? category.active;
  return {
    ...category,
    id: asString(category.id),
    slug: asString(category.slug),
    name: asString(category.name),
    description: asString(category.description),
    displayOrder: Number(category.displayOrder ?? 0),
    ...(typeof active === 'boolean' ? { active, isActive: active } : {}),
  } as Category;
};

export const normalizeMedia = (value: unknown): ProductMedia => {
  const media = asRecord(value);
  return {
    ...media,
    id: asString(media.id),
    url: asString(media.url),
    altText: asString(media.altText),
    isPrimary: Boolean(media.isPrimary ?? media.primaryMedia),
    mediaType: media.mediaType ? asString(media.mediaType) : 'IMAGE',
    displayOrder: Number(media.displayOrder ?? 0),
  } as ProductMedia;
};

export const normalizeProduct = (value: unknown): Product => {
  const product = asRecord(value);
  const category = normalizeCategory(product.category);
  const media = Array.isArray(product.media) ? product.media.map(normalizeMedia) : [];
  const available = Boolean(product.isAvailable ?? product.available);
  const featured = Boolean(product.isFeatured ?? product.featured);

  return {
    ...product,
    id: asString(product.id),
    productCode: asString(product.productCode),
    slug: asString(product.slug),
    name: asString(product.name),
    shortDescription: asString(product.shortDescription),
    description: asString(product.description),
    price: Number(product.price ?? 0),
    displayOrder: Number(product.displayOrder ?? 0),
    categoryId: asString(product.categoryId ?? category.id),
    category,
    media,
    available,
    isAvailable: available,
    featured,
    isFeatured: featured,
  } as Product;
};

export const normalizeBanner = (value: unknown): Banner => {
  const banner = asRecord(value);
  const active = banner.isActive ?? banner.active;
  return {
    ...banner,
    id: asString(banner.id),
    desktopImageUrl: asString(banner.desktopImageUrl),
    mobileImageUrl: banner.mobileImageUrl ? asString(banner.mobileImageUrl) : undefined,
    title: asString(banner.title),
    subtitle: banner.subtitle ? asString(banner.subtitle) : undefined,
    buttonText: banner.buttonText ? asString(banner.buttonText) : undefined,
    targetUrl: asString(banner.targetUrl ?? banner.targetLink),
    targetLink: asString(banner.targetLink ?? banner.targetUrl),
    startAt: banner.startAt ? asString(banner.startAt) : (banner.startDate ? asString(banner.startDate) : null),
    endAt: banner.endAt ? asString(banner.endAt) : (banner.endDate ? asString(banner.endDate) : null),
    displayOrder: Number(banner.displayOrder ?? 0),
    ...(typeof active === 'boolean' ? { active, isActive: active } : {}),
  } as Banner;
};

export const normalizeAdminOrder = (value: unknown): AdminOrderDetail => {
  const order = asRecord(value);
  const items = Array.isArray(order.items)
    ? order.items.map((item) => {
        const orderItem = asRecord(item);
        return {
          ...orderItem,
          id: asString(orderItem.id),
          productId: asString(orderItem.productId),
          productName: asString(orderItem.productName),
          productCode: asString(orderItem.productCode),
          imageUrl: asString(orderItem.imageUrl ?? orderItem.productImageUrl),
          price: Number(orderItem.price ?? orderItem.unitPrice ?? 0),
          unitPrice: Number(orderItem.unitPrice ?? orderItem.price ?? 0),
          quantity: Number(orderItem.quantity ?? 0),
          lineTotal: Number(orderItem.lineTotal ?? 0),
        };
      })
    : [];
  return { ...order, id: asString(order.id), items } as AdminOrderDetail;
};
