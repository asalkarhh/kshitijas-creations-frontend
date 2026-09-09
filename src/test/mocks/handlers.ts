import { http, HttpResponse } from 'msw';
import type { Product, Category, Banner, ProductMedia } from '../../types';

export const mockApiCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Handcrafted earrings made with beads and pearls.',
    imageUrl: 'http://localhost:8080/uploads/earrings.jpg',
    imageAlt: 'Handcrafted Earrings',
    isActive: true,
    active: true,
    displayOrder: 1,
    productCount: 4,
  },
  {
    id: 'cat-2',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Statement neckpieces for special occasions.',
    imageUrl: 'http://localhost:8080/uploads/necklaces.jpg',
    imageAlt: 'Handmade Necklaces',
    isActive: true,
    active: true,
    displayOrder: 2,
    productCount: 2,
  },
  {
    id: 'cat-3',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Beaded and wire bracelets.',
    imageUrl: 'http://localhost:8080/uploads/bracelets.jpg',
    imageAlt: 'Handmade Bracelets',
    isActive: true,
    active: true,
    displayOrder: 3,
    productCount: 3,
  },
];

export const mockApiProducts: Product[] = [
  {
    id: 'prod-fl-01',
    slug: 'floral-earrings',
    name: 'Floral Earrings',
    productCode: 'FL-01',
    price: 500,
    category: { id: 'cat-1', name: 'Earrings', slug: 'earrings' },
    isAvailable: true,
    available: true,
    isFeatured: true,
    featured: true,
    isNew: true,
    newArrival: true,
    instagramUrl: 'https://www.instagram.com/p/mock-post-1',
    media: [
      { id: 'm1', url: 'http://localhost:8080/uploads/floral-1.jpg', altText: 'Floral Earrings front view', isPrimary: true },
      { id: 'm2', url: 'http://localhost:8080/uploads/floral-2.jpg', altText: 'Floral Earrings side view', isPrimary: false },
      { id: 'm3', url: 'http://localhost:8080/uploads/floral-video.mp4', altText: 'Floral Earrings video showcase', isPrimary: false },
    ],
    shortDescription: 'Beautiful floral earrings with beads.',
    description: 'Very beautiful floral earrings handmade with love and precision.',
  },
  {
    id: 'prod-rose-02',
    slug: 'rose-earrings',
    name: 'Rose Gold Studs',
    productCode: 'RG-02',
    price: 350,
    category: { id: 'cat-1', name: 'Earrings', slug: 'earrings' },
    isAvailable: true,
    available: true,
    isFeatured: false,
    isNew: true,
    media: [
      { id: 'm4', url: 'http://localhost:8080/uploads/rose-1.jpg', altText: 'Rose Gold Studs', isPrimary: true },
    ],
    shortDescription: 'Delicate rose gold studs for daily wear.',
    description: 'Handcrafted studs finished with hypoallergenic backings.',
  },
  {
    id: 'prod-pearl-03',
    slug: 'pearl-necklace',
    name: 'Vintage Pearl Necklace',
    productCode: 'PN-03',
    price: 1200,
    category: { id: 'cat-2', name: 'Necklaces', slug: 'necklaces' },
    isAvailable: false,
    available: false,
    isFeatured: true,
    isNew: false,
    instagramUrl: 'https://www.instagram.com/p/mock-post-2',
    media: [
      { id: 'm5', url: 'http://localhost:8080/uploads/pearl-1.jpg', altText: 'Vintage Pearl Necklace', isPrimary: true },
    ],
    shortDescription: 'Classic freshwater pearl necklace.',
    description: 'Classic pearls woven with delicate gold wire.',
  },
  {
    id: 'prod-garnet-04',
    slug: 'garnet-bracelet',
    name: 'Garnet Bead Bracelet',
    productCode: 'GB-04',
    price: 450,
    category: { id: 'cat-3', name: 'Bracelets', slug: 'bracelets' },
    isAvailable: true,
    available: true,
    isFeatured: true,
    isNew: false,
    media: [
      { id: 'm6', url: 'http://localhost:8080/uploads/garnet-1.jpg', altText: 'Garnet Bead Bracelet', isPrimary: true },
    ],
    shortDescription: 'Deep maroon garnet beads on elastic string.',
    description: 'Hand-selected beads offering a subtle earthy warmth.',
  },
];

export const mockApiBanners: Banner[] = [
  {
    id: 'b1',
    title: 'Spring Collection',
    subtitle: 'Handcrafted floral treasures',
    desktopImageUrl: 'http://localhost:8080/uploads/banner-desktop.jpg',
    mobileImageUrl: 'http://localhost:8080/uploads/banner-mobile.jpg',
    imageAlt: 'Spring Collection Banner',
    buttonText: 'Shop Spring Pieces',
    targetUrl: '/products?category=earrings',
    targetLink: '/products?category=earrings',
  },
  {
    id: 'b2',
    title: 'Heirloom Keepsakes',
    subtitle: 'Made slowly to last generations',
    desktopImageUrl: 'http://localhost:8080/uploads/banner2-desktop.jpg',
    mobileImageUrl: 'http://localhost:8080/uploads/banner2-mobile.jpg',
    imageAlt: 'Heirloom Keepsakes Banner',
    buttonText: 'Explore Keepsakes',
    targetUrl: 'https://www.instagram.com/kshitijascreations',
    targetLink: 'https://www.instagram.com/kshitijascreations',
  },
];

export const handlers = [
  // GET /api/v1/public/categories
  http.get('http://localhost:8080/api/v1/public/categories', () => {
    return HttpResponse.json(mockApiCategories);
  }),

  // GET /api/v1/public/products
  http.get('http://localhost:8080/api/v1/public/products', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search')?.toLowerCase();
    const featured = url.searchParams.get('featured');
    const sort = url.searchParams.get('sort');
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '12', 10);

    let filtered = [...mockApiProducts];

    if (category) {
      filtered = filtered.filter((p) => p.category.slug === category);
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.shortDescription.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          (p.productCode && p.productCode.toLowerCase().includes(search)),
      );
    }

    if (featured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured || p.featured);
    }

    if (sort === 'priceAsc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'priceDesc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const content = filtered.slice(startIndex, startIndex + size);

    return HttpResponse.json({
      content,
      page,
      size,
      totalElements,
      totalPages,
    });
  }),

  // GET /api/v1/public/products/:slug
  http.get('http://localhost:8080/api/v1/public/products/:slug', ({ params }) => {
    const product = mockApiProducts.find((p) => p.slug === params.slug);
    if (!product) {
      return HttpResponse.json({ message: 'Product not found', code: 'PRODUCT_NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // GET /api/v1/public/banners
  http.get('http://localhost:8080/api/v1/public/banners', () => {
    return HttpResponse.json(mockApiBanners);
  }),

  // POST /api/v1/public/orders
  http.post('http://localhost:8080/api/v1/public/orders', async ({ request }) => {
    const body = (await request.json()) as {
      customerName?: string;
      mobileNumber?: string;
      addressLine?: string;
      items?: Array<{ productId: string; quantity: number }>;
    };

    if (!body.customerName || !body.mobileNumber || !body.addressLine) {
      return HttpResponse.json(
        {
          message: 'Validation failed',
          fieldErrors: {
            customerName: 'Full name is required',
            mobileNumber: 'Mobile number is required',
          },
        },
        { status: 400 },
      );
    }

    if (!body.items || body.items.length === 0) {
      return HttpResponse.json(
        {
          message: 'Order must contain at least one item',
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      orderNumber: 'KC-2026-00001',
      status: 'PLACED',
      subtotal: 1398.0,
      totalAmount: 1398.0,
      whatsappUrl: 'https://wa.me/919876543210?text=Hello%20KC-2026-00001',
      message: 'Order submitted successfully',
    });
  }),

  // POST /api/v1/auth/login
  http.post('http://localhost:8080/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token-xyz',
        expiresAt: '2026-12-31T23:59:59Z',
        admin: {
          id: 'admin-1',
          name: 'Kshitija Asalkar',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // GET /api/v1/auth/me
  http.get('http://localhost:8080/api/v1/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
      return HttpResponse.json({
        id: 'admin-1',
        name: 'Kshitija Asalkar',
        email: 'admin@example.com',
        role: 'ADMIN',
      });
    }
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),

  // GET /api/v1/admin/dashboard
  http.get('http://localhost:8080/api/v1/admin/dashboard', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      stats: {
        totalProducts: 42,
        availableProducts: 36,
        totalOrders: 128,
        placedOrders: 8,
        confirmedOrders: 14,
        completedOrders: 98,
        cancelledOrders: 8,
      },
      recentOrders: [
        {
          id: 'ord-1',
          orderNumber: 'KC-2026-00042',
          customerName: 'Priya Sharma',
          city: 'Pune',
          totalAmount: 1850,
          status: 'PLACED',
          createdAt: '2026-09-02T14:30:00.000Z',
        },
        {
          id: 'ord-2',
          orderNumber: 'KC-2026-00041',
          customerName: 'Ananya Deshmukh',
          city: 'Mumbai',
          totalAmount: 2400,
          status: 'CONFIRMED',
          createdAt: '2026-09-01T10:15:00.000Z',
        },
        {
          id: 'ord-3',
          orderNumber: 'KC-2026-00040',
          customerName: 'Rohan Patil',
          city: 'Vita',
          totalAmount: 950,
          status: 'COMPLETED',
          createdAt: '2026-08-30T16:45:00.000Z',
        },
      ],
    });
  }),

  // GET /api/v1/admin/categories
  http.get('http://localhost:8080/api/v1/admin/categories', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockApiCategories);
  }),

  // POST /api/v1/admin/categories
  http.post('http://localhost:8080/api/v1/admin/categories', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      displayOrder?: number;
      active?: boolean;
    };
    if (!body.name) {
      return HttpResponse.json({ message: 'Category name is required' }, { status: 400 });
    }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: body.name,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      description: body.description || '',
      displayOrder: body.displayOrder ?? 0,
      isActive: body.active ?? true,
      active: body.active ?? true,
      productCount: 0,
    };
    return HttpResponse.json(newCat, { status: 201 });
  }),

  // PUT /api/v1/admin/categories/:id
  http.put('http://localhost:8080/api/v1/admin/categories/:id', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      displayOrder?: number;
      active?: boolean;
    };
    const cat = mockApiCategories.find((c) => c.id === params.id);
    if (!cat) {
      return HttpResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    return HttpResponse.json({
      ...cat,
      name: body.name ?? cat.name,
      description: body.description ?? cat.description,
      displayOrder: body.displayOrder ?? cat.displayOrder,
      isActive: body.active ?? cat.isActive,
      active: body.active ?? cat.active,
    });
  }),

  // DELETE /api/v1/admin/categories/:id
  http.delete('http://localhost:8080/api/v1/admin/categories/:id', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/v1/admin/products
  http.get('http://localhost:8080/api/v1/admin/products', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const search = url.searchParams.get('search')?.toLowerCase();
    const available = url.searchParams.get('available');
    const featured = url.searchParams.get('featured');
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);

    let filtered = [...mockApiProducts];

    if (categoryId) {
      filtered = filtered.filter((p) => p.category.id === categoryId);
    }
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          (p.productCode && p.productCode.toLowerCase().includes(search)),
      );
    }
    if (available !== null && available !== undefined && available !== '') {
      const isAvail = available === 'true';
      filtered = filtered.filter((p) => (p.isAvailable ?? p.available) === isAvail);
    }
    if (featured !== null && featured !== undefined && featured !== '') {
      const isFeat = featured === 'true';
      filtered = filtered.filter((p) => (p.isFeatured ?? p.featured) === isFeat);
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const content = filtered.slice(startIndex, startIndex + size);

    return HttpResponse.json({
      content,
      page,
      size,
      totalElements,
      totalPages,
    });
  }),

  // GET /api/v1/admin/products/:id
  http.get('http://localhost:8080/api/v1/admin/products/:id', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const product = mockApiProducts.find((p) => p.id === params.id || p.slug === params.id);
    if (!product) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // POST /api/v1/admin/products
  http.post('http://localhost:8080/api/v1/admin/products', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as {
      name?: string;
      productCode?: string;
      categoryId?: string;
      price?: number;
      description?: string;
    };

    if (body.productCode === 'DUPLICATE-CODE') {
      return HttpResponse.json(
        {
          message: 'Product code already exists',
          fieldErrors: { productCode: 'Product code must be unique' },
        },
        { status: 400 },
      );
    }

    const created = {
      id: `prod-${Date.now()}`,
      slug: (body.name || 'product').toLowerCase().replace(/\s+/g, '-'),
      name: body.name || 'New Product',
      productCode: body.productCode || 'PR-99',
      price: body.price ?? 500,
      category: mockApiCategories[0],
      isAvailable: true,
      available: true,
      isFeatured: false,
      featured: false,
      isNew: true,
      media: [],
      shortDescription: 'Short description',
      description: body.description || 'Full description',
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  // PUT /api/v1/admin/products/:id
  http.put('http://localhost:8080/api/v1/admin/products/:id', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    const existing = mockApiProducts.find((p) => p.id === params.id);
    if (!existing) {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return HttpResponse.json({
      ...existing,
      ...body,
      isAvailable: (body.available as boolean | undefined) ?? existing.isAvailable,
      isFeatured: (body.featured as boolean | undefined) ?? existing.isFeatured,
    });
  }),

  // DELETE /api/v1/admin/products/:id
  http.delete('http://localhost:8080/api/v1/admin/products/:id', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/v1/admin/products/:productId/media
  http.post('http://localhost:8080/api/v1/admin/products/:productId/media', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const mediaItem: ProductMedia = {
      id: `media-${Date.now()}`,
      url: 'http://localhost:8080/uploads/uploaded-preview.jpg',
      altText: 'Uploaded media preview',
      isPrimary: true,
      displayOrder: 1,
    };
    return HttpResponse.json(mediaItem, { status: 201 });
  }),

  // DELETE /api/v1/admin/products/:productId/media/:mediaId
  http.delete('http://localhost:8080/api/v1/admin/products/:productId/media/:mediaId', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/v1/admin/banners
  http.get('http://localhost:8080/api/v1/admin/banners', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockApiBanners);
  }),

  // POST /api/v1/admin/banners
  http.post('http://localhost:8080/api/v1/admin/banners', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const newBanner = {
      id: `banner-${Date.now()}`,
      title: 'Navratri Festive Specials',
      subtitle: 'Celebrate with handcrafted mirror jewelry',
      buttonText: 'Explore Collection',
      targetLink: '/products',
      targetUrl: '/products',
      desktopImageUrl: 'http://localhost:8080/uploads/new-banner-desktop.jpg',
      mobileImageUrl: 'http://localhost:8080/uploads/new-banner-mobile.jpg',
      imageAlt: 'Navratri Festive Specials banner',
      startAt: null,
      endAt: null,
      displayOrder: 1,
      active: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(newBanner, { status: 201 });
  }),

  // PUT /api/v1/admin/banners/:id
  http.put('http://localhost:8080/api/v1/admin/banners/:id', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const existing = mockApiBanners.find((b) => b.id === params.id) || mockApiBanners[0];
    const updated = {
      ...existing,
      title: 'Spring Artisan Collection',
      isActive: true,
      active: true,
    };
    return HttpResponse.json(updated);
  }),

  // DELETE /api/v1/admin/banners/:id
  http.delete('http://localhost:8080/api/v1/admin/banners/:id', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/v1/admin/orders
  http.get('http://localhost:8080/api/v1/admin/orders', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '10', 10);

    const mockOrders = [
      {
        id: 'ord-1',
        orderNumber: 'KC-2026-00042',
        customerName: 'Priya Sharma',
        mobileNumber: '9876543210',
        maskedMobile: '+91 98*** **210',
        city: 'Pune',
        itemCount: 3,
        totalAmount: 1850,
        status: 'PLACED',
        createdAt: '2026-09-02T14:30:00.000Z',
      },
      {
        id: 'ord-2',
        orderNumber: 'KC-2026-00041',
        customerName: 'Ananya Deshmukh',
        mobileNumber: '9812345678',
        maskedMobile: '+91 98*** **678',
        city: 'Mumbai',
        itemCount: 2,
        totalAmount: 2400,
        status: 'CONFIRMED',
        createdAt: '2026-09-01T10:15:00.000Z',
      },
      {
        id: 'ord-3',
        orderNumber: 'KC-2026-00040',
        customerName: 'Rohan Patil',
        mobileNumber: '9765432109',
        maskedMobile: '+91 97*** **109',
        city: 'Vita',
        itemCount: 2,
        totalAmount: 950,
        status: 'COMPLETED',
        createdAt: '2026-08-30T16:45:00.000Z',
      },
    ];

    let filtered = [...mockOrders];
    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.mobileNumber.includes(search),
      );
    }
    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = filtered.slice(page * size, (page + 1) * size);

    return HttpResponse.json({
      content,
      page,
      size,
      totalElements,
      totalPages,
    });
  }),

  // GET /api/v1/admin/orders/:id
  http.get('http://localhost:8080/api/v1/admin/orders/:id', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (params.id === 'missing-order-id') {
      return HttpResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id: params.id || 'ord-1',
      orderNumber: 'KC-2026-00042',
      status: 'PLACED',
      customerName: 'Priya Sharma',
      mobileNumber: '9876543210',
      addressLine: 'Flat 402, Lotus Residency, Baner Road',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411045',
      customerNote: 'Please wrap carefully as a gift.',
      subtotal: 1850,
      totalAmount: 1850,
      createdAt: '2026-09-02T14:30:00.000Z',
      updatedAt: '2026-09-02T14:30:00.000Z',
      items: [
        {
          id: 'oi-1',
          productId: 'prod-fl-01',
          productName: 'Floral Earrings',
          productCode: 'FL-01',
          imageUrl: 'http://localhost:8080/uploads/floral-1.jpg',
          price: 500,
          quantity: 1,
          lineTotal: 500,
        },
        {
          id: 'oi-2',
          productId: 'prod-rose-02',
          productName: 'Rose Gold Studs',
          productCode: 'RG-02',
          imageUrl: 'http://localhost:8080/uploads/rose-1.jpg',
          price: 350,
          quantity: 1,
          lineTotal: 350,
        },
        {
          id: 'oi-3',
          productId: 'prod-pearl-03',
          productName: 'Vintage Pearl Necklace',
          productCode: 'PN-03',
          imageUrl: 'http://localhost:8080/uploads/pearl-1.jpg',
          price: 1000,
          quantity: 1,
          lineTotal: 1000,
        },
      ],
    });
  }),

  // PATCH /api/v1/admin/orders/:id/status
  http.patch('http://localhost:8080/api/v1/admin/orders/:id/status', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { status: string };

    if (body.status === 'CONFLICT') {
      return HttpResponse.json({ message: 'Order state conflict' }, { status: 409 });
    }

    return HttpResponse.json({
      id: params.id,
      orderNumber: 'KC-2026-00042',
      status: body.status,
      customerName: 'Priya Sharma',
      mobileNumber: '9876543210',
      addressLine: 'Flat 402, Lotus Residency, Baner Road',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411045',
      subtotal: 1850,
      totalAmount: 1850,
      createdAt: '2026-09-02T14:30:00.000Z',
      updatedAt: new Date().toISOString(),
      items: [],
    });
  }),
];


